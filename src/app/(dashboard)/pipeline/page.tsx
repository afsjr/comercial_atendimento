'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';

interface Stage {
  id: string;
  name: string;
  position: number;
  color: string;
}

interface Deal {
  id: string;
  title: string;
  value: number | null;
  stage_id: string;
  contact_id: string;
  created_at: string;
}

interface Contact {
  id: string;
  name: string;
}

export default function PipelinePage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fetchData = async () => {
      try {
        // Fetch stages
        const { data: stagesData } = await supabase
          .from('pipeline_stages')
          .select('*')
          .order('position');

        // Fetch deals
        const { data: dealsData } = await supabase
          .from('deals')
          .select('*');

        // Fetch contacts
        const { data: contactsData } = await supabase
          .from('contacts')
          .select('id, name');

        setStages(stagesData || []);
        setDeals(dealsData || []);
        setContacts(contactsData || []);
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

  const getDealsByStage = (stageId: string) => {
    return deals.filter(d => d.stage_id === stageId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500">Carregando pipeline...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Erro: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-zinc-900">Pipeline de Vendas</h1>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          + Nova Oportunidade
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageDeals = getDealsByStage(stage.id);
          
          return (
            <div
              key={stage.id}
              className="flex-shrink-0 w-72 bg-zinc-50 rounded-lg border border-zinc-200"
            >
              {/* Column Header */}
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
              </div>

              {/* Cards */}
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
                          R$ {deal.value.toLocaleString('pt-BR')}
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
    </div>
  );
}