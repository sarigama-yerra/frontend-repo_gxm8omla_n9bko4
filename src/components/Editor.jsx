import { useEffect, useState } from 'react'

export default function Editor({ page, onChange, onSave, onLock, onUnlock }) {
  const [local, setLocal] = useState(page)
  useEffect(() => setLocal(page), [page?.id])

  if (!page) return <div className="p-8 text-gray-500">Select or create a page</div>

  return (
    <div className="flex-1 p-4 flex flex-col gap-3">
      {page.lock?.is_locked && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded">
          Being edited by {page.lock.locked_by || 'someone else'}
        </div>
      )}
      <input
        className="text-2xl font-semibold outline-none bg-transparent border-b pb-1"
        value={local.title || ''}
        onChange={e => {
          const next = { ...local, title: e.target.value }
          setLocal(next)
          onChange(next)
        }}
        placeholder="Title"
      />
      <textarea
        className="flex-1 font-mono text-sm leading-6 outline-none p-3 border rounded min-h-[300px]"
        value={local.content || ''}
        onFocus={onLock}
        onBlur={onUnlock}
        onChange={e => {
          const next = { ...local, content: e.target.value }
          setLocal(next)
          onChange(next)
        }}
        placeholder="# Markdown content"
      />
      <div className="flex items-center gap-2">
        <input
          className="border rounded px-2 py-1 text-sm"
          value={local.folder_path || '/'}
          onChange={e => {
            const next = { ...local, folder_path: e.target.value }
            setLocal(next)
            onChange(next)
          }}
          placeholder="/docs/notes"
        />
        <input
          className="border rounded px-2 py-1 text-sm flex-1"
          value={(local.tags || []).join(', ')}
          onChange={e => {
            const next = { ...local, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
            setLocal(next)
            onChange(next)
          }}
          placeholder="tags, comma, separated"
        />
        <button onClick={onSave} className="px-3 py-1 rounded bg-emerald-600 text-white text-sm">Save</button>
      </div>
    </div>
  )
}
