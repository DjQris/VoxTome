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

    if (text.includes("__next_error__") || text.includes("<!DOCTYPE html")) {
      throw new Error(
        "The server hit an error while handling your upload. Try again in a moment."
      )
    }

    throw new Error(
      text.trim().slice(0, 160) || `Request failed (${response.status})`
    )
  }
}