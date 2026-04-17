'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Columns3, Inbox, GraduationCap, BarChart3, Settings } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Visão Geral', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/pipeline', label: 'Pipeline', icon: Columns3 },
  { href: '/inbox', label: 'Inbox', icon: Inbox },
  { href: '/secretaria', label: 'Secretaria', icon: GraduationCap },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-indigo-500/10 text-indigo-400 font-medium'
                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
            }`}
          >
            <item.icon 
              className={`w-5 h-5 transition-transform duration-200 ${
                isActive ? 'scale-110' : 'group-hover:scale-110'
              }`} 
            />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
