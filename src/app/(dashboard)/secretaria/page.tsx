'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';
import { Plus, Search } from 'lucide-react';

interface Request {
  id: string;
  type: string;
  status: string;
  priority: string;
  notes: string | null;
  internal_notes: string | null;
  created_at: string;
  contact_id: string;
  assigned_to: string | null;
  course_id: string | null;
  resolved_at: string | null;
}

interface Contact {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

interface RequestFormData {
  contact_id: string;
  type: string;
  course_id: string;
  priority: string;
  notes: string;
}

const typeOptions = [
  { value: 'info_curso', label: 'Informação sobre Curso' },
  { value: 'matricula', label: 'Matrícula' },
  { value: 'financeiro', label: 'Assunto Financeiro' },
  { value: 'documentacao', label: 'Documentação' },
  { value: 'outro', label: 'Outro' },
];

const priorityOptions = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'normal', label: 'Normal' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
];

const initialFormData: RequestFormData = {
  contact_id: '',
  type: 'info_curso',
  course_id: '',
  priority: 'normal',
  notes: '',
};

export default function SecretariaPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [formData, setFormData] = useState<RequestFormData>(initialFormData);
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
      const [requestsData, contactsData] = await Promise.all([
        supabase.from('requests').select('*').order('created_at', { ascending: false }),
        supabase.from('contacts').select('id, name, phone, email'),
      ]);

      setRequests(requestsData.data || []);
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

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(r => r.status === filter);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): string | null => {
    if (!formData.contact_id) {
      return 'Selecione um contato';
    }
    if (!formData.type) {
      return 'Selecione o tipo de solicitação';
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

      const { error: insertError } = await supabase.from('requests').insert({
        contact_id: formData.contact_id,
        type: formData.type,
        priority: formData.priority,
        notes: formData.notes.trim() || null,
        assigned_to: user.id,
        status: 'aberto',
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

  const typeLabels: Record<string, string> = {
    info_curso: 'Info Curso',
    matricula: 'Matrícula',
    financeiro: 'Financeiro',
    documentacao: 'Documentação',
    outro: 'Outro',
  };

  const statusLabels: Record<string, string> = {
    aberto: 'Aberto',
    em_andamento: 'Em Andamento',
    aguardando_cliente: 'Aguardando Cliente',
    resolvido: 'Resolvido',
  };

  const priorityLabels: Record<string, string> = {
    baixa: 'Baixa',
    normal: 'Normal',
    alta: 'Alta',
    urgente: 'Urgente',
  };

  const statusColors: Record<string, string> = {
    aberto: 'bg-blue-100 text-blue-700',
    em_andamento: 'bg-amber-100 text-amber-700',
    aguardando_cliente: 'bg-purple-100 text-purple-700',
    resolvido: 'bg-green-100 text-green-700',
  };

  const priorityColors: Record<string, string> = {
    baixa: 'bg-zinc-100 text-zinc-700',
    normal: 'bg-blue-100 text-blue-700',
    alta: 'bg-orange-100 text-orange-700',
    urgente: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-zinc-900">Secretaria - Solicitações</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Solicitação
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['aberto', 'em_andamento', 'aguardando_cliente', 'resolvido'].map((status) => {
          const count = requests.filter(r => r.status === status).length;
          const label = statusLabels[status];
          
          return (
            <div key={status} className="bg-white p-4 rounded-lg border border-zinc-200">
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-sm text-zinc-500">{label}</p>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md text-sm ${
            filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-700'
          }`}
        >
          Todos ({requests.length})
        </button>
        <button
          onClick={() => setFilter('aberto')}
          className={`px-4 py-2 rounded-md text-sm ${
            filter === 'aberto' ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-700'
          }`}
        >
          Abertos ({requests.filter(r => r.status === 'aberto').length})
        </button>
        <button
          onClick={() => setFilter('em_andamento')}
          className={`px-4 py-2 rounded-md text-sm ${
            filter === 'em_andamento' ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-700'
          }`}
        >
          Em Andamento ({requests.filter(r => r.status === 'em_andamento').length})
        </button>
        <button
          onClick={() => setFilter('resolvido')}
          className={`px-4 py-2 rounded-md text-sm ${
            filter === 'resolvido' ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-700'
          }`}
        >
          Resolvidos ({requests.filter(r => r.status === 'resolvido').length})
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Erro: {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-500">Carregando...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            Nenhuma solicitação encontrada
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-zinc-500">Solicitante</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-zinc-500">Tipo</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-zinc-500">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-zinc-500">Prioridade</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-zinc-500">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                    {getContactName(request.contact_id)}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600">
                    {typeLabels[request.type] || request.type}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${statusColors[request.status] || 'bg-zinc-100'}`}>
                      {statusLabels[request.status] || request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${priorityColors[request.priority] || 'bg-zinc-100'}`}>
                      {priorityLabels[request.priority] || request.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {new Date(request.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData(initialFormData);
          setFormError(null);
          setContactSearch('');
        }}
        title="Nova Solicita��ão"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
              {formError}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg">
              Solicitação criada com sucesso!
            </div>
          )}

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

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Tipo de Solicitação *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Prioridade
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Observações
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Descreva a solicitação..."
            />
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
              {saving ? 'Criando...' : 'Criar Solicitação'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}