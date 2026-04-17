'use client';

import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { PipelineStage, Deal, Contact } from '@/types/database.types';
import { DealCard } from './DealCard';

interface DealColumnProps {
  stage: PipelineStage;
  deals: Deal[];
  contacts: Contact[];
  onDealClick: (deal: Deal) => void;
}

export function DealColumn({
  stage,
  deals,
  contacts,
  onDealClick,
}: DealColumnProps) {
  const { setNodeRef } = useSortable({
    id: stage.id,
    data: { type: 'column', stage },
  });

  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact?.name || 'Sem contato';
  };

  const stageValue = deals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div
      ref={setNodeRef}
      className="flex-shrink-0 w-72 bg-zinc-50 rounded-lg border border-zinc-200"
    >
      <div
        className="px-4 py-3 border-b border-zinc-200 rounded-t-lg"
        style={{ backgroundColor: stage.color + '20' }}
      >
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-zinc-900">{stage.name}</h3>
          <span className="px-2 py-1 bg-white text-zinc-700 rounded text-sm">
            {deals.length}
          </span>
        </div>
        {stageValue > 0 && (
          <p className="text-xs text-zinc-600 mt-1">{formatCurrency(stageValue)}</p>
        )}
      </div>

      <SortableContext
        items={deals.map(d => d.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="p-2 space-y-2 min-h-[200px] max-h-[calc(100vh-350px)] overflow-y-auto">
          {deals.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-4">
              Nenhuma oportunidade
            </p>
          ) : (
            deals.map(deal => (
              <DealCard
                key={deal.id}
                deal={deal}
                contactName={getContactName(deal.contact_id)}
                onClick={() => onDealClick(deal)}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
