'use client';

import Link from 'next/link';
import { Contact } from '@/types/database.types';

interface LeadTableProps {
  contacts: Contact[];
  loading: boolean;
  search: string;
}

const sourceLabels: Record<string, string> = {
  manual: 'Manual',
  chatwoot: 'Chatwoot',
  formulario: 'Formulário',
  indicacao: 'Indicação',
  site: 'Site',
  outro: 'Outro',
};

export function LeadTable({ contacts, loading, search }: LeadTableProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-colors duration-300">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">Nome</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">Email</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">Telefone</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">WhatsApp</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">Origem</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">Criado em</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 transition-colors">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">Carregando contatos...</span>
                  </div>
                </td>
              </tr>
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">
                  {search ? 'Nenhum lead encontrado para esta busca.' : 'Nenhum lead cadastrado.'}
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm">
                    <Link 
                      href={`/leads/${contact.id}`}
                      className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline transition-colors"
                    >
                      {contact.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-300">
                    {contact.email || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-300">
                    {contact.phone || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-300">
                    {contact.whatsapp || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded text-xs border border-zinc-200 dark:border-zinc-700 transition-colors">
                      {sourceLabels[contact.source] || contact.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                    {contact.created_at 
                      ? new Date(contact.created_at).toLocaleDateString('pt-BR') 
                      : '-'}
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
