const functionDomain = 'https://pjbl-lucas-pucpr-2026-gwezgmdagtewdfgy.canadacentral-01.azurewebsites.net/api'

export const env = {
  getUrl: import.meta.env.VITE_API_GET || `${functionDomain}/GetAlertas`,
  postUrl: import.meta.env.VITE_API_POST || `${functionDomain}/PostAlerta`,
  putUrl: import.meta.env.VITE_API_PUT || `${functionDomain}/PutAlerta`,
  deleteUrl: import.meta.env.VITE_API_DELETE || `${functionDomain}/DeleteAlerta`,
}
