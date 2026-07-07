import { UploadForm } from "@/components/upload/upload-form"

export default function UploadPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Upload a book
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Add a PDF, DOCX, or EPUB and VoxTome will prepare it for listening.
        </p>
      </div>
      <UploadForm />
    </div>
  )
}