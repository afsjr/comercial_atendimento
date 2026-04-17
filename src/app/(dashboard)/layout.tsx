'use client';

import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/leads', label: 'Leads', icon: '👥' },
  { href: '/pipeline', label: 'Pipeline', icon: '📋' },
  { href: '/inbox', label: 'Inbox', icon: '📬' },
  { href: '/secretaria', label: 'Secretaria', icon: '🎓' },
  { href: '/relatorios', label: 'Relatórios', icon: '📈' },
  { href: '/configuracoes', label: 'Config', icon: '⚙️' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 text-white flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <h1 className="text-xl font-bold">Atendimento</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                pathname === item.href
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 text-zinc-400 hover:text-white transition-colors"
          >
            <span>🚪</span>
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold text-zinc-900">
            {navItems.find((item) => item.href === pathname)?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500">
              {user?.email || 'Carregando...'}
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 bg-zinc-50">
          {children}
        </div>
      </main>
    </div>
  );
}