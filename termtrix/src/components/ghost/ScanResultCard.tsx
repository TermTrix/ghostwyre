import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ScanResult, RiskLevel } from './types'

const RISK_STYLES: Record<RiskLevel, string> = {
  critical: 'bg-red-500/15 text-red-400 border-red-500/30',
  high:     'bg-orange-500/15 text-orange-400 border-orange-500/30',
  medium:   'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  low:      'bg-blue-500/15 text-blue-400 border-blue-500/30',
  info:     'bg-muted text-muted-foreground border-border',
}

const STATE_STYLES: Record<string, string> = {
  open:     'text-emerald-400',
  closed:   'text-muted-foreground',
  filtered: 'text-yellow-400',
}

interface ScanResultCardProps {
  results: ScanResult[]
  target?: string
}

export default function ScanResultCard({ results, target }: ScanResultCardProps) {
  return (
    <Card size="sm" className="mt-3 max-w-lg">
      <CardHeader>
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {target ? `Scan results — ${target}` : 'Scan results'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">Port</th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">Service</th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">State</th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">Risk</th>
              {results.some((r) => r.version) && (
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Version</th>
              )}
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.port} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-2 font-mono font-semibold">{r.port}</td>
                <td className="px-4 py-2 text-muted-foreground">{r.service}</td>
                <td className={cn('px-4 py-2 font-medium capitalize', STATE_STYLES[r.state])}>
                  {r.state}
                </td>
                <td className="px-4 py-2">
                  <span className={cn('inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium capitalize', RISK_STYLES[r.risk])}>
                    {r.risk}
                  </span>
                </td>
                {results.some((x) => x.version) && (
                  <td className="px-4 py-2 font-mono text-muted-foreground">{r.version ?? '—'}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
