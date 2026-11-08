export class InMemoryUserRepository {
  constructor() { this.users = new Map(); }
  async ping() { return true; }
  async findByEmail(email) { return [...this.users.values()].find((user) => user.email === email) || null; }
  async findById(id) { return this.users.get(String(id)) || null; }
  async create(user) { if (await this.findByEmail(user.email)) { const error = new Error(); error.code = 'DUPLICATE_EMAIL'; throw error; } this.users.set(String(user.id), user); }
  async updateLastLogin(id, now) { const user = await this.findById(id); if (user) { user.ultimoLogin = now; user.atualizadoEm = now; } }
  async updateProfile(id, update) { const user = await this.findById(id); if (!user) return null; if (update.email && (await this.findByEmail(update.email))?.id !== user.id) { const error = new Error(); error.code = 'DUPLICATE_EMAIL'; throw error; } Object.assign(user, update); return user; }
  async changePassword(id, senhaHash, now) { const user = await this.findById(id); Object.assign(user, { senhaHash, revogacaoEm: now, atualizadoEm: now }); }
  async requestAccountClosure(id, expected, next, now, event) { const user = await this.findById(id); if (!user || user.statusConta !== expected) return null; Object.assign(user, { statusConta: next, revogacaoEm: now, atualizadoEm: now }); user.outboxPendente.push(event); return user; }
}
