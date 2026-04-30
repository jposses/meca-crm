import { createClient } from '@/lib/supabase/server'
import type { Estagio, Oficina } from '@/lib/types'

// Busca todas as oficinas ordenadas pela mais recentemente atualizada
export async function getOficinas(): Promise<Oficina[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('oficinas')
    .select('*')
    .order('atualizado_em', { ascending: false })

  if (error) {
    console.error('Erro ao buscar oficinas:', error.message)
    return []
  }

  return data as Oficina[]
}

// Busca uma oficina pelo ID
export async function getOficinaById(id: string): Promise<Oficina | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('oficinas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error(`Erro ao buscar oficina ${id}:`, error.message)
    return null
  }

  return data as Oficina
}

// Busca todas as oficinas de um determinado estágio do funil
export async function getOficinasByEstagio(estagio: Estagio): Promise<Oficina[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('oficinas')
    .select('*')
    .eq('estagio', estagio)
    .order('atualizado_em', { ascending: false })

  if (error) {
    console.error(`Erro ao buscar oficinas no estágio "${estagio}":`, error.message)
    return []
  }

  return data as Oficina[]
}

// Busca oficinas paradas há mais de 7 dias na mesma etapa (exceto cadastrado e perdido)
export async function getLeadsParados(): Promise<Oficina[]> {
  const supabase = await createClient()

  const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('oficinas')
    .select('*')
    .neq('estagio', 'cadastrado')
    .neq('estagio', 'perdido')
    .lt('estagio_entrou_em', seteDiasAtras)
    .order('estagio_entrou_em', { ascending: true })

  if (error) {
    console.error('Erro ao buscar leads parados:', error.message)
    return []
  }

  return data as Oficina[]
}

// Busca oficinas criadas nos últimos 7 dias
export async function getOficinasCriadas7Dias(): Promise<Oficina[]> {
  const supabase = await createClient()

  // Calcula a data de 7 dias atrás no formato ISO
  const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('oficinas')
    .select('*')
    .gte('criado_em', seteDiasAtras)
    .order('criado_em', { ascending: false })

  if (error) {
    console.error('Erro ao buscar oficinas dos últimos 7 dias:', error.message)
    return []
  }

  return data as Oficina[]
}
