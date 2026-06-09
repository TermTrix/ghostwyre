import { SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import GhostSidebar from '@/components/ghost/Sidebar'
import ChatPanel from '@/components/ghost/ChatPanel'
import HistoryPanel from '@/components/ghost/HistoryPanel'
import type { ScanSession } from '@/components/ghost/types'

const ACTIVE_SESSION: ScanSession = {
  id: 'current',
  title: 'Scan 192.168.1.1',
  target: '192.168.1.1',
  preview: 'Port scan — 4 open ports found',
  timestamp: new Date(),
  status: 'running',
}

export default function Home() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex h-svh w-full overflow-hidden">
          <GhostSidebar />
          <ChatPanel session={ACTIVE_SESSION} />
          <HistoryPanel activeId="1" />
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}
