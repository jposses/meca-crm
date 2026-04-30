export type Estagio =
  | 'prospectando'
  | 'contato'
  | 'negociando'
  | 'aguardando_cadastro'
  | 'cadastrado'
  | 'perdido'

export type Role = 'founder' | 'socio' | 'dev'

export type TipoContato = 'whatsapp' | 'ligacao' | 'email' | 'presencial' | 'outro'

export type TipoAcao = 'ligar' | 'whatsapp' | 'reuniao' | 'follow_up' | 'proposta' | 'outro'

export type NivelInteresse = 'alto' | 'medio' | 'baixo'

export interface Profile {
  id: string
  nome: string | null
  role: Role
}

export interface Oficina {
  id: string
  nome: string
  bairro: string | null
  cidade: string | null
  contato: string | null
  responsavel: string | null
  estagio: Estagio
  obs: string | null
  instagram: string | null
  proxima_acao_tipo: TipoAcao | null
  proxima_acao_data: string | null
  proxima_acao_obs: string | null
  estagio_entrou_em: string | null
  nivel_interesse: NivelInteresse | null
  ultimo_contato_em: string | null
  criado_por: string | null
  atualizado_por: string | null
  criado_em: string
  atualizado_em: string
}

export interface Contato {
  id: string
  oficina_id: string
  tipo: TipoContato | null
  conteudo: string | null
  autor: string | null
  criado_em: string
}

export interface Tarefa {
  id: string
  oficina_id: string
  descricao: string
  prazo: string | null
  feita: boolean
  responsavel: string | null
  criado_em: string
}

export interface MetricasFunil {
  porEstagio: Record<Estagio, number>
  taxaConversao: number
  taxaConversaoCadastro: number
  percentuaisTransicao: Array<{ de: Estagio; para: Estagio; percentual: number }>
}
