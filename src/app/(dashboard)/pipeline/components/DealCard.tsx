'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Deal } from '@/types/database.types';

interface DealCardProps {
  deal: Deal;
  contactName: string;
  onClick?: () => void;
  isOverlay?: boolean;
}

export function DealCard({ deal, contactName, onClick, isOverlay }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: deal.id,
    disabled: isOverlay 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return null;
    return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const content = (
    <div className="flex items-start gap-2">
      <GripVertical className="w-4 h-4 text-zinc-300 mt-1 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-zinc-900 text-sm truncate">{deal.title}</p>
        <p className="text-xs text-zinc-500 truncate">{contactName}</p>
        {deal.value && (
          <p className="text-sm font-semibold text-green-600 mt-2">
            {formatCurrency(deal.value)}
          </p>
        )}
      </div>
    </div>
  );

  if (isOverlay) {
    return (
      <div className="bg-white p-3 rounded-md border border-zinc-200 shadow-md">
        {content}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white p-3 rounded-md border border-zinc-200 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing"
    >
      {content}
    </div>
  );
}
