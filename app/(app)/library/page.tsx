import Link from "next/link"

import { BookCard } from "@/components/library/book-card"
import { ContinueListening } from "@/components/library/continue-listening"
import { getSessionUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"

function getPercent(totalChunks: number, chunkIndex: number) {
  if (totalChunks <= 0) {
    return 0
  }

  return Math.round(((chunkIndex + 1) / totalChunks) * 100)
}

export default async function LibraryPage() {
  const user = await getSessionUser()

  const books = user
    ? await prisma.book.findMany({
        where: { userId: user.id },
        include: { progress: true },
      })
    : []

  const sortedBooks = [...books].sort((a, b) => {
    const aTime = a.progress?.updatedAt ?? a.createdAt
    const bTime = b.progress?.updatedAt ?? b.createdAt
    return bTime.getTime() - aTime.getTime()
  })

  const continueBook = sortedBooks.find((book) => book.progress)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Your library
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            {user?.name
              ? `Welcome back, ${user.name}.`
              : "Upload a book to start listening."}
          </p>
        </div>
        <Link href="/upload" className="hidden sm:block">
          <Button className="shrink-0">Upload</Button>
        </Link>
      </div>

      {continueBook?.progress ? (
        <ContinueListening
          bookId={continueBook.id}
          title={continueBook.title}
          percent={getPercent(
            continueBook.totalChunks,
            continueBook.progress.chunkIndex
          )}
          lastListenedAt={continueBook.progress.updatedAt}
        />
      ) : null}

      {sortedBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-16 text-center">
          <span className="text-4xl" role="img" aria-label="Books">
            📚
          </span>
          <h2 className="mt-4 font-medium">No books yet</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Upload a PDF, DOCX, or EPUB and VoxTome will read it aloud with
            your chosen accent.
          </p>
          <Link href="/upload" className="mt-6">
            <Button>Upload a book</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sortedBooks.map((book) => {
            const percent = book.progress
              ? getPercent(book.totalChunks, book.progress.chunkIndex)
              : 0

            return (
              <BookCard
                key={book.id}
                id={book.id}
                title={book.title}
                fileType={book.fileType}
                totalChunks={book.totalChunks}
                percent={percent}
                lastListenedAt={book.progress?.updatedAt ?? null}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}