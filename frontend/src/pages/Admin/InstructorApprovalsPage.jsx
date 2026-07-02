import { useEffect, useState, useCallback } from 'react'
import {
  ShieldCheck, ShieldX, Loader2, Briefcase, Globe, Calendar,
  CheckCircle2, XCircle, Clock
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card, CardContent } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { Modal } from '@/components/common/Modal'
import { Textarea, Label } from '@/components/common/Input'
import { api, fileUrl } from '@/lib/apiClient'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'Pending', label: 'Pending' },
  { id: 'Approved', label: 'Approved' },
  { id: 'Rejected', label: 'Rejected' },
]

const statusVariant = { Pending: 'warning', Approved: 'success', Rejected: 'destructive' }

export default function InstructorApprovalsPage() {
  const [activeTab, setActiveTab] = useState('Pending')
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const load = useCallback(async (status) => {
    setIsLoading(true)
    setError('')
    try {
      const data = await api.get(`/api/admin/instructors?status=${status}`)
      setApplications(data)
    } catch (err) {
      setError(err.message || 'Failed to load instructor applications')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load(activeTab)
  }, [activeTab, load])

  const handleApprove = async (userId) => {
    setBusyId(userId)
    try {
      await api.post(`/api/admin/instructors/${userId}/approve`)
      setApplications((prev) => prev.filter((a) => a.userId !== userId))
    } catch (err) {
      setError(err.message || 'Failed to approve instructor')
    } finally {
      setBusyId(null)
    }
  }

  const openReject = (application) => {
    setRejectTarget(application)
    setRejectReason('')
  }

  const handleReject = async () => {
    if (!rejectTarget) return
    setBusyId(rejectTarget.userId)
    try {
      await api.post(`/api/admin/instructors/${rejectTarget.userId}/reject`, { reason: rejectReason })
      setApplications((prev) => prev.filter((a) => a.userId !== rejectTarget.userId))
      setRejectTarget(null)
    } catch (err) {
      setError(err.message || 'Failed to reject instructor')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Instructor Approvals
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and approve instructor applications before they can publish courses.
        </p>
      </div>

      <div className="flex items-center gap-1 bg-muted/30 p-1.5 rounded-xl border border-border/40 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all',
              activeTab === tab.id ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">{error}</div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={activeTab === 'Pending' ? Clock : activeTab === 'Approved' ? CheckCircle2 : XCircle}
          title={`No ${activeTab.toLowerCase()} applications`}
          description={activeTab === 'Pending' ? "You're all caught up. No instructor applications waiting for review." : `No instructors are currently ${activeTab.toLowerCase()}.`}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {applications.map((app) => (
            <Card key={app.userId} className="border-border/60 shadow-sm overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 overflow-hidden">
                      {app.avatar ? (
                        <img src={fileUrl(app.avatar)} alt={app.name} className="h-full w-full object-cover" />
                      ) : (
                        app.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{app.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{app.email}</p>
                    </div>
                  </div>
                  <Badge variant={statusVariant[app.instructorApprovalStatus] || 'secondary'}>
                    {app.instructorApprovalStatus}
                  </Badge>
                </div>

                {app.instructorTitle && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Briefcase className="h-3.5 w-3.5" /> {app.instructorTitle}
                  </div>
                )}

                {app.bio && <p className="text-sm text-muted-foreground line-clamp-3">{app.bio}</p>}

                {app.instructorPortfolio && (
                  <a
                    href={app.instructorPortfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-primary hover:underline w-fit"
                  >
                    <Globe className="h-3.5 w-3.5" /> {app.instructorPortfolio}
                  </a>
                )}

                {app.instructorAppliedAt && (
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground/80">
                    <Calendar className="h-3 w-3" />
                    Applied {new Date(app.instructorAppliedAt).toLocaleDateString()}
                  </div>
                )}

                {app.instructorRejectionReason && (
                  <p className="text-xs text-destructive bg-destructive/5 rounded-lg p-2.5">
                    Reason: {app.instructorRejectionReason}
                  </p>
                )}

                {activeTab === 'Pending' && (
                  <div className="flex gap-2 pt-2 border-t border-border/60">
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5"
                      disabled={busyId === app.userId}
                      onClick={() => handleApprove(app.userId)}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1.5 text-destructive hover:bg-destructive/10"
                      disabled={busyId === app.userId}
                      onClick={() => openReject(app)}
                    >
                      <ShieldX className="h-3.5 w-3.5" /> Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={!!rejectTarget} onClose={() => setRejectTarget(null)}>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Reject {rejectTarget?.name}'s application</h2>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (shown to the applicant)</Label>
            <Textarea
              id="reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. We need to see more detail on your teaching experience."
              className="min-h-24"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={busyId === rejectTarget?.userId || !rejectReason.trim()}
              onClick={handleReject}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
