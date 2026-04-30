import { createClient } from '@/lib/supabase/server'
import type { Contato } from '@/lib/types'

// Busca todos os contatos de uma oficina em ordem cronológica crescente (timeline)
export async function getContatosByOficina(oficina_id: string): Promise<Contato[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contatos')
    .select('*')
    .eq('oficina_id', oficina_id)
    .order('criado_em', { ascending: true })

  if (error) {
    console.error(`Erro ao buscar contatos da oficina ${oficina_id}:`, error.message)
    return []
  }

  return data as Contato[]
}
