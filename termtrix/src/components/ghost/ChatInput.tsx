'use client'

import { useState, useRef, type KeyboardEvent } from 'react'
import { Send, Paperclip, Mic, Wifi, Globe, ShieldAlert, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

const QUICK_ACTIONS = [
  { icon: Wifi, label: 'Port Scan' },
  { icon: Globe, label: 'Web Scan' },
  { icon: ShieldAlert, label: 'Vuln Check' },
  { icon: MoreHorizontal, label: 'More' },
]

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    inputRef.current?.focus()
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickAction = (label: string) => {
    const prompts: Record<string, string> = {
      'Port Scan': 'Run a port scan on ',
      'Web Scan': 'Perform a web vulnerability scan on ',
      'Vuln Check': 'Check for vulnerabilities on ',
    }
    if (prompts[label]) {
      setValue(prompts[label])
      inputRef.current?.focus()
    }
  }

  return (
    <div className="border-t border-border bg-background p-4 space-y-3">
      {/* Quick action chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {QUICK_ACTIONS.map(({ icon: Icon, label }) => (
          <Button
            key={label}
            variant="outline"
            size="sm"
            className="gap-1.5 h-7 text-xs rounded-full"
            onClick={() => handleQuickAction(label)}
            disabled={disabled}
          >
            <Icon className="size-3.5" />
            {label}
          </Button>
        ))}
      </div>

      <Separator />

      {/* Input row */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" disabled={disabled}>
          <Paperclip />
          <span className="sr-only">Attach file</span>
        </Button>
        <Button variant="ghost" size="icon-sm" disabled={disabled}>
          <Mic />
          <span className="sr-only">Voice input</span>
        </Button>

        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask me something... (e.g. scan 192.168.1.1)"
          disabled={disabled}
          className="flex-1 h-9 text-sm bg-muted/30"
        />

        <Button
          size="icon"
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shrink-0"
        >
          <Send />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </div>
  )
}
