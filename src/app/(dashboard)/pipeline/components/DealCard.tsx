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
      <GripVertical className="w-4 h-4 text-zinc-300 dark:text-zinc-600 mt-1 flex-shrink-0 transition-colors" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm truncate transition-colors">{deal.title}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate transition-colors">{contactName}</p>
        {deal.value && (
          <p className="text-sm font-semibold text-green-600 dark:text-emerald-400 mt-2 transition-colors">
            {formatCurrency(deal.value)}
          </p>
        )}
      </div>
    </div>
  );

  if (isOverlay) {
    return (
      <div className="bg-white dark:bg-zinc-900 p-3 rounded-md border border-zinc-200 dark:border-zinc-700 shadow-md transition-colors duration-300">
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
      className="bg-white dark:bg-zinc-900 p-3 rounded-md border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md dark:hover:border-zinc-700 cursor-grab active:cursor-grabbing transition-colors duration-300"
    >
      {content}
    </div>
  );
}
