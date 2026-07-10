import { createRequire } from "node:module"
import { writeFile, unlink, mkdtemp } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

type EpubInstance = {
  on(event: "end", listener: () => void): void
  on(event: "error", listener: (error: Error) => void): void
  flow(type: string): void
  getChapterRaw(
    id: string,
    callback: (error: Error | null, text?: string) => void
  ): void
  spine: { contents: { id: string }[] }
}

type EpubConstructor = new (path: string) => EpubInstance

let EPub: EpubConstructor | null = null

function getEpubConstructor() {
  if (!EPub) {
    const require = createRequire(import.meta.url)
    EPub = require("epub2") as EpubConstructor
  }

  return EPub
}

function getChapter(epub: EpubInstance, id: string) {
  return new Promise<string>((resolve, reject) => {
    epub.getChapterRaw(id, (error, text) => {
      if (error) {
        reject(error)
        return
      }

      resolve(text ?? "")
    })
  })
}

export async function parseEpub(buffer: Buffer) {
  const Epub = getEpubConstructor()
  const dir = await mkdtemp(join(tmpdir(), "voxtome-epub-"))
  const filePath = join(dir, "book.epub")

  try {
    await writeFile(filePath, buffer)

    const epub = await new Promise<EpubInstance>((resolve, reject) => {
      const instance = new Epub(filePath)

      instance.on("end", () => resolve(instance))
      instance.on("error", reject)
      instance.flow("toc")
    })

    const chapters = await Promise.all(
      epub.spine.contents.map((item) => getChapter(epub, item.id))
    )

    return chapters
      .map((chapter) =>
        chapter
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
      )
      .filter(Boolean)
      .join("\n\n")
  } finally {
    await unlink(filePath).catch(() => undefined)
  }
}