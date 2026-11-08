-- Mantém auditoria e eventos pendentes disponíveis após a remoção lógica.
ALTER TABLE orcamentos ADD excluido_em DATETIME2 NULL;
CREATE INDEX ix_orcamentos_ativos_usuario ON orcamentos(usuario_id, excluido_em, atualizado_em);
