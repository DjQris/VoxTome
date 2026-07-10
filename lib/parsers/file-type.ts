export type SupportedFileType = "pdf" | "docx" | "epub"

const EXTENSION_MAP: Record<string, SupportedFileType> = {
  pdf: "pdf",
  docx: "docx",
  epub: "epub",
}

export function getFileType(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase()
  return extension ? EXTENSION_MAP[extension] : undefined
}