'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Phone, Mail, Building, Calendar, Edit, Plus, MessageCircle, Clock } from 'lucide-react';
import { Modal } from '@/components/Modal';

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  company: string | null;
  source: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface Deal {
  id: string;
  title: string;
  value: number | null;
  stage_id: string;
  stage_name?: string;
  stage_color?: string;
  created_at: string;
}

interface Interaction {
  id: string;
  type: string;
  notes: string | null;
  next_action: string | null;
  next_action_date: string | null;
  created_at: string;
  user_name?: string;
}

interface Stage {
  id: string;
  name: string;
  color: string;
}

const typeLabels: Record<string, { label: string; icon: string }> = {
  ligacao: { label: 'Ligação', icon: '📞' },
  whatsapp: { label: 'WhatsApp', icon: '💬' },
  email: { label: 'E-mail', icon: '📧' },
  reuniao: { label: 'Reunião', icon: '🤝' },
  visita: { label: 'Visita', icon: '🚗' },
  outro: { label: 'Outro', icon: '📝' },
};

const sourceLabels: Record<string, string> = {
  manual: 'Manual',
  chatwoot: 'Chatwoot',
  formulario: 'Formulário',
  indicacao: 'Indicação',
  site: 'Site',
  outro: 'Outro',
};

const interactionTypeOptions = [
  { value: 'ligacao', label: '📞 Ligação' },
  { value: 'whatsapp', label: '💬 WhatsApp' },
  { value: 'email', label: '📧 E-mail' },
  { value: 'reuniao', label: '🤝 Reunião' },
  { value: 'visita', label: '🚗 Visita' },
  { value: 'outro', label: '📝 Outro' },
];

interface InteractionFormData {
  type: string;
  notes: string;
  next_action: string;
  next_action_date: string;
}

const initialInteractionForm: InteractionFormData = {
  type: 'whatsapp',
  notes: '',
  next_action: '',
  next_action_date: '',
};

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [interactionForm, setInteractionForm] = useState<InteractionFormData>(initialInteractionForm);
  const [savingInteraction, setSavingInteraction] = useState(false);
  const [interactionError, setInteractionError] = useState<string | null>(null);
  const [interactionSuccess, setInteractionSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, [contactId]);

  const fetchData = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      const [contactData, dealsData, interactionsData, stagesData] = await Promise.all([
        supabase.from('contacts').select('*').eq('id', contactId).single(),
        supabase.from('deals').select('*').eq('contact_id', contactId).order('created_at', { ascending: false }),
        supabase.from('interactions').select('*').eq('contact_id', contactId).order('created_at', { ascending: false }),
        supabase.from('pipeline_stages').select('*').order('position'),
      ]);

      setContact(contactData.data);
      setDeals(dealsData.data || []);
      setInteractions(interactionsData.data || []);
      setStages(stagesData.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStageInfo = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    return stage || { name: 'Desconhecido', color: '#6366f1' };
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleInteractionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInteraction(true);
    setInteractionError(null);
    setInteractionSuccess(false);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setInteractionError('Usuário não autenticado');
        setSavingInteraction(false);
        return;
      }

      const { error: insertError } = await supabase.from('interactions').insert({
        contact_id: contactId,
        user_id: user.id,
        type: interactionForm.type,
        notes: interactionForm.notes.trim() || null,
        next_action: interactionForm.next_action.trim() || null,
        next_action_date: interactionForm.next_action_date || null,
      });

      if (insertError) {
        setInteractionError(insertError.message);
      } else {
        setInteractionSuccess(true);
        fetchData();
        setTimeout(() => {
          setIsInteractionModalOpen(false);
          setInteractionForm(initialInteractionForm);
          setInteractionSuccess(false);
        }, 1000);
      }
    } catch (err: any) {
      setInteractionError(err.message);
    } finally {
      setSavingInteraction(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500">Carregando...</p>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.push('/leads')}
          className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Leads
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Erro: {error || 'Contato não encontrado'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push('/leads')}
        className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Leads
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-zinc-900">{contact.name}</h1>
                <p className="text-zinc-500">
                  <span className="px-2 py-1 bg-zinc-100 rounded text-xs">
                    {sourceLabels[contact.source] || contact.source}
                  </span>
                </p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-zinc-300 rounded-md hover:bg-zinc-50">
                <Edit className="w-4 h-4" />
                Editar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {contact.email && (
                <div className="flex items-center gap-3 text-zinc-600">
                  <Mail className="w-5 h-5 text-zinc-400" />
                  <span>{contact.email}</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-3 text-zinc-600">
                  <Phone className="w-5 h-5 text-zinc-400" />
                  <span>{contact.phone}</span>
                </div>
              )}
              {contact.whatsapp && (
                <div className="flex items-center gap-3 text-zinc-600">
                  <MessageCircle className="w-5 h-5 text-zinc-400" />
                  <span>{contact.whatsapp}</span>
                </div>
              )}
              {contact.company && (
                <div className="flex items-center gap-3 text-zinc-600">
                  <Building className="w-5 h-5 text-zinc-400" />
                  <span>{contact.company}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-zinc-600">
                <Calendar className="w-5 h-5 text-zinc-400" />
                <span>Criado em {new Date(contact.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>

            {contact.notes && (
              <div className="mt-6 pt-6 border-t border-zinc-200">
                <h3 className="text-sm font-medium text-zinc-500 mb-2">Observações</h3>
                <p className="text-zinc-700">{contact.notes}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-zinc-900">Timeline de Interações</h2>
              <button
                onClick={() => setIsInteractionModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" />
                Registrar Interação
              </button>
            </div>

            {interactions.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                Nenhuma interação registrada
              </div>
            ) : (
              <div className="space-y-4">
                {interactions.map((interaction) => {
                  const typeInfo = typeLabels[interaction.type] || typeLabels.outro;
                  return (
                    <div key={interaction.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-lg">
                          {typeInfo.icon}
                        </div>
                        <div className="w-0.5 flex-1 bg-zinc-200 mt-2"></div>
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-zinc-900">{typeInfo.label}</span>
                          {interaction.next_action_date && new Date(interaction.next_action_date) < new Date() && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                              Atrasado
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-600 mb-2">
                          {interaction.notes || 'Sem notas'}
                        </p>
                        {interaction.next_action && (
                          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded">
                            <Clock className="w-4 h-4" />
                            <span>
                              <strong>Próxima ação:</strong> {interaction.next_action}
                              {interaction.next_action_date && (
                                <span className="ml-2">
                                  - {new Date(interaction.next_action_date).toLocaleDateString('pt-BR')}
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                        <p className="text-xs text-zinc-400 mt-2">
                          {formatDate(interaction.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Oportunidades</h2>
            {deals.length === 0 ? (
              <div className="text-center py-4 text-zinc-500 text-sm">
                Nenhuma oportunidade
              </div>
            ) : (
              <div className="space-y-3">
                {deals.map((deal) => {
                  const stage = getStageInfo(deal.stage_id);
                  return (
                    <div
                      key={deal.id}
                      className="p-3 border border-zinc-200 rounded-lg hover:bg-zinc-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: stage.color }}
                        ></div>
                        <span className="font-medium text-zinc-900 text-sm">{deal.title}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">{stage.name}</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(deal.value)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <button
              onClick={() => router.push('/pipeline')}
              className="w-full mt-4 text-sm text-indigo-600 hover:underline"
            >
              Ver todas as oportunidades →
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isInteractionModalOpen}
        onClose={() => {
          setIsInteractionModalOpen(false);
          setInteractionForm(initialInteractionForm);
          setInteractionError(null);
        }}
        title="Registrar Interação"
      >
        <form onSubmit={handleInteractionSubmit} className="space-y-4">
          {interactionError && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
              {interactionError}
            </div>
          )}

          {interactionSuccess && (
            <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg">
              Interação registrada com sucesso!
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Tipo de Interação *
            </label>
            <select
              value={interactionForm.type}
              onChange={(e) => setInteractionForm(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            >
              {interactionTypeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Notas
            </label>
            <textarea
              value={interactionForm.notes}
              onChange={(e) => setInteractionForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              placeholder="Descreva a interação..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Próxima Ação
            </label>
            <input
              type="text"
              value={interactionForm.next_action}
              onChange={(e) => setInteractionForm(prev => ({ ...prev, next_action: e.target.value }))}
              className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: Ligar novamente na sexta"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Data da Próxima Ação
            </label>
            <input
              type="date"
              value={interactionForm.next_action_date}
              onChange={(e) => setInteractionForm(prev => ({ ...prev, next_action_date: e.target.value }))}
              className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsInteractionModalOpen(false);
                setInteractionForm(initialInteractionForm);
              }}
              className="flex-1 px-4 py-2 border border-zinc-300 text-zinc-700 rounded-md hover:bg-zinc-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={savingInteraction}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {savingInteraction ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}