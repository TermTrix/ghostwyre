'use client'

import { useState } from 'react'
import { Folder, Trash2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { ScanSession } from './types'

const DEMO_HISTORY: ScanSession[] = [
  { id: '1', title: 'Scan 192.168.1.1',    target: '192.168.1.1',  preview: 'Port scan — 4 open ports found',        timestamp: new Date(Date.now() - 60000),     status: 'completed' },
  // { id: '2', title: 'Web scan google.com', target: 'google.com',   preview: 'No critical vulnerabilities detected',   timestamp: new Date(Date.now() - 3600000),   status: 'completed' },
  // { id: '3', title: 'nmap 10.0.0.0/24',   target: '10.0.0.0/24',  preview: 'Network sweep — 12 hosts discovered',    timestamp: new Date(Date.now() - 7200000),   status: 'completed' },
  // { id: '4', title: 'Vuln check nginx',    target: 'nginx server', preview: 'CVE-2023-44487 detected',                timestamp: new Date(Date.now() - 86400000),  status: 'completed' },
  // { id: '5', title: 'SSH audit 10.0.1.5', target: '10.0.1.5',     preview: 'Weak cipher suites found on port 22',    timestamp: new Date(Date.now() - 172800000), status: 'completed' },
  // { id: '6', title: 'SSL/TLS scan',        target: 'api.acme.com', preview: 'TLS 1.0 still enabled — medium risk',   timestamp: new Date(Date.now() - 259200000), status: 'failed'    },
]

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

interface HistoryPanelProps {
  activeId?: string
  onSelect?: (session: ScanSession) => void
}

export default function HistoryPanel({ activeId, onSelect }: HistoryPanelProps) {
  const [history, setHistory] = useState<ScanSession[]>(DEMO_HISTORY)

  const clearHistory = () => setHistory([])

  return (
    <aside className="flex flex-col w-72 h-svh border-l border-border bg-sidebar shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 shrink-0">
        <h2 className="text-sm font-semibold">History</h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={clearHistory}>
              <Clock className="size-4 text-muted-foreground" />
              <span className="sr-only">Clear history</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear all</TooltipContent>
        </Tooltip>
      </div>

      <Separator />

      {/* Session list */}
      <div className="flex-1 overflow-y-auto py-2">
        {history.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center mt-10 px-4">
            No scan history yet
          </p>
        ) : (
          history.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelect?.(session)}
              className={cn(
                'flex items-start gap-3 w-full px-3 py-3 text-left hover:bg-muted/50 transition-colors',
                activeId === session.id && 'bg-muted/60'
              )}
            >
              <Folder className={cn('size-4 mt-0.5 shrink-0', session.status === 'failed' ? 'text-destructive' : 'text-muted-foreground')} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{session.title}</p>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">{session.preview}</p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">{formatRelativeTime(session.timestamp)}</span>
            </button>
          ))
        )}
      </div>

      <Separator />

      {/* Delete history */}
      <div className="p-3">
        <Button
          variant="destructive"
          size="sm"
          className="w-full gap-2 text-xs"
          onClick={clearHistory}
        >
          <Trash2 className="size-3.5" />
          Delete history
        </Button>
      </div>
    </aside>
  )
}
