'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { DealInsert, DealUpdate } from '@/types/database.types';

export async function createDeal(formData: DealInsert) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Usuário não autenticado');
  }

  const { data, error } = await supabase
    .from('deals')
    .insert({
      ...formData,
      assigned_to: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/pipeline');
  return data;
}

export async function updateDealStage(dealId: string, stageId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('deals')
    .update({ stage_id: stageId })
    .eq('id', dealId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/pipeline');
}
