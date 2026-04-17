'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { ContactInsert } from '@/types/database.types';

export async function createLead(formData: ContactInsert) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Usuário não autenticado');
  }

  const { data, error } = await supabase
    .from('contacts')
    .insert({
      ...formData,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Este contato já existe em nossa base.');
    }
    throw new Error(error.message);
  }

  revalidatePath('/leads');
  return data;
}
