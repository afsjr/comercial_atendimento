'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';
import { Plus, Search, DollarSign } from 'lucide-react';

interface Stage {
  id: string;
  name: string;
  position: number;
  color: string;
  is_won: boolean;
  is_lost: boolean;
}

interface Deal {
  id: string;
  title: string;
  value: number | null;
  stage_id: string;
  contact_id: string;
  assigned_to: string | null;
  course_interest: string | null;
  expected_close_date: string | null;
  lost_reason: string | null;
  created_at: string;
}

interface Contact {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

interface DealFormData {
  title: string;
  contact_id: string;
  value: string;
  expected_close_date: string;
  course_interest: string;
}

const initialFormData: DealFormData = {
  title: '',
  contact_id: '',
  value: '',
  expected_close_date: '',
  course_interest: '',
};

const courseOptions = [
  { value: '', label: 'Selecione um curso (opcional)' },
  { value: 'gestao_empresarial', label: 'Gestão Empresarial' },
  { value: 'gestao_de_pessoas', label: 'Gestão de Pessoas' },
  { value: 'gestao_financeira', label: 'Gestão Financeira' },
  { value: 'gestao_de_projetos', label: 'Gestão de Projetos' },
  { value: 'gestao_publica', label: 'Gestão Pública' },
  { value: 'logistica', label: 'Logística' },
  { value: 'recursos_humanos', label: 'Recursos Humanos' },
  { value: 'outro', label: 'Outro' },
];

export default function PipelinePage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [formData, setFormData] = useState<DealFormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      const [stagesData, dealsData, contactsData] = await Promise.all([
        supabase.from('pipeline_stages').select('*').order('position'),
        supabase.from('deals').select('*'),
        supabase.from('contacts').select('id, name, phone, email'),
      ]);

      setStages(stagesData.data || []);
      setDeals(dealsData.data || []);
      setContacts(contactsData.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact?.name || 'Contato não encontrado';
  };

  const getDealsByStage = (stageId: string) => {
    return deals.filter(d => d.stage_id === stageId);
  };

  const getStageValue = (stageId: string) => {
    const stageDeals = getDealsByStage(stageId);
    return stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) {
      return 'Título é obrigatório';
    }
    if (!formData.contact_id) {
      return 'Selecione um contato';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSaving(true);
    setFormError(null);
    setSuccess(false);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setFormError('Usuário não autenticado');
        setSaving(false);
        return;
      }

      const firstStage = stages[0];
      if (!firstStage) {
        setFormError('Nenhum stage disponível');
        setSaving(false);
        return;
      }

      const { error: insertError } = await supabase.from('deals').insert({
        title: formData.title.trim(),
        contact_id: formData.contact_id,
        value: formData.value ? parseFloat(formData.value.replace(',', '.')) : null,
        stage_id: firstStage.id,
        assigned_to: user.id,
        expected_close_date: formData.expected_close_date || null,
        course_interest: formData.course_interest || null,
      });

      if (insertError) {
        setFormError(insertError.message);
      } else {
        setSuccess(true);
        fetchData();
        setTimeout(() => {
          setIsModalOpen(false);
          setFormData(initialFormData);
          setSuccess(false);
        }, 1000);
      }
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(contactSearch.toLowerCase())) ||
    (c.phone && c.phone.includes(contactSearch))
  );

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500">Carregando pipeline...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-zinc-900">Pipeline de Vendas</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Oportunidade
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Erro: {error}
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageDeals = getDealsByStage(stage.id);
          const stageValue = getStageValue(stage.id);
          
          return (
            <div
              key={stage.id}
              className="flex-shrink-0 w-72 bg-zinc-50 rounded-lg border border-zinc-200"
            >
              <div 
                className="px-4 py-3 border-b border-zinc-200 rounded-t-lg"
                style={{ backgroundColor: stage.color + '20' }}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-zinc-900">{stage.name}</h3>
                  <span className="px-2 py-1 bg-white text-zinc-700 rounded text-sm">
                    {stageDeals.length}
                  </span>
                </div>
                {stageValue > 0 && (
                  <p className="text-xs text-zinc-600 mt-1">
                    {formatCurrency(stageValue)}
                  </p>
                )}
              </div>

              <div className="p-2 space-y-2 min-h-[200px]">
                {stageDeals.length === 0 ? (
                  <p className="text-sm text-zinc-400 text-center py-4">
                    Nenhuma oportunidade
                  </p>
                ) : (
                  stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="bg-white p-3 rounded-md border border-zinc-200 shadow-sm hover:shadow-md cursor-pointer"
                    >
                      <p className="font-medium text-zinc-900 text-sm">
                        {deal.title}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {getContactName(deal.contact_id)}
                      </p>
                      {deal.value && (
                        <p className="text-sm font-semibold text-green-600 mt-2">
                          {formatCurrency(deal.value)}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData(initialFormData);
          setFormError(null);
          setContactSearch('');
        }}
        title="Nova Oportunidade"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
              {formError}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg">
              Oportunidade criada com sucesso!
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Ex: Interesse em Gestão Empresarial"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Contato *
            </label>
            <input
              type="text"
              placeholder="Buscar contato..."
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-2"
            />
            <div className="max-h-40 overflow-y-auto border border-zinc-200 rounded-md">
              {filteredContacts.length === 0 ? (
                <p className="p-3 text-sm text-zinc-500 text-center">
                  Nenhum contato encontrado
                </p>
              ) : (
                filteredContacts.map(contact => (
                  <label
                    key={contact.id}
                    className={`flex items-center gap-3 p-2 cursor-pointer hover:bg-zinc-50 ${
                      formData.contact_id === contact.id ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="contact_id"
                      value={contact.id}
                      checked={formData.contact_id === contact.id}
                      onChange={handleInputChange}
                      className="text-indigo-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        {contact.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {contact.email || contact.phone || 'Sem informações'}
                      </p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Valor Estimado
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  className="w-full pl-8 pr-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Previsão de Fechamento
              </label>
              <input
                type="date"
                name="expected_close_date"
                value={formData.expected_close_date}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Curso de Interesse
            </label>
            <select
              name="course_interest"
              value={formData.course_interest}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {courseOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setFormData(initialFormData);
                setFormError(null);
              }}
              className="flex-1 px-4 py-2 border border-zinc-300 text-zinc-700 rounded-md hover:bg-zinc-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Salvando...' : 'Criar Oportunidade'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}