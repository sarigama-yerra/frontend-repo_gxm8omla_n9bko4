import { useEffect, useMemo, useState } from 'react'
import Sidebar from './components/Sidebar'
import Editor from './components/Editor'
import GitPanel from './components/GitPanel'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

async function api(path, opts={}) {
  const res = await fetch(`${API}${path}`, { headers: { 'Content-Type': 'application/json' }, credentials: 'omit', ...opts })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export default function App() {
  const [workspace, setWorkspace] = useState(null)
  const [pages, setPages] = useState([])
  const [current, setCurrent] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // boot: ensure a workspace exists
    (async() => {
      const list = await api('/workspaces').catch(()=>[])
      if (list && list.length) {
        setWorkspace(list[0])
      } else {
        const ws = await api('/workspaces', { method: 'POST', body: JSON.stringify({ name: 'My Workspace' }) })
        setWorkspace(ws)
      }
    })()
  }, [])

  useEffect(() => {
    if (!workspace) return
    refreshPages()
  }, [workspace?.id])

  async function refreshPages() {
    const items = await api(`/pages?workspace_id=${workspace.id}`)
    setPages(items)
    if (!current && items.length) setCurrent(items[0])
  }

  async function createPage() {
    if (!workspace) return
    const p = await api('/pages', { method: 'POST', body: JSON.stringify({ title: 'Untitled', content: '', folder_path: '/', tags: [], workspace_id: workspace.id }) })
    setPages([p, ...pages])
    setCurrent(p)
  }

  async function saveCurrent() {
    if (!current) return
    setLoading(true)
    try {
      const updated = await api(`/pages/${current.id}`, { method: 'PATCH', body: JSON.stringify({ title: current.title, content: current.content, folder_path: current.folder_path, tags: current.tags }) })
      setCurrent(updated)
      setPages(pages.map(p => p.id === updated.id ? updated : p))
    } finally {
      setLoading(false)
    }
  }

  function onChangePage(next) {
    setCurrent(next)
  }

  async function lock() { if (current) { await api(`/pages/${current.id}/lock`, { method: 'POST', body: JSON.stringify({ locked_by: 'You', is_locked: true }) }); refreshPages() } }
  async function unlock() { if (current) { await api(`/pages/${current.id}/unlock`, { method: 'POST' }); refreshPages() } }

  // Git helpers
  async function connectGit(token) {
    await api('/github/connect', { method: 'POST', body: JSON.stringify({ workspace_id: workspace.id, access_token: token }) })
    const ws = await api('/workspaces')
    setWorkspace(ws[0])
  }

  async function selectRepo(fullName) {
    const [owner, repo] = (fullName || '').split('/')
    if (!owner || !repo) return
    await api('/github/select-repo', { method: 'POST', body: JSON.stringify({ workspace_id: workspace.id, owner, repo }) })
    const ws = await api('/workspaces')
    setWorkspace(ws[0])
  }

  async function syncPage(page) {
    const path = page.git_path || `${page.folder_path.replace(/^\//,'') || ''}/${(page.title || 'untitled').toLowerCase().replace(/\s+/g,'-')}.md`.replace(/^\//,'')
    const updated = await api('/github/sync-page', { method: 'POST', body: JSON.stringify({ page_id: page.id, path, commit_message: 'docs: update from workspace' }) })
    setCurrent(updated)
    await refreshPages()
  }

  async function pullPage(page) {
    const updated = await api('/github/pull-page', { method: 'POST', body: JSON.stringify({ page_id: page.id }) })
    setCurrent(updated)
    await refreshPages()
  }

  async function viewHistory(page) {
    const path = page.git_path
    if (!path) return
    const items = await api(`/github/history?workspace_id=${workspace.id}&path=${encodeURIComponent(path)}`)
    alert(items.map(x => `${x.date} - ${x.author}: ${x.message}`).join('\n'))
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar pages={pages} onSelect={setCurrent} onNewPage={createPage} />
      <div className="flex-1 flex flex-col">
        <div className="p-3 border-b bg-white/70 backdrop-blur flex items-center justify-between">
          <div className="font-semibold">Workspace: {workspace?.name || '...'}</div>
          <div className="text-sm text-gray-500">{loading ? 'Saving…' : ''}</div>
        </div>
        <Editor page={current} onChange={onChangePage} onSave={saveCurrent} onLock={lock} onUnlock={unlock} />
      </div>
      <GitPanel workspace={workspace} page={current} onConnect={connectGit} onSelectRepo={selectRepo} onSync={syncPage} onPull={pullPage} onViewHistory={viewHistory} />
    </div>
  )
}
