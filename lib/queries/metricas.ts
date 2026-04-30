import { createClient } from '@/lib/supabase/server'
import type { Estagio } from '@/lib/types'
import type { MetricasFunil } from '@/lib/types'

const ESTAGIOS_FUNIL: Estagio[] = ['prospectando', 'contato', 'negociando', 'aguardando_cadastro', 'cadastrado']
const TODOS_ESTAGIOS: Estagio[] = ['prospectando', 'contato', 'negociando', 'aguardando_cadastro', 'cadastrado', 'perdido']

export async function getMetricasFunil(): Promise<MetricasFunil> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('oficinas')
    .select('estagio')

  if (error) {
    console.error('Erro ao buscar métricas do funil:', error.message)
    const porEstagioVazio = Object.fromEntries(TODOS_ESTAGIOS.map((e) => [e, 0])) as Record<Estagio, number>
    return { porEstagio: porEstagioVazio, taxaConversao: 0, taxaConversaoCadastro: 0, percentuaisTransicao: [] }
  }

  const porEstagio = Object.fromEntries(TODOS_ESTAGIOS.map((e) => [e, 0])) as Record<Estagio, number>
  for (const row of data) {
    const estagio = row.estagio as Estagio
    if (estagio in porEstagio) porEstagio[estagio] += 1
  }

  // Taxa geral: prospectando → cadastrado
  const taxaConversao =
    porEstagio['prospectando'] > 0
      ? Math.round((porEstagio['cadastrado'] / porEstagio['prospectando']) * 1000) / 10
      : 0

  // Taxa de ativação: aguardando → cadastrado (pool combinado)
  const poolCadastro = porEstagio['aguardando_cadastro'] + porEstagio['cadastrado']
  const taxaConversaoCadastro =
    poolCadastro > 0 ? Math.round((porEstagio['cadastrado'] / poolCadastro) * 1000) / 10 : 0

  const percentuaisTransicao = ESTAGIOS_FUNIL.slice(0, -1).map((de, index) => {
    const para = ESTAGIOS_FUNIL[index + 1]
    const totalDe = porEstagio[de]
    const totalPara = porEstagio[para]
    const percentual = totalDe > 0 ? Math.round((totalPara / totalDe) * 1000) / 10 : 0
    return { de, para, percentual }
  })

  return { porEstagio, taxaConversao, taxaConversaoCadastro, percentuaisTransicao }
}
