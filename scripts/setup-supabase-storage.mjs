import { createClient } from "@supabase/supabase-js"

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const bucket = "voxtome"

if (!url || !serviceKey) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running.")
  process.exit(1)
}

const supabase = createClient(url, serviceKey)

const { data: buckets, error: listError } = await supabase.storage.listBuckets()

if (listError) {
  console.error("Failed to list buckets:", listError.message)
  process.exit(1)
}

const exists = buckets.some((item) => item.name === bucket)

if (!exists) {
  const { error: createError } = await supabase.storage.createBucket(bucket, {
    public: false,
    fileSizeLimit: 52_428_800,
  })

  if (createError) {
    console.error("Failed to create bucket:", createError.message)
    process.exit(1)
  }

  console.log(`Created storage bucket "${bucket}" (private).`)
} else {
  console.log(`Storage bucket "${bucket}" already exists.`)
}

console.log("Supabase storage is ready for VoxTome.")