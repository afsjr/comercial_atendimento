'use client';

import { Request, Contact } from '@/types/database.types';

interface RequestTableProps {
  requests: Request[];
  contacts: Contact[];
  loading: boolean;
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

const priorityColors: Record<string, string> = {
  baixa: 'bg-zinc-100 text-zinc-700',
  normal: 'bg-blue-100 text-blue-700',
  alta: 'bg-orange-100 text-orange-700',
  urgente: 'bg-red-100 text-red-700',
};

export function RequestTable({ requests, contacts, loading }: RequestTableProps) {
  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact?.name || 'Contato não encontrado';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
      <div className="overflow-x-auto">
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
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                    <span className="text-sm text-zinc-500">Carregando solicitações...</span>
                  </div>
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                  Nenhuma solicitação encontrada.
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                    {getContactName(request.contact_id)}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600">
                    {typeLabels[request.type] || request.type}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs border ${statusColors[request.status] || 'bg-zinc-100'}`}>
                      {statusLabels[request.status] || request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs border ${priorityColors[request.priority] || 'bg-zinc-100'}`}>
                      {priorityLabels[request.priority] || request.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {new Date(request.created_at).toLocaleDateString('pt-BR')}
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
