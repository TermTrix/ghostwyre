export type MessageRole = 'user' | 'assistant'

export type ScanState = 'open' | 'closed' | 'filtered'

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'info'

export type SessionStatus = 'completed' | 'running' | 'failed'

export interface ScanResult {
  port: number
  service: string
  state: ScanState
  risk: RiskLevel
  version?: string
}

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  scanResults?: ScanResult[]
  isLoading?: boolean
}

export interface ScanSession {
  id: string
  title: string
  target: string
  preview: string
  timestamp: Date
  status: SessionStatus
}
