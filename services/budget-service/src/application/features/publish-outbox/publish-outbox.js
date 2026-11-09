const maxQueueMessageBytes = 64 * 1024;

export function serializeEventoOrcamentoV1(event) {
  if (!event || event.tipo !== 'EventoOrcamentoV1' || typeof event.eventId !== 'string') {
    throw new Error('Evento de Outbox inválido: EventoOrcamentoV1 com eventId é obrigatório.');
  }
  const message = JSON.stringify(event);
  if (Buffer.byteLength(message, 'utf8') > maxQueueMessageBytes) {
    throw new Error('Evento de Outbox excede o limite de 64 KiB da Azure Storage Queue.');
  }
  return message;
}

const eventIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function normalizeOutboxUuid(value, field = 'UUID') {
  if (typeof value !== 'string' || !eventIdPattern.test(value)) throw new Error(`${field} deve ser um UUID válido.`);
  return value.toLowerCase();
}
export function validateOutboxEventId(eventId) {
  normalizeOutboxUuid(eventId, 'OUTBOX_TEST_EVENT_ID');
  return eventId;
}

const sanitizeMessage = value => String(value || 'Erro sem mensagem técnica.').slice(0, 500).replace(/((?:accountkey|sharedaccesssignature|sig|token|password|authorization)\s*[=:]\s*)[^;\s]+/gi, '$1***');
export function outboxErrorDiagnostic(error, stage) {
  return { stage, code: error?.code || 'OUTBOX_PUBLISH_FAILED', name: error?.name || 'Error', status: error?.statusCode || error?.status, message: sanitizeMessage(error?.message) };
}

export function createOutboxPublisher({ repository, queuePublisher, batchSize = 20, now = () => new Date(), logger = console }) {
  let running = false;

  return {
    async runOnce({ eventId, dryRun = false } = {}) {
      if (running) return { skipped: true, reason: 'PUBLISHER_ALREADY_RUNNING', selected: 0, published: 0, failed: 0 };
      running = true;
      try {
        let entries;
        try {
          const pending = eventId ? (() => { validateOutboxEventId(eventId); return repository.getPendingOutboxById(eventId); })() : repository.listPendingOutbox(batchSize);
          entries = eventId ? await pending.then(entry => entry ? [entry] : []) : await pending;
        } catch (error) {
          logger.error?.(outboxErrorDiagnostic(error, 'SELECT_OUTBOX'), 'Falha ao selecionar eventos pendentes da Outbox.');
          throw error;
        }
        const result = { skipped: false, selected: entries.length, published: 0, failed: 0 };
        if (dryRun) return { ...result, dryRun: true, entries: entries.map(entry => ({ eventId: entry.id, type: entry.tipo, occurredAt: entry.ocorridoEm })) };

        for (const entry of entries) {
          let stage = 'SERIALIZE_EVENT';
          try {
            const event = typeof entry.payload === 'string' ? JSON.parse(entry.payload) : entry.payload;
            const persistedEventId = normalizeOutboxUuid(entry.id, 'id da Outbox');
            const payloadEventId = normalizeOutboxUuid(event?.eventId, 'eventId do payload');
            if (payloadEventId !== persistedEventId) throw new Error('Evento de Outbox inválido: eventId não corresponde ao registro.');
            const message = serializeEventoOrcamentoV1(event);
            stage = 'SEND_QUEUE';
            await queuePublisher.publish(message, { eventId: entry.id, tipo: entry.tipo });
            stage = 'CONFIRM_SQL';
            const marked = await repository.markOutboxPublished(entry.id, now());
            if (!marked) throw new Error('Evento publicado, mas não foi possível confirmar publicado_em.');
            result.published++;
            logger.info?.({ eventId: entry.id, type: entry.tipo }, 'Evento de Outbox publicado.');
          } catch (error) {
            result.failed++;
            logger.error?.({ eventId: entry.id, type: entry.tipo, ...outboxErrorDiagnostic(error, stage) }, 'Falha ao publicar evento de Outbox; ele permanecerá pendente.');
          }
        }
        return result;
      } finally {
        running = false;
      }
    }
  };
}
