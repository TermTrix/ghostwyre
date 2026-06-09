import { Shield } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import ScanResultCard from './ScanResultCard'
import type { Message } from './types'

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="flex items-end gap-2 max-w-[70%]">
          <div className="rounded-2xl rounded-br-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm leading-relaxed">
            {message.content}
          </div>
          <div className="size-7 rounded-full bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
            U
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 mb-4 max-w-[85%]">
      {/* Avatar */}
      <div className="flex items-center justify-center size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 shrink-0 mt-0.5">
        <Shield className="size-4 text-emerald-400" />
      </div>

      <div className="flex-1">
        {message.isLoading ? (
          <div className="space-y-2 pt-1">
            <Skeleton className="h-3.5 w-48" />
            <Skeleton className="h-3.5 w-36" />
          </div>
        ) : (
          <>
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {message.content}
            </p>
            {message.scanResults && message.scanResults.length > 0 && (
              <ScanResultCard results={message.scanResults} />
            )}
          </>
        )}
        <span className="text-[11px] text-muted-foreground mt-1.5 block">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}
