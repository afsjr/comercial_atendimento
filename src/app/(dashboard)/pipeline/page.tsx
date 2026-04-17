'use client';

import { useEffect, useState, useMemo, useTransition } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

import { DealColumn } from './components/DealColumn';
import { DealCard } from './components/DealCard';
import { NewDealModal } from './components/NewDealModal';
import { createDeal, updateDealStage } from './actions/deal-actions';
import { PipelineStage, Deal, Contact } from '@/types/database.types';

export default function PipelinePage() {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const dealsByStage = useMemo(() => {
    const grouped: Record<string, Deal[]> = {};
    stages.forEach(stage => {
      grouped[stage.id] = deals.filter(d => d.stage_id === stage.id);
    });
    return grouped;
  }, [stages, deals]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      const [stagesData, dealsData, contactsData] = await Promise.all([
        supabase.from('pipeline_stages').select('*').order('position'),
        supabase.from('deals').select('*'),
        supabase.from('contacts').select('*'),
      ]);

      setStages(stagesData.data || []);
      setDeals(dealsData.data || []);
      setContacts(contactsData.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeDeal = deals.find(d => d.id === activeId);
    if (!activeDeal) return;

    const overStage = stages.find(s => s.id === overId);
    const targetStageId = overStage?.id || deals.find(d => d.id === overId)?.stage_id;

    if (targetStageId && activeDeal.stage_id !== targetStageId) {
      setDeals(prev =>
        prev.map(d =>
          d.id === activeId ? { ...d, stage_id: targetStageId } : d
        )
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeDeal = deals.find(d => d.id === activeId);
    const overDeal = deals.find(d => d.id === overId);

    if (!activeDeal) return;

    let newStageId = activeDeal.stage_id;
    if (overDeal) {
      newStageId = overDeal.stage_id;
    } else {
      const overStage = stages.find(s => s.id === overId);
      if (overStage) newStageId = overStage.id;
    }

    if (newStageId && newStageId !== activeDeal.stage_id) {
      startTransition(async () => {
        try {
          await updateDealStage(activeId, newStageId);
        } catch (err: any) {
          setError(err.message);
          fetchData(); 
        }
      });
    }
  };

  const handleCreateDeal = async (formData: any) => {
    const firstStage = stages[0];
    if (!firstStage) throw new Error('Nenhum stage disponível');

    await createDeal({
      title: formData.title.trim(),
      contact_id: formData.contact_id,
      value: formData.value ? parseFloat(formData.value.replace(',', '.')) : null,
      stage_id: firstStage.id,
      expected_close_date: formData.expected_close_date || null,
      course_interest: formData.course_interest || null,
      assigned_to: null,
    });
    
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const activeDeal = activeId ? deals.find(d => d.id === activeId) : null;
  const activeContact = activeDeal ? contacts.find(c => c.id === activeDeal.contact_id) : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 transition-colors">Pipeline de Vendas</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm transition-colors">Gerencie suas oportunidades e leads</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Nova Oportunidade
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex justify-between items-center transition-colors">
          <span>Erro: {error}</span>
          <button onClick={() => setError(null)} className="text-xs underline">Fechar</button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
          {stages.map(stage => (
            <DealColumn
              key={stage.id}
              stage={stage}
              deals={dealsByStage[stage.id] || []}
              contacts={contacts}
              onDealClick={setSelectedDeal}
            />
          ))}
        </div>

        <DragOverlay>
          {activeDeal && activeContact ? (
            <DealCard deal={activeDeal} contactName={activeContact.name} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      <NewDealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contacts={contacts}
        stages={stages}
        onSubmit={handleCreateDeal}
      />
    </div>
  );
}