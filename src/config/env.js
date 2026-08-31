const apiUrl = import.meta.env.VITE_API_URL

export const env = { apiUrl: typeof apiUrl === 'string' ? apiUrl.trim() : '' }
export const hasApiUrl = Boolean(env.apiUrl)
