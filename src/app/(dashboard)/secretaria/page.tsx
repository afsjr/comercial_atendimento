'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';

interface Request {
  id: string;
  type: string;
  status: string;
  priority: string;
  notes: string | null;
  created_at: string;
  contact_id: string;
}

interface Contact {
  id: string;
  name: string;
}

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

export default function SecretariaPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fetchData = async () => {
      try {
        const { data: requestsData, error: requestsError } = await supabase
          .from('requests')
          .select('*')
          .order('created_at', { ascending: false });

        const { data: contactsData } = await supabase
          .from('contacts')
          .select('id, name');

        if (requestsError) {
          console.error('Erro:', requestsError);
          setError(requestsError.message);
        } else {
          setRequests(requestsData || []);
          setContacts(contactsData || []);
        }
      } catch (err: any) {
        console.error('Erro:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact?.name || 'Contato não encontrado';
  };

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(r => r.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-zinc-900">Secretaria - Solicitações</h1>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          + Nova Solicitação
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
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

      {/* Filters */}
      <div className="flex gap-2">
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

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Erro: {error}
        </div>
      )}

      {/* Requests List */}
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
                  <td className="px-6 py-4 text-sm text-zinc-600">
                    {priorityLabels[request.priority] || request.priority}
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
    </div>
  );
}