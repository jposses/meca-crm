'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Contato } from '@/lib/types'

// Registra um novo contato e atualiza ultimo_contato_em na oficina
export async function adicionarContato(
  data: Omit<Contato, 'id' | 'criado_em'>
): Promise<{ data: Contato | null; error: string | null }> {
  const supabase = await createClient()

  const { data: contato, error } = await supabase
    .from('contatos')
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error('Erro ao adicionar contato:', error.message)
    return { data: null, error: error.message }
  }

  // Marca o momento da última interação na oficina
  await supabase
    .from('oficinas')
    .update({ ultimo_contato_em: new Date().toISOString() })
    .eq('id', data.oficina_id)

  revalidatePath(`/oficinas/${data.oficina_id}`)

  return { data: contato as Contato, error: null }
}
