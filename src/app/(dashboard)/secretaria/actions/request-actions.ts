'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { RequestInsert } from '@/types/database.types';

export async function createRequest(formData: RequestInsert) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Usuário não autenticado');
  }

  const { data, error } = await supabase
    .from('requests')
    .insert({
      ...formData,
      assigned_to: user.id,
      status: 'aberto',
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/secretaria');
  return data;
}
