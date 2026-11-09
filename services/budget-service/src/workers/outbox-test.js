import 'dotenv/config';
import { dependencies } from '../infrastructure/container.js';
import { createAzureQueuePublisher } from '../infrastructure/messaging/azure-queue-publisher.js';
import { createOutboxPublisher } from '../application/features/publish-outbox/publish-outbox.js';
import { validateControlledOutboxTestConfig } from '../application/features/publish-outbox/outbox-test-config.js';

const eventId = validateControlledOutboxTestConfig(process.env);
const dryRun = process.argv.includes('--dry-run');

const deps = dependencies();
const queuePublisher = createAzureQueuePublisher({ connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING, queueName: process.env.AZURE_STORAGE_QUEUE_NAME, timeoutMs: Number(process.env.OUTBOX_TIMEOUT_MS || 10000), maxTries: Number(process.env.OUTBOX_RETRY_MAX_TRIES || 3) });
const publisher = createOutboxPublisher({ repository: deps.repository, queuePublisher, logger: console });
const result = await publisher.runOnce({ eventId, dryRun });
console.log(`Outbox teste: eventId=${eventId}; selecionados=${result.selected}; publicados=${result.published}; falhas=${result.failed}; dryRun=${dryRun}`);
if (!result.selected || result.failed) process.exitCode = 1;
