'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';

interface Stats {
  totalLeads: number;
  totalDeals: number;
  emNegociacao: number;
  ganhos: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    totalDeals: 0,
    emNegociacao: 0,
    ganhos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      try {
        // Fetch contacts - sem count para evitar erro de RLS
        const { data: contactsData, error: contactsError } = await supabase
          .from('contacts')
          .select('id');

        if (contactsError) {
          console.log('Erro contacts:', contactsError.message);
        }

        // Fetch deals
        const { data: dealsData, error: dealsError } = await supabase
          .from('deals')
          .select('id');

        if (dealsError) {
          console.log('Erro deals:', dealsError.message);
        }

        setStats({
          totalLeads: contactsData?.length || 0,
          totalDeals: dealsData?.length || 0,
          emNegociacao: 0,
          ganhos: 0,
        });
        
        setError(null);
      } catch (err: any) {
        console.log('Erro catch:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const kpis = [
    { label: 'Total de Leads', value: stats.totalLeads },
    { label: 'Oportunidades', value: stats.totalDeals },
    { label: 'Em Negociação', value: stats.emNegociacao },
    { label: 'Ganhos', value: stats.ganhos },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200"
          >
            <p className="text-sm text-zinc-500 mb-1">{kpi.label}</p>
            <p className="text-3xl font-bold text-zinc-900">
              {loading ? '...' : kpi.value}
            </p>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Erro: {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
        <h3 className="text-lg font-semibold text-zinc-900 mb-4">
          Bem-vindo ao Sistema de Atendimento
        </h3>
        <p className="text-zinc-600 mb-4">
          Selecione uma opção no menu lateral para começar.
        </p>
        <div className="text-sm text-zinc-500">
          <p>Total de leads: {stats.totalLeads}</p>
          <p>Total de oportunidades: {stats.totalDeals}</p>
        </div>
      </div>
    </div>
  );
}