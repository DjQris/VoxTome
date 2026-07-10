export async function parseResponseJson<T extends Record<string, unknown>>(
  response: Response
): Promise<T> {
  const text = await response.text()

  try {
    return JSON.parse(text) as T
  } catch {
    if (
      response.status === 413 ||
      text.toLowerCase().includes("request entity too large")
    ) {
      throw new Error(
        "This file is too large to upload through the app server. Try a smaller file."
      )
    }

    throw new Error(
      text.trim().slice(0, 160) || `Request failed (${response.status})`
    )
  }
}