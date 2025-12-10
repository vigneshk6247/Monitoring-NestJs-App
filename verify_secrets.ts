import { SecretsService } from './src/modules/secrets/secrets.service';
import { Logger } from '@nestjs/common';

// Mock Logger to avoid clutter
Logger.prototype.log = () => {};
Logger.prototype.error = console.error;

async function verify() {
  console.log('Starting verification...');

  const mockK8sService = {
    coreV1Api: {
      readNamespacedSecret: async ({ name, namespace }) => {
        if (name === 'test-secret' && namespace === 'default') {
          return {
            metadata: { name: 'test-secret', namespace: 'default' },
            data: {
              'test-key': Buffer.from('test-value').toString('base64'),
              'tls.crt': Buffer.from('certificate-content').toString('base64'),
            },
          };
        }
        throw { response: { statusCode: 404 } };
      },
    },
  };

  const service = new SecretsService(mockK8sService as any);

  try {
    const result = await service.getSecretDetails('default', 'test-secret');
    console.log('Result:', JSON.stringify(result, null, 2));

    if (result.data['test-key'] === 'test-value' && result.data['tls.crt'] === 'certificate-content') {
      console.log('SUCCESS: Secret decoded correctly.');
    } else {
        console.error('FAILURE: Secret decoding failed.');
        process.exit(1);
    }
  } catch (error) {
    console.error('FAILURE: Unexpected error', error);
    process.exit(1);
  }

  try {
      await service.getSecretDetails('default', 'missing');
      console.error('FAILURE: Should have thrown 404');
      process.exit(1);
  } catch (e) {
      if (e.status === 404 || e.message.includes('not found')) {
          console.log('SUCCESS: 404 handled correctly.');
      } else {
          console.error('FAILURE: Wrong error for missing secret', e);
          process.exit(1);
      }
  }
}

verify();
