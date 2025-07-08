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

  const parseDictionaryTxt = (text: string): Record<string, string> => {
    const lines = text.split(/\r?\n/)
    const dict: Record<string, string> = {}
    for (const line of lines) {
      const [key, value] = line.split('=')
      if (key && value) {
        dict[key.trim().toLowerCase()] = value.trim()
      }
    }
    return dict
  }

  const applyDictionary = (text: string, dict: Record<string, string>): string => {
    const keys = Object.keys(dict).sort((a, b) => b.length - a.length)
    const pattern = new RegExp(`\\b(${keys.join("|")})\\b`, "gi")
    return text.replace(pattern, (match) => dict[match.toLowerCase()] || match)
  }

  const handleTranslate = async () => {
    let rawDict = localStorage.getItem('userDict_raw')
    if (!rawDict) {
      const res = await fetch('/dictionary.txt')
      rawDict = await res.text()
    }
    const dict = parseDictionaryTxt(rawDict)
    const translated = applyDictionary(chunk, dict)
    setChunk(translated)
  }

  return (
    <main className="p-4 max-w-2xl mx-auto whitespace-pre-wrap">
      <h1 className="text-xl font-semibold mb-4">Trang {index}</h1>
      <div className="border p-4 rounded bg-gray-50 mb-6">
        {chunk}
      </div>

      <div className="flex justify-between mb-4">
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

      <button
        onClick={handleTranslate}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Dịch bằng từ điển
      </button>
    </main>
  )
}
