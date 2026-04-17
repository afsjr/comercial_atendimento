'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';
import { Users, TrendingUp, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface DashboardStats {
  totalLeads: number;
  leadsEsteMes: number;
  totalDeals: number;
  dealsAbertos: number;
  dealsGanhos: number;
  dealsPerdidos: number;
  valorTotal: number;
  valorMedio: number;
  solicitacoesAbertas: number;
  followUpsPendentes: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    leadsEsteMes: 0,
    totalDeals: 0,
    dealsAbertos: 0,
    dealsGanhos: 0,
    dealsPerdidos: 0,
    valorTotal: 0,
    valorMedio: 0,
    solicitacoesAbertas: 0,
    followUpsPendentes: 0,
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
        const now = new Date();
        const primeiroDiaMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const [contactsData, dealsData, requestsData, interactionsData] = await Promise.all([
          supabase.from('contacts').select('id, created_at'),
          supabase.from('deals').select('id, value, stage_id, lost_reason'),
          supabase.from('requests').select('id, status'),
          supabase.from('interactions').select('id, next_action_date'),
        ]);

        const totalLeads = contactsData.data?.length || 0;
        const leadsEsteMes = contactsData.data?.filter(
          c => c.created_at >= primeiroDiaMes
        ).length || 0;

        const deals = dealsData.data || [];
        const totalDeals = deals.length;
        
        const dealsAbertos = deals.filter(d => !d.lost_reason).length;
        const dealsGanhos = deals.filter(d => d.stage_id && deals.find(s => s.stage_id === d.stage_id)).length;
        const dealsPerdidos = deals.filter(d => d.lost_reason).length;

        const valorTotal = deals.reduce((sum, d) => sum + (d.value || 0), 0);
        const valorMedio = totalDeals > 0 ? valorTotal / totalDeals : 0;

        const requests = requestsData.data || [];
        const solicitacoesAbertas = requests.filter(r => r.status !== 'resolvido').length;

        const interactions = interactionsData.data || [];
        const followUpsPendentes = interactions.filter(i => {
          if (!i.next_action_date) return false;
          return new Date(i.next_action_date) < now;
        }).length;

        setStats({
          totalLeads,
          leadsEsteMes,
          totalDeals,
          dealsAbertos,
          dealsGanhos,
          dealsPerdidos,
          valorTotal,
          valorMedio,
          solicitacoesAbertas,
          followUpsPendentes,
        });

        setError(null);
      } catch (err: any) {
        console.error('Erro:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const kpiCards = [
    {
      label: 'Total de Leads',
      value: stats.totalLeads,
      subtext: `${stats.leadsEsteMes} este mês`,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Oportunidades',
      value: stats.totalDeals,
      subtext: `${stats.dealsAbertos} abertas`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Valor Total',
      value: `R$ ${stats.valorTotal.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
      subtext: `Média: R$ ${stats.valorMedio.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Solicitações',
      value: stats.solicitacoesAbertas,
      subtext: 'Secretaria',
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  const conversionRate = stats.totalDeals > 0 
    ? Math.round((stats.dealsGanhos / stats.totalDeals) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Erro ao carregar dados: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white p-5 rounded-lg shadow-sm border border-zinc-200"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-zinc-500">{kpi.label}</span>
              <div className={`p-2 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-zinc-900">
              {loading ? '...' : kpi.value}
            </p>
            <p className="text-xs text-zinc-500 mt-1">{kpi.subtext}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-zinc-200">
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">
            Performance
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-zinc-600">Taxa de Conversão</span>
              <span className="font-semibold text-zinc-900">
                {loading ? '...' : `${conversionRate}%`}
              </span>
            </div>
            <div className="w-full bg-zinc-100 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${conversionRate}%` }}
              />
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-zinc-600">Vencidos</span>
              <span className="font-semibold text-red-600">
                {stats.followUpsPendentes}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-zinc-600">Ganhos</span>
              <span className="font-semibold text-green-600">{stats.dealsGanhos}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-zinc-600">Perdidos</span>
              <span className="font-semibold text-zinc-600">{stats.dealsPerdidos}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-zinc-200">
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">
            Ações Pendentes
          </h3>
          <div className="space-y-3">
            {stats.followUpsPendentes > 0 ? (
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">
                    {stats.followUpsPendentes} follow-up(s) atrasado(s)
                  </p>
                  <p className="text-sm text-amber-600">
                    Verifique suas interações pendentes
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Nenhum follow-up atrasado</p>
                  <p className="text-sm text-green-600">Parabéns!</p>
                </div>
              </div>
            )}

            {stats.solicitacoesAbertas > 0 && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">
                    {stats.solicitacoesAbertas} solicitação(ões) aberta(s)
                  </p>
                  <p className="text-sm text-blue-600">
                    Acesse a Secretaria para atende-las
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-lg shadow-sm border border-zinc-200">
        <h3 className="text-lg font-semibold text-zinc-900 mb-2">
          Bem-vindo ao Sistema de Atendimento Comercial
        </h3>
        <p className="text-zinc-600">
          Utilize o menu lateral para navegar entre as funcionalidades do sistema.
        </p>
      </div>
    </div>
  );
}