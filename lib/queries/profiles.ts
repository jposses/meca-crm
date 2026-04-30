import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types'

// Busca o perfil do usuário autenticado na sessão atual
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()

  // Recupera o usuário da sessão
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('Erro ao obter usuário autenticado:', authError?.message)
    return null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Erro ao buscar perfil do usuário:', error.message)
    return null
  }

  return data as Profile
}

// Busca todos os perfis cadastrados (usado em selects de responsável)
export async function getProfiles(): Promise<Profile[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('nome', { ascending: true })

  if (error) {
    console.error('Erro ao buscar perfis:', error.message)
    return []
  }

  return data as Profile[]
}
