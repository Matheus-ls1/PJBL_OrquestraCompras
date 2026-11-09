import { QueueServiceClient } from '@azure/storage-queue';
import { loadOrCreateSyntheticEvent, loadSafeQueueTestSettings } from './queue-test-support.js';

const settings = await loadSafeQueueTestSettings();
const event = await loadOrCreateSyntheticEvent();
const queue = QueueServiceClient.fromConnectionString(settings.AzureWebJobsStorage).getQueueClient(settings.ORCAMENTOS_EVENTOS_QUEUE_NAME);
await queue.sendMessage(JSON.stringify(event));
console.log(`Evento sintético enviado ao Azurite: eventId=${event.eventId}`);
