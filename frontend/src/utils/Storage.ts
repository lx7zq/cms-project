export function getAuthToken(): string | null {
  return localStorage.getItem('accessToken')
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem('accessToken', token)
  } else {
    localStorage.removeItem('accessToken')
  }
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken')
}

export function setRefreshToken(token: string | null): void {
  if (token) {
    localStorage.setItem('refreshToken', token)
  } else {
    localStorage.removeItem('refreshToken')
  }
}

export function clearTokens(): void {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}
