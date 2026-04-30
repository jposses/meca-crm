import { createClient } from '@/lib/supabase/server'
import type { Tarefa } from '@/lib/types'

export type TarefaComOficina = Tarefa & {
  oficinas: { id: string; nome: string } | null
}

// Busca todas as tarefas vinculadas a uma oficina
export async function getTarefasByOficina(oficina_id: string): Promise<Tarefa[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tarefas')
    .select('*')
    .eq('oficina_id', oficina_id)
    .order('criado_em', { ascending: true })

  if (error) {
    console.error(`Erro ao buscar tarefas da oficina ${oficina_id}:`, error.message)
    return []
  }

  return data as Tarefa[]
}

// Busca tarefas pendentes com prazo nos próximos 7 dias (ou sem prazo definido), incluindo o nome da oficina
export async function getTarefasPendentes(): Promise<TarefaComOficina[]> {
  const supabase = await createClient()

  const seteDiasAFrente = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  const { data, error } = await supabase
    .from('tarefas')
    .select('*, oficinas(id, nome)')
    .eq('feita', false)
    .or(`prazo.is.null,prazo.lte.${seteDiasAFrente}`)
    .order('prazo', { ascending: true, nullsFirst: false })

  if (error) {
    console.error('Erro ao buscar tarefas pendentes:', error.message)
    return []
  }

  return data as TarefaComOficina[]
}
