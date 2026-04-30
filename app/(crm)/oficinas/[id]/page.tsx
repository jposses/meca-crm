import { notFound } from 'next/navigation'
import { getOficinaById } from '@/lib/queries/oficinas'
import { getContatosByOficina } from '@/lib/queries/contatos'
import { getTarefasByOficina } from '@/lib/queries/tarefas'
import { getProfile } from '@/lib/queries/profiles'
import { OficinaPaginaClient } from './OficinaPaginaClient'

interface Props {
  params: { id: string }
}

export default async function OficinaPaginaPage({ params }: Props) {
  const { id } = params

  const [oficina, contatos, tarefas, profile] = await Promise.all([
    getOficinaById(id),
    getContatosByOficina(id),
    getTarefasByOficina(id),
    getProfile(),
  ])

  if (!oficina) notFound()

  const podeEditar = profile?.role === 'founder' || profile?.role === 'socio'

  return (
    <OficinaPaginaClient
      oficina={oficina}
      contatosIniciais={contatos}
      tarefasIniciais={tarefas}
      podeEditar={podeEditar}
    />
  )
}
