import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { K8sService } from '../../core/k8s/k8s.service';
import axios from 'axios';

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  constructor(
    private readonly k8sService: K8sService,
    private readonly configService: ConfigService,
  ) {}

  async findAll(namespace?: string) {
    try {
      let response;
      if (namespace) {
        response = await this.k8sService.coreV1Api.listNamespacedPod({ namespace });
      } else {
        response = await this.k8sService.coreV1Api.listPodForAllNamespaces();
      }

      const imageMap = new Map<string, any>();

      response.items.forEach((pod) => {
        pod.spec!.containers.forEach((container) => {
          if (!imageMap.has(container.image!)) {
            const [repository, tag = 'latest'] = container.image!.split(':');
            imageMap.set(container.image!, {
              image: container.image,
              repository,
              tag,
              usedBy: [],
            });
          }
          imageMap.get(container.image!)!.usedBy.push({
            pod: pod.metadata!.name,
            namespace: pod.metadata!.namespace,
            container: container.name,
          });
        });
      });

      return {
        images: Array.from(imageMap.values()),
        count: imageMap.size,
      };
    } catch (error) {
      this.logger.error('Failed to list images', error);
      throw error;
    }
  }

  async getImageDetails(imageName: string) {
    try {
      const allImages = await this.findAll();
      const image = allImages.images.find((img: any) => img.image === imageName);

      if (!image) {
        return {
          image: imageName,
          found: false,
          message: 'Image not currently in use in any pod',
        };
      }

      return {
        ...image,
        found: true,
        podCount: image.usedBy.length,
      };
    } catch (error) {
      this.logger.error(`Failed to get image details for ${imageName}`, error);
      throw error;
    }
  }

  async getImagesByNamespace(namespace: string) {
    try {
      return this.findAll(namespace);
    } catch (error) {
      this.logger.error(`Failed to list images for namespace ${namespace}`, error);
      throw error;
    }
  }

  async getDockerHubImages() {
    try {
      // Get Docker Hub credentials from environment
      const dockerUsername = this.configService.get<string>('DOCKER_USERNAME');
      const dockerPassword = this.configService.get<string>('DOCKER_PASSWORD');
      
      if (!dockerUsername) {
        throw new Error('DOCKER_USERNAME not configured in environment variables');
      }
      
      this.logger.log(`Fetching Docker Hub repositories for user: ${dockerUsername}`);
      
      let authToken = '';
      
      // Authenticate with Docker Hub if credentials are provided
      if (dockerUsername && dockerPassword) {
        try {
          this.logger.log('Authenticating with Docker Hub...');
          const loginResponse = await axios.post('https://hub.docker.com/v2/users/login/', {
            username: dockerUsername,
            password: dockerPassword,
          });
          authToken = loginResponse.data.token;
          this.logger.log('Docker Hub authentication successful');
        } catch (authError) {
          this.logger.warn('Docker Hub authentication failed, proceeding with unauthenticated requests', authError.message);
        }
      }
      
      // Prepare headers with authentication token if available
      const headers = authToken ? { Authorization: `JWT ${authToken}` } : {};
      
      // Fetch all repositories for the user
      const reposUrl = `https://hub.docker.com/v2/repositories/${dockerUsername}/?page_size=100`;
      const reposResponse = await axios.get(reposUrl, { headers });
      
      const repositories = reposResponse.data.results || [];
      
      // Fetch tags for each repository
      const imagesWithTags = await Promise.all(
        repositories.map(async (repo: any) => {
          try {
            const tagsUrl = `https://hub.docker.com/v2/repositories/${dockerUsername}/${repo.name}/tags/?page_size=25`;
            const tagsResponse = await axios.get(tagsUrl, { headers });
            
            return {
              name: repo.name,
              description: repo.description,
              pullCount: repo.pull_count,
              starCount: repo.star_count,
              isPrivate: repo.is_private,
              lastUpdated: repo.last_updated,
              fullName: `${dockerUsername}/${repo.name}`,
              tags: tagsResponse.data.results.map((tag: any) => ({
                name: tag.name,
                fullSize: tag.full_size,
                lastUpdated: tag.last_updated,
                lastUpdater: tag.last_updater_username,
                pullCommand: `docker pull ${dockerUsername}/${repo.name}:${tag.name}`,
              })),
            };
          } catch (error) {
            this.logger.warn(`Failed to fetch tags for ${repo.name}`, error.message);
            return {
              name: repo.name,
              description: repo.description,
              pullCount: repo.pull_count,
              starCount: repo.star_count,
              isPrivate: repo.is_private,
              lastUpdated: repo.last_updated,
              fullName: `${dockerUsername}/${repo.name}`,
              tags: [],
            };
          }
        })
      );
      
      return {
        username: dockerUsername,
        repositoryCount: repositories.length,
        repositories: imagesWithTags,
        authenticated: !!authToken,
      };
    } catch (error) {
      this.logger.error('Failed to fetch Docker Hub images', error);
      throw error;
    }
  }
}
