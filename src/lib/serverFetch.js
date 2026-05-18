export async function fetchWithTimeout(url, options = {}, timeoutMs = 20000) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('External service timed out. Please try again.')
    }

    throw new Error('External service is unreachable. Check your connection or API configuration.')
  } finally {
    clearTimeout(timeout)
  }
}
