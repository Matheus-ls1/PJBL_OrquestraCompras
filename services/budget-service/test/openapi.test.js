import test from 'node:test';
import assert from 'node:assert/strict';
import { openApiDocument } from '../src/api/contracts/openapi.js';

test('OpenAPI documenta body JSON e Bearer no cadastro', () => {
  const operation = openApiDocument.paths['/api/v1/orcamentos'].post;
  assert.equal(openApiDocument.components.securitySchemes.bearerAuth.scheme, 'bearer');
  assert.deepEqual(operation.security, [{ bearerAuth: [] }]);
  assert.equal(operation.requestBody.required, true);
  const schema = operation.requestBody.content['application/json'].schema;
  assert.deepEqual(schema.required, ['nomeProjeto', 'valorLimite']);
  assert.equal(schema.properties.itensDesejados.items.type, 'object');
  assert.equal(schema.properties.lojasAutorizadas.items.type, 'object');
  assert.ok(schema.example.nomeProjeto);
});

test('OpenAPI documenta JSON obrigatório para atualização', () => {
  const operation = openApiDocument.paths['/api/v1/orcamentos/{id}'].put;
  assert.equal(operation.requestBody.required, true);
  assert.ok(operation.requestBody.content['application/json']);
  assert.deepEqual(operation.requestBody.content['application/json'].schema.example, { valorLimite: 6000 });
  assert.equal(operation.parameters[0].name, 'if-match');
});

test('OpenAPI declara todos os parâmetros obrigatórios das rotas aninhadas', () => {
  const paths = openApiDocument.paths;
  const expected = {
    '/api/v1/orcamentos/{id}': ['id'],
    '/api/v1/orcamentos/{id}/status': ['id'],
    '/api/v1/orcamentos/{id}/itens': ['id'],
    '/api/v1/orcamentos/{id}/itens/{childId}': ['id', 'childId'],
    '/api/v1/orcamentos/{id}/lojas': ['id'],
    '/api/v1/orcamentos/{id}/lojas/{childId}': ['id', 'childId']
  };
  for (const [path, names] of Object.entries(expected)) {
    const parameters = paths[path].parameters || [];
    assert.deepEqual(parameters.map(parameter => parameter.name), names, path);
    for (const parameter of parameters) {
      assert.equal(parameter.in, 'path');
      assert.equal(parameter.required, true);
      assert.equal(parameter.schema.type, 'string');
    }
  }
  assert.equal(paths['/api/v1/orcamentos/{id}'].put.parameters[0].name, 'if-match');
  assert.equal(paths['/api/v1/orcamentos/{id}'].delete.parameters[0].name, 'if-match');
});
