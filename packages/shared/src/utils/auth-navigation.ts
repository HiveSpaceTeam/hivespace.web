const isSameOriginUrl = (url: URL): boolean =>
  typeof window !== 'undefined' && url.origin === window.location.origin

export const normalizeFrontendRedirect = (value: unknown, fallback = '/'): string => {
  if (typeof value !== 'string') return fallback

  const redirect = value.trim()
  if (!redirect) return fallback

  if (redirect.startsWith('/') && !redirect.startsWith('//')) {
    return redirect
  }

  try {
    const url = new URL(redirect)
    if (!isSameOriginUrl(url)) return fallback
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}
