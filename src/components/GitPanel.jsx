import { useMemo, useState } from 'react'

export default function GitPanel({ workspace, page, onConnect, onSelectRepo, onSync, onPull, onViewHistory }) {
  const [token, setToken] = useState('')
  const [repoInput, setRepoInput] = useState('')
  const connected = Boolean(workspace?.gh_connected)

  return (
    <div className="w-80 border-l bg-white/70 backdrop-blur p-3 flex flex-col gap-3">
      <h2 className="font-semibold">Git activity</h2>
      {!connected ? (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">Paste a GitHub personal access token (fine for MVP)</div>
          <input className="w-full border rounded px-2 py-1 text-sm" value={token} onChange={e=>setToken(e.target.value)} placeholder="ghp_..."/>
          <button className="px-3 py-1 rounded bg-gray-900 text-white text-sm" onClick={()=> onConnect(token)}>Connect</button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-xs text-gray-600">Select repo: owner/repo</div>
          <input className="w-full border rounded px-2 py-1 text-sm" value={repoInput} onChange={e=>setRepoInput(e.target.value)} placeholder="owner/repo"/>
          <button className="px-3 py-1 rounded bg-gray-900 text-white text-sm" onClick={()=> onSelectRepo(repoInput)}>Set Repo</button>
          <hr />
          <div className="text-xs text-gray-600">Page sync</div>
          <button disabled={!page} className="px-3 py-1 rounded bg-blue-600 text-white text-sm disabled:opacity-50" onClick={()=> onSync(page)}>Push page</button>
          <button disabled={!page} className="px-3 py-1 rounded bg-emerald-600 text-white text-sm disabled:opacity-50" onClick={()=> onPull(page)}>Pull page</button>
          <button disabled={!page?.git_path} className="px-3 py-1 rounded bg-indigo-600 text-white text-sm disabled:opacity-50" onClick={()=> onViewHistory(page)}>History</button>
        </div>
      )}
    </div>
  )
}
