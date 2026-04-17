'use client';

import { useEffect, useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

import { RequestTable } from './components/RequestTable';
import { NewRequestModal } from './components/NewRequestModal';
import { createRequest } from './actions/request-actions';
import { Request, Contact, RequestType, RequestPriority } from '@/types/database.types';

export default function SecretariaPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const filteredRequests = useMemo(() => {
    return filter === 'all' 
      ? requests 
      : requests.filter(r => r.status === filter);
  }, [requests, filter]);

  const handleCreateRequest = async (formData: any) => {
    await createRequest({
      contact_id: formData.contact_id,
      type: formData.type as RequestType,
      priority: formData.priority as RequestPriority,
      notes: formData.notes.trim() || null,
      assigned_to: null, // Set in Server Action
      status: 'aberto',
    });
    fetchData();
  };

  const statusLabels: Record<string, string> = {
    aberto: 'Aberto',
    em_andamento: 'Em Andamento',
    aguardando_cliente: 'Aguardando Cliente',
    resolvido: 'Resolvido',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Secretaria - Solicitações</h1>
          <p className="text-zinc-500 text-sm">Gerencie chamados e solicitações acadêmicas</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
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
            <div key={status} className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
              <p className="text-2xl font-bold text-zinc-900">{count}</p>
              <p className="text-sm text-zinc-500">{label}</p>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 flex-wrap bg-zinc-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-md text-sm transition-all ${
            filter === 'all' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          Todos ({requests.length})
        </button>
        {['aberto', 'em_andamento', 'resolvido'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-1.5 rounded-md text-sm transition-all ${
              filter === status ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            {statusLabels[status]} ({requests.filter(r => r.status === status).length})
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <span>Erro: {error}</span>
          <button onClick={() => setError(null)} className="text-xs underline">Fechar</button>
        </div>
      )}

      <RequestTable 
        requests={filteredRequests} 
        contacts={contacts} 
        loading={loading} 
      />

      <NewRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contacts={contacts}
        onSubmit={handleCreateRequest}
      />
    </div>
  );
}
rm>
      </Modal>
    </div>
  );
}