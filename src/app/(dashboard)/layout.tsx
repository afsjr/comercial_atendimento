import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Columns3, Search, Bell } from 'lucide-react';
import { redirect } from 'next/navigation';
import { NavLinks } from './NavLinks'; // Client component for active state
import { SignOutButton } from './SignOutButton'; // Client component for logout
import { ThemeToggle } from './ThemeToggle'; // Client component for dark mode

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // Get user profile if needed
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('user_id', user.id)
    .single();

  const userName = profile?.full_name || user.email?.split('@')[0] || 'Usuário';

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex font-sans transition-colors duration-300">
      
      {/* Premium Sidebar */}
      <aside className="w-72 bg-zinc-950 text-zinc-300 flex flex-col border-r border-zinc-800 shadow-xl z-20">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800/60 bg-zinc-950/50 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Columns3 className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">CRM Escolar</h1>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
          <NavLinks />
        </div>

        <div className="p-4 border-t border-zinc-800/60 bg-zinc-900/30">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-inner">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-xs text-zinc-500 truncate">{profile?.role || 'Comercial'}</p>
            </div>
          </div>
          <div className="mt-3">
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

        {/* Header */}
        <header className="h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors duration-300">
          <div className="flex items-center text-sm font-medium text-zinc-500 dark:text-zinc-400">
             {/* We can use breadcrumbs here in the future */}
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            <div className="relative group cursor-pointer hidden md:block">
              <Search className="w-5 h-5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" />
            </div>
            <div className="relative cursor-pointer">
              <Bell className="w-5 h-5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" />
              <span className="absolute 1 top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-zinc-950"></span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 relative z-0">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}