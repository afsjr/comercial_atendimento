'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  company: string | null;
  source: string;
  created_at: string;
}

export default function LeadsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fetchContacts = async () => {
      try {
        const { data, error: contactsError } = await supabase
          .from('contacts')
          .select('*')
          .order('created_at', { ascending: false });

        if (contactsError) {
          console.log('Erro:', contactsError.message);
          setError(contactsError.message);
        } else {
          setContacts(data || []);
        }
      } catch (err: any) {
        console.log('Erro:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const sourceLabels: Record<string, string> = {
    manual: 'Manual',
    chatwoot: 'Chatwoot',
    formulario: 'Formulário',
    indicacao: 'Indicação',
    site: 'Site',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-zinc-900">Leads / Contatos</h1>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          + Novo Lead
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-zinc-200">
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Erro: {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-zinc-500">Nome</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-zinc-500">Email</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-zinc-500">Telefone</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-zinc-500">Origem</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-zinc-500">Criado em</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-zinc-500">
                  Carregando...
                </td>
              </tr>
            ) : filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-zinc-500">
                  Nenhum lead encontrado
                </td>
              </tr>
            ) : (
              filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                    {contact.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600">
                    {contact.email || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600">
                    {contact.phone || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-zinc-100 text-zinc-700 rounded text-xs">
                      {sourceLabels[contact.source] || contact.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {contact.created_at ? new Date(contact.created_at).toLocaleDateString('pt-BR') : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}