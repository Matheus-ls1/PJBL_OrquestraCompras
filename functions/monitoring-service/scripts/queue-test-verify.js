import { MongoClient } from 'mongodb';
import { loadExistingSyntheticEvent, loadSafeQueueTestSettings } from './queue-test-support.js';

const settings = await loadSafeQueueTestSettings();
const event = await loadExistingSyntheticEvent();
const client = new MongoClient(settings.MONGODB_MONITORING_URI);
try {
  await client.connect();
  const count = await client.db(settings.MONGODB_MONITORING_DATABASE).collection('eventos_processados').countDocuments({ eventId: event.eventId });
  console.log(`Verificação somente leitura: eventId=${event.eventId}; registros=${count}`);
  process.exitCode = count === 1 ? 0 : 2;
} finally { await client.close(); }
