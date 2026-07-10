export function isProduction() {
  return process.env.NODE_ENV === "production"
}

export function isSupabaseStorageConfigured() {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export function isPostgresDatabase() {
  const url = process.env.DATABASE_URL ?? ""
  return url.startsWith("postgres://") || url.startsWith("postgresql://")
}

export function getAppUrl() {
  return (
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    (isProduction() ? undefined : "http://localhost:3000")
  )
}

type EnvCheck = {
  key: string
  label: string
  required: boolean
}

const PRODUCTION_CHECKS: EnvCheck[] = [
  { key: "AUTH_SECRET", label: "Auth secret", required: true },
  { key: "DATABASE_URL", label: "Database URL", required: true },
  { key: "AUTH_RESEND_KEY", label: "Resend API key", required: true },
  { key: "ELEVENLABS_API_KEY", label: "ElevenLabs API key", required: true },
  {
    key: "AUTH_RESEND_FROM",
    label: "Resend from address",
    required: false,
  },
  { key: "SUPABASE_URL", label: "Supabase URL", required: false },
  {
    key: "SUPABASE_SERVICE_ROLE_KEY",
    label: "Supabase service role key",
    required: false,
  },
]

export function getEnvironmentStatus() {
  const checks = PRODUCTION_CHECKS.map((check) => ({
    ...check,
    present: Boolean(process.env[check.key]),
  }))

  const missingRequired = checks.filter(
    (check) => check.required && !check.present
  )

  return {
    mode: isProduction() ? "production" : "development",
    database: isPostgresDatabase() ? "postgresql" : "sqlite",
    storage: isSupabaseStorageConfigured() ? "supabase" : "local",
    appUrl: getAppUrl() ?? null,
    checks,
    ready: missingRequired.length === 0,
    missingRequired: missingRequired.map((check) => check.key),
  }
}