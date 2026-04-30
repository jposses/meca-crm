'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Estagio, Oficina } from '@/lib/types'

// Cria uma nova oficina no banco, associando o usuário logado como criador
export async function criarOficina(
  data: Omit<Oficina, 'id' | 'criado_em' | 'atualizado_em' | 'estagio_entrou_em'>
): Promise<{ data: Oficina | null; error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: oficina, error } = await supabase
    .from('oficinas')
    .insert({
      ...data,
      criado_por: user?.id ?? null,
      atualizado_por: user?.id ?? null,
      estagio_entrou_em: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar oficina:', error.message)
    return { data: null, error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/funil')

  return { data: oficina as Oficina, error: null }
}

// Edita os dados de uma oficina existente
export async function editarOficina(
  id: string,
  data: Partial<Oficina>
): Promise<{ data: Oficina | null; error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: oficina, error } = await supabase
    .from('oficinas')
    .update({
      ...data,
      atualizado_por: user?.id ?? null,
      atualizado_em: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(`Erro ao editar oficina ${id}:`, error.message)
    return { data: null, error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/funil')
  revalidatePath(`/oficinas/${id}`)

  return { data: oficina as Oficina, error: null }
}

// Muda o estágio de uma oficina no funil
export async function mudarEstagio(
  id: string,
  estagio: Estagio
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('oficinas')
    .update({
      estagio,
      estagio_entrou_em: new Date().toISOString(),
      atualizado_por: user?.id ?? null,
      atualizado_em: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error(`Erro ao mudar estágio da oficina ${id}:`, error.message)
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/funil')
  revalidatePath(`/oficinas/${id}`)

  return { error: null }
}

// Remove uma oficina permanentemente (cascata apaga contatos e tarefas)
export async function deletarOficina(
  id: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('oficinas')
    .delete()
    .eq('id', id)

  if (error) {
    console.error(`Erro ao deletar oficina ${id}:`, error.message)
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/funil')

  return { error: null }
}
