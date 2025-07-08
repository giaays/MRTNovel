// pages/index.tsx
import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const [text, setText] = useState('')
  const router = useRouter()

  const splitAndSave = (rawText: string) => {
    const chunkSize = 3000
    const chunks = []
    for (let i = 0; i < rawText.length; i += chunkSize) {
      chunks.push(rawText.slice(i, i + chunkSize))
    }
    localStorage.setItem('splitChunks', JSON.stringify(chunks))
    router.push('/view/1')
  }

  const handleFile = async (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const content = reader.result as string
      setText(content)
      splitAndSave(content)
    }
    reader.readAsText(file)
  }

  const handleDriveLink = async () => {
    const match = text.match(/[-\w]{25,}/)
    if (!match) return alert('Link Google Drive không hợp lệ')
    const fileId = match[0]
    const url = `https://drive.google.com/uc?export=download&id=${fileId}`
    const res = await fetch(url)
    const content = await res.text()
    splitAndSave(content)
  }

  return (
    <main className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tách nội dung từ file .txt</h1>

      <div className="mb-4">
        <label className="font-semibold">Dán link Google Drive (.txt):</label>
        <textarea
          className="w-full p-2 border mt-1 rounded"
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>
        <button
          onClick={handleDriveLink}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Lấy từ Drive
        </button>
      </div>

      <div className="mb-4">
        <label className="font-semibold">Hoặc chọn file .txt từ máy:</label>
        <input
          type="file"
          accept=".txt"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFile(e.target.files[0])
          }}
          className="block mt-2"
        />
      </div>
    </main>
  )
}

// pages/view/[index].tsx
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function ViewPage() {
  const router = useRouter()
  const { index } = router.query
  const [chunk, setChunk] = useState('')
  const [maxIndex, setMaxIndex] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = localStorage.getItem('splitChunks')
    if (!raw) {
      setChunk('Không tìm thấy nội dung. Hãy quay lại trang chủ.')
      return
    }
    const chunks = JSON.parse(raw)
    setMaxIndex(chunks.length)
    const idx = parseInt(index as string, 10) - 1
    if (isNaN(idx) || idx < 0 || idx >= chunks.length) {
      setChunk('Trang không tồn tại.')
    } else {
      setChunk(chunks[idx])
    }
  }, [index])

  const idx = parseInt(index as string, 10)

  return (
    <main className="p-4 max-w-2xl mx-auto whitespace-pre-wrap">
      <h1 className="text-xl font-semibold mb-4">Trang {index}</h1>
      <div className="border p-4 rounded bg-gray-50 mb-6">
        {chunk}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => router.push(`/view/${idx - 1}`)}
          disabled={idx <= 1}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          ← Trang trước
        </button>

        <button
          onClick={() => router.push(`/view/${idx + 1}`)}
          disabled={idx >= maxIndex}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Trang sau →
        </button>
      </div>
    </main>
  )
}
