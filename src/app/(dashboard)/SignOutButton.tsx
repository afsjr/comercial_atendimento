'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useState } from 'react';

export function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    setIsSigningOut(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isSigningOut}
      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-400 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:text-white hover:bg-rose-500/10 hover:border-rose-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <LogOut className="w-4 h-4" />
      {isSigningOut ? 'Saindo...' : 'Sair da Conta'}
    </button>
  );
}
