import React from 'react'
import { Outlet, Link, useLocation } from '@tanstack/react-router'
import { 
  AppShell, 
  AppShellSidebar, 
  AppShellMain, 
  MobileSidebarTrigger, 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter, 
  SidebarItem, 
  Button 
} from '@blinkdotnew/ui'
import { 
  LayoutDashboard, 
  Calculator, 
  ClipboardList, 
  MapPin, 
  Library, 
  Activity, 
  Settings, 
  PlusCircle 
} from 'lucide-react'

export function SharedLayout() {
  const location = useLocation()
  
  return (
    <AppShell>
      <AppShellSidebar className="shrink-0">
        <div className="flex flex-col h-full w-[240px] bg-sidebar border-r border-sidebar-border overflow-hidden">
          <div className="shrink-0 px-6 py-8 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20">
              P
            </div>
            <span className="font-bold text-lg tracking-tight">Peppies</span>
          </div>
          
          <div className="flex-1 min-h-0 overflow-y-auto px-3 space-y-1">
            <SidebarItem 
              icon={<LayoutDashboard size={20} />} 
              label="Dashboard" 
              href="/" 
              active={location.pathname === '/'} 
            />
            <SidebarItem 
              icon={<Calculator size={20} />} 
              label="Dose Calculator" 
              href="/calculator" 
              active={location.pathname === '/calculator'} 
            />
            <SidebarItem 
              icon={<ClipboardList size={20} />} 
              label="Injection Log" 
              href="/log" 
              active={location.pathname === '/log'} 
            />
            <SidebarItem 
              icon={<MapPin size={20} />} 
              label="Site Tracker" 
              href="/sites" 
              active={location.pathname === '/sites'} 
            />
            <SidebarItem 
              icon={<Library size={20} />} 
              label="Peptide Library" 
              href="/library" 
              active={location.pathname.startsWith('/library')} 
            />
            <SidebarItem 
              icon={<Activity size={20} />} 
              label="Find My Macros" 
              href="/macros" 
              active={location.pathname === '/macros'} 
            />
          </div>
          
          <div className="shrink-0 p-4 border-t border-sidebar-border">
            <SidebarItem 
              icon={<Settings size={20} />} 
              label="Settings" 
              href="/settings" 
              active={location.pathname === '/settings'} 
            />
          </div>
        </div>
      </AppShellSidebar>
      
      <AppShellMain className="flex flex-col min-h-screen">
        <div className="md:hidden h-14 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50 flex items-center px-4 gap-3">
          <MobileSidebarTrigger />
          <span className="font-bold">Peppies</span>
        </div>
        
        <div className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
          <Outlet />
        </div>
      </AppShellMain>
    </AppShell>
  )
}
