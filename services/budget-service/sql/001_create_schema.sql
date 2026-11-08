CREATE TABLE orcamentos (
  id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY, usuario_id NVARCHAR(64) NOT NULL,
  nome_projeto NVARCHAR(120) NOT NULL, valor_limite DECIMAL(19,4) NOT NULL CHECK (valor_limite > 0),
  status NVARCHAR(30) NOT NULL, versao INT NOT NULL DEFAULT 1,
  criado_em DATETIME2 NOT NULL, atualizado_em DATETIME2 NOT NULL, ultima_tentativa_em DATETIME2 NULL,
  CONSTRAINT ck_orcamentos_status CHECK (status IN ('RASCUNHO','MONITORANDO','PAUSADO','ALERTA_DISPARADO','CONCLUIDO','EXPIRADO'))
);
CREATE INDEX ix_orcamentos_usuario_status ON orcamentos(usuario_id, status);
CREATE TABLE itens_desejados (id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY, orcamento_id UNIQUEIDENTIFIER NOT NULL, categoria NVARCHAR(80) NOT NULL, descricao_requisitos NVARCHAR(1000) NOT NULL, opcoes_aceitas NVARCHAR(MAX) NOT NULL, obrigatorio BIT NOT NULL, CONSTRAINT fk_itens_orcamento FOREIGN KEY (orcamento_id) REFERENCES orcamentos(id) ON DELETE CASCADE);
CREATE TABLE lojas_autorizadas (id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY, orcamento_id UNIQUEIDENTIFIER NOT NULL, nome NVARCHAR(120) NOT NULL, url_base NVARCHAR(2048) NOT NULL, confiavel BIT NOT NULL, ativa BIT NOT NULL, CONSTRAINT fk_lojas_orcamento FOREIGN KEY (orcamento_id) REFERENCES orcamentos(id) ON DELETE CASCADE);
CREATE TABLE auditoria_orcamento (id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY, orcamento_id UNIQUEIDENTIFIER NOT NULL, usuario_id NVARCHAR(64) NOT NULL, acao NVARCHAR(80) NOT NULL, antes NVARCHAR(MAX) NULL, depois NVARCHAR(MAX) NULL, data_evento DATETIME2 NOT NULL, CONSTRAINT fk_auditoria_orcamento FOREIGN KEY (orcamento_id) REFERENCES orcamentos(id));
CREATE TABLE eventos_outbox (id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY, orcamento_id UNIQUEIDENTIFIER NOT NULL, tipo NVARCHAR(100) NOT NULL, payload NVARCHAR(MAX) NOT NULL, ocorrido_em DATETIME2 NOT NULL, publicado_em DATETIME2 NULL, CONSTRAINT fk_outbox_orcamento FOREIGN KEY (orcamento_id) REFERENCES orcamentos(id));
CREATE INDEX ix_outbox_pendente ON eventos_outbox(publicado_em, ocorrido_em);
