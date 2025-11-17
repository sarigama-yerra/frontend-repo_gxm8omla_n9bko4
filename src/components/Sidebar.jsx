import { useEffect } from 'react'

export default function Sidebar({ pages, onSelect, onNewPage }) {
  useEffect(() => {}, [pages])
  return (
    <div className="w-64 border-r bg-white/70 backdrop-blur p-3 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Pages</h2>
        <button onClick={onNewPage} className="text-sm px-2 py-1 rounded bg-blue-600 text-white">New</button>
      </div>
      <div className="space-y-1 overflow-auto">
        {pages.map(p => (
          <button key={p.id} onClick={() => onSelect(p)} className={`w-full text-left px-2 py-1 rounded hover:bg-blue-50 ${p.lock?.is_locked ? 'opacity-70' : ''}`}>
            <div className="text-sm font-medium truncate">{p.title || 'Untitled'}</div>
            <div className="text-xs text-gray-500 truncate">{p.folder_path || '/'}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
