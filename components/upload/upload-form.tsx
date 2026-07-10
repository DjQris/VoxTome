"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CloudArrowUpIcon, FileTextIcon } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { parseResponseJson } from "@/lib/parse-response-json"
import { MAX_UPLOAD_BYTES } from "@/lib/upload-constants"
import { cn } from "@/lib/utils"

const ACCEPTED_TYPES = ".pdf,.docx,.epub"

type UploadUrlResponse = {
  mode?: "direct" | "signed"
  bookId?: string
  storagePath?: string
  signedUrl?: string
  token?: string
  error?: string
}

type UploadResponse = {
  id?: string
  error?: string
}

export function UploadForm() {
  const router = useRouter()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)

  const uploadFile = async (file: File) => {
    setIsUploading(true)

    try {
      const prepareResponse = await fetch("/api/books/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
        }),
      })

      const preparePayload = await parseResponseJson<UploadUrlResponse>(
        prepareResponse
      )

      if (!prepareResponse.ok) {
        throw new Error(preparePayload.error ?? "Failed to prepare upload")
      }

      let processResponse: Response

      if (preparePayload.mode === "signed") {
        const { bookId, storagePath, signedUrl } = preparePayload

        if (!bookId || !storagePath || !signedUrl) {
          throw new Error("Upload configuration was incomplete")
        }

        const storageResponse = await fetch(signedUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
        })

        if (!storageResponse.ok) {
          throw new Error("Failed to upload file to storage")
        }

        processResponse = await fetch("/api/books/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookId,
            storagePath,
            fileName: file.name,
          }),
        })
      } else {
        const formData = new FormData()
        formData.append("file", file)

        processResponse = await fetch("/api/books/upload", {
          method: "POST",
          body: formData,
        })
      }

      const payload = await parseResponseJson<UploadResponse>(processResponse)

      if (!processResponse.ok || !payload.id) {
        throw new Error(payload.error ?? "Upload failed")
      }

      toast.success("Book uploaded successfully")
      router.push(`/reader/${payload.id}`)
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed"
      toast.error(message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0]

    if (!file) {
      return
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("File is too large. Maximum size is 50 MB.")
      return
    }

    setSelectedFile(file)
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        onDragEnter={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          setIsDragging(false)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          handleFiles(event.dataTransfer.files)
        }}
        className={cn(
          "flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "bg-card/40"
        )}
        onClick={() => inputRef.current?.click()}
      >
        <CloudArrowUpIcon className="size-10 text-primary" />
        <h2 className="mt-4 font-medium">Drop your book here</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          PDF, DOCX, or EPUB. Tap to browse on mobile.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>

      {selectedFile ? (
        <div className="flex items-center justify-between gap-4 rounded-xl border bg-card px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <FileTextIcon className="size-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            onClick={() => void uploadFile(selectedFile)}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      ) : null}
    </div>
  )
}