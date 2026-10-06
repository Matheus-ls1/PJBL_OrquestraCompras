const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

export const env = {
  getUrl: `${apiBaseUrl}/alertas`,
  postUrl: `${apiBaseUrl}/alertas`,
  putUrl: `${apiBaseUrl}/alertas`,
  deleteUrl: `${apiBaseUrl}/alertas`,
}
