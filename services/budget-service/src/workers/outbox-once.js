import 'dotenv/config';
import { dependencies } from '../infrastructure/container.js';
import { createAzureQueuePublisher } from '../infrastructure/messaging/azure-queue-publisher.js';
import { createOutboxPublisher } from '../application/features/publish-outbox/publish-outbox.js';

const batchSize = Number(process.env.OUTBOX_BATCH_SIZE || 20);
const timeoutMs = Number(process.env.OUTBOX_TIMEOUT_MS || 10000);
const maxTries = Number(process.env.OUTBOX_RETRY_MAX_TRIES || 3);
if (process.env.OUTBOX_PUBLISHER_SINGLE_INSTANCE !== 'true') {
  throw new Error('OUTBOX_PUBLISHER_SINGLE_INSTANCE=true é obrigatório nesta versão do publisher.');
}
const deps = dependencies();
const queuePublisher = createAzureQueuePublisher({
  connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
  accountUrl: process.env.AZURE_STORAGE_ACCOUNT_URL,
  queueName: process.env.AZURE_STORAGE_QUEUE_NAME || 'orcamentos-eventos',
  clientId: process.env.AZURE_CLIENT_ID,
  timeoutMs,
  maxTries
});

const publisher = createOutboxPublisher({ repository: deps.repository, queuePublisher, batchSize, logger: console });
try {
  const result = await publisher.runOnce();
  console.log(`Outbox: selecionados=${result.selected}, publicados=${result.published}, falhas=${result.failed}, ignorado=${result.skipped}`);
  if (result.failed) process.exitCode = 1;
} catch (error) {
  console.error(`Outbox: execução interrompida (${error.code || 'OUTBOX_RUN_FAILED'}).`);
  process.exitCode = 1;
}
