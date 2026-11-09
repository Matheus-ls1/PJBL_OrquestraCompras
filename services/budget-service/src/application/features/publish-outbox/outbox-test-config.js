import { validateOutboxEventId } from './publish-outbox.js';

export function validateControlledOutboxTestConfig(environment) {
  const eventId = validateOutboxEventId(environment.OUTBOX_TEST_EVENT_ID);
  if (environment.OUTBOX_PUBLISHER_SINGLE_INSTANCE !== 'true') throw new Error('OUTBOX_PUBLISHER_SINGLE_INSTANCE=true é obrigatório.');
  if (environment.AZURE_STORAGE_CONNECTION_STRING !== 'UseDevelopmentStorage=true') throw new Error('Modo de teste bloqueado: AZURE_STORAGE_CONNECTION_STRING deve ser UseDevelopmentStorage=true.');
  if (environment.AZURE_STORAGE_QUEUE_NAME !== 'orcamentos-eventos-teste') throw new Error('Modo de teste bloqueado: AZURE_STORAGE_QUEUE_NAME deve ser orcamentos-eventos-teste.');
  return eventId;
}
