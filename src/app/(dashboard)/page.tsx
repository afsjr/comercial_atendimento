import { createClient } from '@/lib/supabase/server';
import { Users, TrendingUp, DollarSign, Clock, CheckCircle, AlertCircle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0; // Ensures fresh data on every load

export default async function DashboardPage() {
  const supabase = await createClient();

  const now = new Date();
  const primeiroDiaMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Parallel data fetching for performance
  const [contactsRes, dealsRes, requestsRes, interactionsRes] = await Promise.all([
    supabase.from('contacts').select('id, created_at'),
    supabase.from('deals').select('id, value, stage_id, lost_reason'),
    supabase.from('requests').select('id, status'),
    supabase.from('interactions').select('id, next_action_date'),
  ]);

  const contacts = contactsRes.data || [];
  const deals = dealsRes.data || [];
  const requests = requestsRes.data || [];
  const interactions = interactionsRes.data || [];

  // Metrics Calculations
  const totalLeads = contacts.length;
  const leadsEsteMes = contacts.filter(c => c.created_at >= primeiroDiaMes).length;

  const totalDeals = deals.length;
  const dealsAbertos = deals.filter(d => !d.lost_reason).length;
  const dealsGanhos = deals.filter(d => d.stage_id && deals.find(s => s.stage_id === d.stage_id)).length;
  const dealsPerdidos = deals.filter(d => d.lost_reason).length;

  const valorTotal = deals.reduce((sum, d) => sum + (d.value || 0), 0);
  const valorMedio = totalDeals > 0 ? valorTotal / totalDeals : 0;

  const solicitacoesAbertas = requests.filter(r => r.status !== 'resolvido').length;

  const followUpsPendentes = interactions.filter(i => {
    if (!i.next_action_date) return false;
    return new Date(i.next_action_date) < now;
  }).length;

  const conversionRate = totalDeals > 0 
    ? Math.round((dealsGanhos / totalDeals) * 100) 
    : 0;

  const kpiCards = [
    {
      title: 'Total de Leads',
      value: totalLeads.toString(),
      trend: `+${leadsEsteMes} este mês`,
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      lightColor: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    },
    {
      title: 'Oportunidades Abertas',
      value: dealsAbertos.toString(),
      trend: `${totalDeals} no total`,
      icon: TrendingUp,
      color: 'from-violet-500 to-purple-600',
      lightColor: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
    },
    {
      title: 'Valor em Pipeline',
      value: `R$ ${valorTotal.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
      trend: `Média: R$ ${valorMedio.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: 'from-emerald-400 to-teal-500',
      lightColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    },
    {
      title: 'Ações Pendentes',
      value: (solicitacoesAbertas + followUpsPendentes).toString(),
      trend: 'Requerem atenção',
      icon: Clock,
      color: 'from-amber-400 to-orange-500',
      lightColor: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 transition-colors">Visão Geral</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 transition-colors">Acompanhe seus resultados e tarefas pendentes.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/pipeline"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-full shadow-sm hover:bg-indigo-700 transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            Ver Pipeline <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, idx) => (
          <div
            key={kpi.title}
            className="group relative bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden hover:shadow-md transition-all duration-300"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${kpi.color} opacity-[0.03] dark:opacity-10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`} />
            
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-4">
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 transition-colors">{kpi.title}</span>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight transition-colors">
                  {kpi.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl transition-colors ${kpi.lightColor}`}>
                <kpi.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm relative z-10">
              <span className="text-zinc-600 dark:text-zinc-400 font-medium bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md transition-colors">
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Performance Box */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden flex flex-col transition-colors duration-300">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 transition-colors">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Performance de Vendas</h3>
          </div>
          <div className="p-6 space-y-8 flex-1 flex flex-col justify-center">
            
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider transition-colors">Taxa de Conversão</span>
                <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400 transition-colors">
                  {conversionRate}%
                </span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden transition-colors">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 dark:to-indigo-400 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${conversionRate}%` }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-green-50 dark:bg-emerald-500/10 rounded-xl p-4 border border-green-100 dark:border-emerald-500/20 transition-colors">
                <span className="block text-sm text-green-600 dark:text-emerald-400 font-medium mb-1">Ganhos</span>
                <span className="text-2xl font-bold text-green-700 dark:text-emerald-300">{dealsGanhos}</span>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700 transition-colors">
                <span className="block text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-1">Perdidos</span>
                <span className="text-2xl font-bold text-zinc-700 dark:text-zinc-300">{dealsPerdidos}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Action Center Box */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden flex flex-col transition-colors duration-300">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 transition-colors">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Central de Ações</h3>
          </div>
          <div className="p-6 space-y-4 flex-1">
            
            {followUpsPendentes > 0 ? (
              <div className="group flex items-start gap-4 p-4 bg-orange-50/80 dark:bg-orange-500/10 rounded-xl border border-orange-100 dark:border-orange-500/20 transition-colors hover:bg-orange-50 dark:hover:bg-orange-500/20">
                <div className="p-2 bg-orange-100 dark:bg-orange-500/20 rounded-lg text-orange-600 dark:text-orange-400 mt-0.5 transition-colors">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-orange-900 dark:text-orange-300 transition-colors">
                    {followUpsPendentes} Follow-up{followUpsPendentes > 1 ? 's' : ''} Atrasado{followUpsPendentes > 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-orange-700/80 dark:text-orange-400/80 mt-1 transition-colors">
                    Existem interações com clientes que passaram do prazo definido.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4 p-4 bg-emerald-50/80 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20 transition-colors">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400 mt-0.5 transition-colors">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-emerald-900 dark:text-emerald-300 transition-colors">Follow-ups em dia</p>
                  <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80 mt-1 transition-colors">Excelente! Nenhuma interação atrasada.</p>
                </div>
              </div>
            )}

            {solicitacoesAbertas > 0 ? (
              <Link href="/secretaria" className="block group">
                <div className="flex items-start gap-4 p-4 bg-blue-50/80 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20 transition-colors hover:bg-blue-50 dark:hover:bg-blue-500/20">
                  <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400 mt-0.5 transition-colors">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-blue-900 dark:text-blue-300 transition-colors">
                        {solicitacoesAbertas} Solicitaç{solicitacoesAbertas > 1 ? 'ões' : 'ão'} Pendente{solicitacoesAbertas > 1 ? 's' : ''}
                      </p>
                      <ArrowUpRight className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm text-blue-700/80 dark:text-blue-400/80 mt-1 transition-colors">
                      Há chamados abertos na Secretaria aguardando atendimento.
                    </p>
                  </div>
                </div>
              </Link>
            ) : (
               <div className="flex items-start gap-4 p-4 bg-zinc-50/80 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 transition-colors">
                <div className="p-2 bg-zinc-200 dark:bg-zinc-700/50 rounded-lg text-zinc-500 dark:text-zinc-400 mt-0.5 transition-colors">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300 transition-colors">Fila da Secretaria vazia</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 transition-colors">Nenhuma solicitação pendente no momento.</p>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}