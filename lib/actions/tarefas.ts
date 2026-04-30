'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Tarefa } from '@/lib/types'

// Cria uma nova tarefa vinculada a uma oficina
export async function criarTarefa(
  data: Omit<Tarefa, 'id' | 'criado_em'>
): Promise<{ data: Tarefa | null; error: string | null }> {
  const supabase = await createClient()

  const { data: tarefa, error } = await supabase
    .from('tarefas')
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar tarefa:', error.message)
    return { data: null, error: error.message }
  }

  // Revalida o dashboard (lista de pendentes) e a página da oficina
  revalidatePath('/')
  revalidatePath(`/oficinas/${data.oficina_id}`)

  return { data: tarefa as Tarefa, error: null }
}

// Marca ou desmarca uma tarefa como feita
export async function marcarTarefaFeita(
  id: string,
  feita: boolean
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tarefas')
    .update({ feita })
    .eq('id', id)

  if (error) {
    console.error(`Erro ao atualizar tarefa ${id}:`, error.message)
    return { error: error.message }
  }

  // Revalida o dashboard para atualizar a lista de pendentes
  revalidatePath('/')

  return { error: null }
}

// Remove uma tarefa permanentemente
export async function deletarTarefa(
  id: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tarefas')
    .delete()
    .eq('id', id)

  if (error) {
    console.error(`Erro ao deletar tarefa ${id}:`, error.message)
    return { error: error.message }
  }

  revalidatePath('/')

  return { error: null }
}
