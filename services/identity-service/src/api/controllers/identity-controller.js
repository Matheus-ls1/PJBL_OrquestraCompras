import { registerUser } from '../../application/features/register-user/register-user.js';
import { loginUser } from '../../application/features/login-user/login-user.js';
import { getProfile } from '../../application/features/get-profile/get-profile.js';
import { updateProfile } from '../../application/features/update-profile/update-profile.js';
import { changePassword } from '../../application/features/change-password/change-password.js';
import { requestAccountClosure } from '../../application/features/request-account-closure/request-account-closure.js';

export function createIdentityController(dependencies) {
  return {
    async register(request, response, next) { try { response.status(201).json({ usuario: await registerUser(dependencies)(request.body) }); } catch (error) { next(error); } },
    async login(request, response, next) { try { response.status(200).json(await loginUser(dependencies)(request.body)); } catch (error) { next(error); } },
    async getProfile(request, response, next) { try { response.status(200).json({ usuario: await getProfile(dependencies)(request.auth.userId) }); } catch (error) { next(error); } },
    async updateProfile(request, response, next) { try { response.status(200).json({ usuario: await updateProfile(dependencies)(request.auth.userId, request.body) }); } catch (error) { next(error); } },
    async changePassword(request, response, next) { try { await changePassword(dependencies)(request.auth.userId, request.body); response.status(204).send(); } catch (error) { next(error); } },
    async requestClosure(request, response, next) { try { const result = await requestAccountClosure(dependencies)(request.auth.userId, request.get('x-correlation-id')); response.status(202).json({ message: 'Solicitação de encerramento aceita para processamento assíncrono.', ...result }); } catch (error) { next(error); } }
  };
}
