'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const timeoutId = setTimeout(() => {
        setError('Tempo limite excedido.redirecionando para login...');
        router.push('/login');
      }, 5000);

      try {
        const { data, error: authError } = await supabase.auth.getUser();

        clearTimeout(timeoutId);

        if (authError) {
          console.error('Erro ao buscar usuário:', authError);
          router.push('/login');
        } else if (data.user) {
          router.push('/leads');
        } else {
          router.push('/login');
        }
      } catch (err) {
        clearTimeout(timeoutId);
        console.error('Erro na autenticação:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      {loading ? (
        <div className="text-zinc-500">Carregando...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : null}
    </div>
  );
}