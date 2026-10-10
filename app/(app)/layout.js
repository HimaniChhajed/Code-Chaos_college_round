import Link from 'next/link';
import { IconMenu, IconUser } from '@/components/icons';

export default function AppLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-[240px] border-r-[3px] border-border bg-surface">
        <div className="h-[60px] flex items-center px-4 border-b-[3px] border-border">
          <div className="bg-primary border-[2px] border-border w-8 h-8 mr-3 rounded-[2px]" />
          <span className="font-heading font-black text-2xl uppercase tracking-[-0.03em]">NEXUS</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          <NavLink href="/dashboard">Dashboard</NavLink>
          <NavLink href="/crm">CRM</NavLink>
          <NavLink href="/website">Website</NavLink>
          <NavLink href="/marketing">Marketing</NavLink>
          <NavLink href="/billing">Billing</NavLink>
          <NavLink href="/webinars">Webinars</NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-[60px] border-b-[3px] border-border bg-surface flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <button className="md:hidden">
              <IconMenu />
            </button>
            <div className="font-heading text-[11px] font-bold tracking-[0.12em] bg-border text-surface px-[14px] py-[5px] rounded-[2px] uppercase">
              Demo Workspace
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 font-heading font-bold uppercase text-sm border-[3px] border-border rounded-[4px] shadow-[3px_3px_0_0_#0A0A0A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_0_#0A0A0A] transition-all bg-primary">
              Run Agent
            </button>
            <button className="p-2 border-[3px] border-border rounded-[4px] bg-background hover:bg-gray-50 shadow-[3px_3px_0_0_#0A0A0A] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_0_#0A0A0A]">
              <IconUser />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-[64px] bg-background">
          {children}
        </main>
      </div>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[60px] border-t-[3px] border-border bg-surface flex items-center justify-around z-50">
        <Link href="/dashboard" className="p-2 font-heading font-bold uppercase text-sm">Dash</Link>
        <Link href="/crm" className="p-2 font-heading font-bold uppercase text-sm">CRM</Link>
        <Link href="/website" className="p-2 font-heading font-bold uppercase text-sm">Site</Link>
        <Link href="/marketing" className="p-2 font-heading font-bold uppercase text-sm">Mktg</Link>
      </nav>
    </div>
  );
}

function NavLink({ href, children }) {
  return (
    <Link 
      href={href} 
      className="block px-4 py-2 font-heading font-bold uppercase text-lg hover:bg-primary border-[3px] border-transparent hover:border-border hover:rounded-[4px] hover:shadow-[3px_3px_0_0_#0A0A0A] transition-all"
    >
      {children}
    </Link>
  );
}
