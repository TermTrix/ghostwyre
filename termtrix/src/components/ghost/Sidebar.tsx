'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import {
  Shield,
  Plus,
  Search,
  LayoutGrid,
  FileText,
  Users,
  Settings,
  LogOut,
  Zap,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const NAV_ITEMS = [
  { icon: Search, label: 'Explore' },
  { icon: LayoutGrid, label: 'Dashboard' },
  { icon: FileText, label: 'Reports' },
  { icon: Users, label: 'Team' },
  { icon: Settings, label: 'Settings' },
]

export default function GhostSidebar() {
  const [active, setActive] = useState('Explore')
  const router = useRouter()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.replace('/signin')
  }

  return (
    <Sidebar collapsible="none">
      {/* Logo */}
      <SidebarHeader className="px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <Shield className="size-4 text-emerald-400" />
          </div>
          <span className="font-semibold text-sm tracking-wide">GhostWyre</span>
        </div>
      </SidebarHeader>

      {/* New Scan */}
      <div className="px-3 pb-3">
        <Button className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600 text-white border-0">
          <Plus className="size-4" />
          New Scan
        </Button>
      </div>

      <SidebarSeparator />

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(({ icon: Icon, label }) => (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton
                    isActive={active === label}
                    onClick={() => setActive(label)}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Pro Plan + Logout */}
      <SidebarFooter className="gap-2 px-3 pb-4">
        <Card size="sm" className="border-emerald-500/20">
          <CardContent className="p-3 flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <Zap className="size-3.5 text-emerald-400" />
              <span className="text-xs font-semibold">Pro Plan</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Unlock unlimited scans &amp; advanced reports
            </p>
            <Button size="sm" variant="outline" className="w-full text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
              Upgrade now
            </Button>
          </CardContent>
        </Card>

        {user && (
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt=""
                className="size-7 shrink-0 rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-medium text-emerald-400">
                {(user.displayName ?? user.email ?? '?').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{user.displayName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
        )}

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut}>
              <LogOut />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
