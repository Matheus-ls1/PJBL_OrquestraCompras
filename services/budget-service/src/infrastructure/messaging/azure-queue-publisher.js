import { DefaultAzureCredential } from '@azure/identity';
import { QueueServiceClient } from '@azure/storage-queue';

export function createAzureQueuePublisher({ connectionString, accountUrl, queueName = 'orcamentos-eventos', clientId, timeoutMs = 10000, maxTries = 3, queueClient }) {
  let client = queueClient;
  if (!client) {
    if (connectionString) client = QueueServiceClient.fromConnectionString(connectionString).getQueueClient(queueName);
    else {
      if (!accountUrl) throw new Error('AZURE_STORAGE_ACCOUNT_URL ou AZURE_STORAGE_CONNECTION_STRING é obrigatório para o publisher.');
      client = new QueueServiceClient(accountUrl, new DefaultAzureCredential(clientId ? { managedIdentityClientId: clientId } : undefined), { retryOptions: { maxTries, tryTimeoutInMs: timeoutMs } }).getQueueClient(queueName);
    }
  }

  return {
    async publish(message) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        await client.sendMessage(message, { abortSignal: controller.signal });
      } finally {
        clearTimeout(timer);
      }
    }
  };
}
