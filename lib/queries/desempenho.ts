import { createClient } from '@/lib/supabase/server'

export interface DesempenhoResponsavel {
  id: string
  nome: string
  inicial: string
  total: number
  cadastrados: number
  taxa: number
}

export async function getDesempenhoPorResponsavel(): Promise<DesempenhoResponsavel[]> {
  const supabase = await createClient()

  const [profilesResult, oficinasResult] = await Promise.all([
    supabase.from('profiles').select('id, nome, role').neq('role', 'dev'),
    supabase.from('oficinas').select('criado_por, estagio'),
  ])

  const profiles = profilesResult.data ?? []
  const oficinas = oficinasResult.data ?? []

  return profiles
    .map(p => {
      const leads = oficinas.filter(o => o.criado_por === p.id)
      const total = leads.length
      const cadastrados = leads.filter(o => o.estagio === 'cadastrado').length
      const taxa = total > 0 ? Math.round((cadastrados / total) * 100) : 0
      const nome = p.nome ?? 'Usuário'
      return { id: p.id, nome, inicial: nome.charAt(0).toUpperCase(), total, cadastrados, taxa }
    })
    .filter(r => r.total > 0)
    .sort((a, b) => b.total - a.total)
}
