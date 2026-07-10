import { mkdir, readFile, writeFile, access, rm } from "node:fs/promises"
import { join, dirname } from "node:path"
import { createClient } from "@supabase/supabase-js"

const LOCAL_STORAGE_ROOT = join(process.cwd(), "storage")
const BUCKET = "voxtome"
const SIGNED_URL_TTL_SECONDS = 60 * 60

function useSupabase() {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

function getSupabase() {
  if (!useSupabase()) {
    throw new Error("Supabase is not configured")
  }

  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function ensureLocalDir(filePath: string) {
  await mkdir(dirname(filePath), { recursive: true })
}

export async function createSignedUploadUrl(path: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(path, { upsert: true })

  if (error || !data) {
    throw error ?? new Error("Failed to create signed upload URL")
  }

  return data
}

export async function saveFile(path: string, data: Buffer) {
  if (useSupabase()) {
    const supabase = getSupabase()
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, data, { upsert: true, contentType: "application/octet-stream" })

    if (error) {
      throw error
    }

    return path
  }

  const localPath = join(LOCAL_STORAGE_ROOT, path)
  await ensureLocalDir(localPath)
  await writeFile(localPath, data)
  return path
}

export async function readStoredFile(path: string) {
  if (useSupabase()) {
    const supabase = getSupabase()
    const { data, error } = await supabase.storage.from(BUCKET).download(path)

    if (error || !data) {
      throw error ?? new Error("File not found")
    }

    return Buffer.from(await data.arrayBuffer())
  }

  const localPath = join(LOCAL_STORAGE_ROOT, path)
  return readFile(localPath)
}

export async function waitForStoredFile(
  path: string,
  attempts = 5,
  delayMs = 1000
) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await storedFileExists(path)) {
      return true
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }

  return false
}

export async function storedFileExists(path: string) {
  try {
    if (useSupabase()) {
      const supabase = getSupabase()
      const folder = dirname(path).replace(/\\/g, "/")
      const fileName = path.split("/").pop()!
      const { data, error } = await supabase.storage.from(BUCKET).list(folder, {
        search: fileName,
      })

      if (error) {
        return false
      }

      return data.some((item) => item.name === fileName)
    }

    await access(join(LOCAL_STORAGE_ROOT, path))
    return true
  } catch {
    return false
  }
}

export async function getAudioUrl(path: string) {
  if (useSupabase()) {
    const supabase = getSupabase()
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, SIGNED_URL_TTL_SECONDS)

    if (error || !data?.signedUrl) {
      throw error ?? new Error("Failed to create signed URL")
    }

    return data.signedUrl
  }

  return `/api/audio?path=${encodeURIComponent(path)}`
}

export async function deleteStoredPrefix(prefix: string) {
  if (useSupabase()) {
    const supabase = getSupabase()
    const normalized = prefix.replace(/\\/g, "/").replace(/\/$/, "")

    const { data, error } = await supabase.storage.from(BUCKET).list(normalized, {
      limit: 1000,
    })

    if (error) {
      throw error
    }

    if (!data.length) {
      return
    }

    const paths = data.map((item) => `${normalized}/${item.name}`)
    const { error: removeError } = await supabase.storage.from(BUCKET).remove(paths)

    if (removeError) {
      throw removeError
    }

    return
  }

  await rm(join(LOCAL_STORAGE_ROOT, prefix), {
    recursive: true,
    force: true,
  }).catch(() => undefined)
}