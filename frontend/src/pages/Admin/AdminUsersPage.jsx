import { useEffect, useState, useCallback } from 'react'
import { Users, Loader2, Search, Trash2, X } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { Modal } from '@/components/common/Modal'
import { Input } from '@/components/common/Input'
import { api, ApiError } from '@/lib/apiClient'
import { useAuth } from '@/context/AuthContext'

const roleVariant = { Student: 'default', Instructor: 'secondary', Admin: 'warning', SuperAdmin: 'success' }

export default function AdminUsersPage() {
  const { role } = useAuth()
  const canDelete = role === 'superadmin'
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteError, setDeleteError] = useState('')

  const load = useCallback(async (searchTerm) => {
    setIsLoading(true)
    setError('')
    try {
      const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''
      const data = await api.get(`/api/admin/users${query}`)
      setUsers(data)
    } catch (err) {
      setError(err.message || 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => load(search), 300)
    return () => clearTimeout(timeout)
  }, [search, load])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setBusyId(deleteTarget.id)
    setDeleteError('')
    try {
      await api.delete(`/api/admin/users/${deleteTarget.id}`)
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Failed to delete user')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Users
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search and manage every account on the platform.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="pl-10"
        />
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">{error}</div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" description="Try a different search term." />
      ) : (
        <Card className="overflow-hidden border-border/60 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 border-b border-border/50">
                <tr>
                  <th className="p-4 font-medium text-muted-foreground text-xs uppercase tracking-tight">Name</th>
                  <th className="p-4 font-medium text-muted-foreground text-xs uppercase tracking-tight">Email</th>
                  <th className="p-4 font-medium text-muted-foreground text-xs uppercase tracking-tight">Role</th>
                  <th className="p-4 font-medium text-muted-foreground text-xs uppercase tracking-tight">Joined</th>
                  <th className="p-4 font-medium text-muted-foreground text-xs uppercase tracking-tight text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-medium whitespace-nowrap">{u.name}</td>
                    <td className="p-4 text-muted-foreground whitespace-nowrap">{u.email}</td>
                    <td className="p-4">
                      <Badge variant={roleVariant[u.role] || 'default'}>{u.role}</Badge>
                    </td>
                    <td className="p-4 text-muted-foreground whitespace-nowrap">{new Date(u.joinedDate).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      {canDelete && u.role !== 'SuperAdmin' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busyId === u.id}
                          onClick={() => { setDeleteTarget(u); setDeleteError('') }}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-bold text-foreground">Delete account?</h3>
            <button onClick={() => setDeleteTarget(null)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            This will permanently delete <strong>{deleteTarget?.name}</strong> ({deleteTarget?.email}) and all
            of their data. This cannot be undone.
          </p>
          {deleteError && <p className="text-sm text-destructive font-medium">{deleteError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={busyId === deleteTarget?.id}>
              {busyId === deleteTarget?.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
