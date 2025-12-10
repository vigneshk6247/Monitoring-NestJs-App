import { Test, TestingModule } from '@nestjs/testing';
import { SecretsService } from './secrets.service';
import { K8sService } from '../../core/k8s/k8s.service';
import { NotFoundException } from '@nestjs/common';

describe('SecretsService', () => {
  let service: SecretsService;
  let k8sService: any;

  beforeEach(async () => {
    k8sService = {
      coreV1Api: {
        readNamespacedSecret: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecretsService,
        {
          provide: K8sService,
          useValue: k8sService,
        },
      ],
    }).compile();

    service = module.get<SecretsService>(SecretsService);
  });

  describe('getSecretDetails', () => {
    it('should return decoded secret data', async () => {
      const mockSecret = {
        metadata: { name: 'test-secret', namespace: 'default' },
        data: {
          'test-key': Buffer.from('test-value').toString('base64'),
          'tls.crt': Buffer.from('certificate-content').toString('base64'),
        },
      };

      k8sService.coreV1Api.readNamespacedSecret.mockResolvedValue(mockSecret);

      const result = await service.getSecretDetails('default', 'test-secret');

      expect(result.data['test-key']).toBe('test-value');
      expect(result.data['tls.crt']).toBe('certificate-content');
      expect(k8sService.coreV1Api.readNamespacedSecret).toHaveBeenCalledWith({
        name: 'test-secret',
        namespace: 'default',
      });
    });

    it('should throw NotFoundException if secret not found', async () => {
      const error = { response: { statusCode: 404 } };
      k8sService.coreV1Api.readNamespacedSecret.mockRejectedValue(error);

      await expect(service.getSecretDetails('default', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
