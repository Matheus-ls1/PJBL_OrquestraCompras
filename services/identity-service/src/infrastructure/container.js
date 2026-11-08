import { ObjectId } from 'mongodb';
import { createBcryptPasswordHasher } from './security/bcrypt-password-hasher.js';
import { createJwtTokenService } from './security/jwt-token-service.js';
import { createMongoUserRepository } from './persistence/mongo-user-repository.js';

export function createIdentityDependencies(overrides = {}) {
  const config = { mongoUri: process.env.MONGODB_URI, mongoDatabase: process.env.MONGODB_DATABASE || 'db_identity', mongoMaxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE || 10), jwtSecret: process.env.JWT_SECRET, jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m', bcryptRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 12) };
  return { userRepository: overrides.userRepository || createMongoUserRepository({ uri: config.mongoUri, databaseName: config.mongoDatabase, maxPoolSize: config.mongoMaxPoolSize }), passwordHasher: overrides.passwordHasher || createBcryptPasswordHasher(config.bcryptRounds), tokenService: overrides.tokenService || createJwtTokenService({ secret: config.jwtSecret, expiresIn: config.jwtExpiresIn }), clock: overrides.clock || (() => new Date()), idGenerator: overrides.idGenerator || (() => new ObjectId().toString()) };
}
