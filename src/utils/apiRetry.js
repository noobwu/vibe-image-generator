const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export async function fetchWithRetry(url, options, maxRetries = 3, retryDelay = 1000, timeout = 60000) {
  let lastError = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        return response
      }

      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status}`

      if (attempt < maxRetries) {
        const delay = retryDelay * Math.pow(2, attempt)
        console.warn(`请求失败 (尝试 ${attempt + 1}/${maxRetries + 1}): ${errorMessage}, ${delay}ms 后重试...`)
        await sleep(delay)
      } else {
        lastError = new Error(errorMessage)
      }
    } catch (error) {
      if (attempt < maxRetries) {
        const delay = retryDelay * Math.pow(2, attempt)
        console.warn(`请求异常 (尝试 ${attempt + 1}/${maxRetries + 1}): ${error.message}, ${delay}ms 后重试...`)
        await sleep(delay)
      } else {
        lastError = error
      }
    }
  }

  throw lastError || new Error('请求失败')
}
