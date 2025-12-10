import { Injectable, Logger } from '@nestjs/common';
import { K8sService } from '../../core/k8s/k8s.service';

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  constructor(private readonly k8sService: K8sService) {}

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
}
