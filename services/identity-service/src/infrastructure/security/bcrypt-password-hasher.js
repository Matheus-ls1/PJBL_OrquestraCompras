import bcrypt from 'bcrypt';

export function createBcryptPasswordHasher(rounds) {
  return { hash: (password) => bcrypt.hash(password, rounds), compare: (password, hash) => bcrypt.compare(password, hash) };
}
