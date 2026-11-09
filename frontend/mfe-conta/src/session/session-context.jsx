import { createContext, useContext, useMemo, useState } from 'react';
import { ApiError, createAuthService } from '../api/auth-service.js';
const SessionContext = createContext(null);
export function SessionProvider({ children, service = createAuthService(), onSessionChange = () => {}, initialSession }) {
  const [token, setToken] = useState(initialSession?.accessToken || null); const [user, setUser] = useState(initialSession?.user || null);
  const logout = () => { setToken(null); setUser(null); onSessionChange(null); };
  const protect = async action => { try { return await action(); } catch (error) { if (error instanceof ApiError && error.status === 401) logout(); throw error; } };
  const value = useMemo(() => ({ token, user, login: async input => { const result = await service.login(input); if (!result.token) throw new ApiError('Resposta de autenticação inválida.', 502); const profile = await service.profile(result.token); setToken(result.token); setUser(profile.usuario); onSessionChange({ accessToken: result.token, user: profile.usuario }); }, register: input => service.register(input), refresh: () => protect(async () => { const profile = await service.profile(token); setUser(profile.usuario); onSessionChange({ accessToken: token, user: profile.usuario }); return profile; }), update: input => protect(async () => { const profile = await service.update(token, input); setUser(profile.usuario); onSessionChange({ accessToken: token, user: profile.usuario }); return profile; }), password: input => protect(() => service.password(token, input)), close: () => protect(() => service.close(token)), logout }), [token, user, service, onSessionChange]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
export const useSession = () => useContext(SessionContext);
