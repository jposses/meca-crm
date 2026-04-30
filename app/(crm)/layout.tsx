import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function CRMLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('nome, role')
    .eq('id', user?.id ?? '')
    .single()

  const nomeExibido = profile?.nome ?? user?.email?.split('@')[0] ?? 'Usuário'
  const inicial = nomeExibido.charAt(0).toUpperCase()

  return (
    <div className="flex h-screen overflow-hidden bg-[#E8ECF2]">
      <Sidebar nomeExibido={nomeExibido} inicial={inicial} role={profile?.role ?? 'dev'} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
