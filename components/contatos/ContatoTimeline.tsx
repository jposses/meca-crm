'use client'

import type { Contato, TipoContato } from '@/lib/types'

interface ContatoTimelineProps {
  contatos: Contato[]
}

const TIPO_CONFIG: Record<TipoContato, { icone: string; label: string; bg: string; text: string; border: string }> = {
  whatsapp:   { icone: '💬', label: 'WhatsApp',   bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
  ligacao:    { icone: '📞', label: 'Ligação',     bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
  email:      { icone: '✉️', label: 'E-mail',      bg: '#FAF5FF', text: '#9333EA', border: '#E9D5FF' },
  presencial: { icone: '🤝', label: 'Presencial',  bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA' },
  outro:      { icone: '📋', label: 'Outro',       bg: '#F8FAFC', text: '#64748B', border: '#E2E8F0' },
}

function dataRelativa(dataIso: string): string {
  const agora = new Date()
  const data = new Date(dataIso)
  const diffMs = agora.getTime() - data.getTime()
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDias === 0) return 'hoje'
  if (diffDias === 1) return 'ontem'
  if (diffDias < 7) return `${diffDias} dias atrás`
  if (diffDias < 30) return `${Math.floor(diffDias / 7)} semanas atrás`
  return data.toLocaleDateString('pt-BR')
}

export function ContatoTimeline({ contatos }: ContatoTimelineProps) {
  if (contatos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2.5">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-xl"
          style={{ background: '#F1F5F9' }}
        >
          💬
        </div>
        <p className="text-sm font-semibold" style={{ color: '#94A3B8' }}>Nenhum contato registrado</p>
        <p className="text-xs" style={{ color: '#CBD5E1' }}>Clique em &quot;Registrar contato&quot; para adicionar o primeiro</p>
      </div>
    )
  }

  const ordenados = [...contatos].sort(
    (a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
  )

  return (
    <div className="flex flex-col gap-3">
      {ordenados.map((contato, idx) => {
        const tipo = contato.tipo ?? 'outro'
        const config = TIPO_CONFIG[tipo]
        const isUltimo = idx === ordenados.length - 1

        return (
          <div key={contato.id} className="flex gap-3">
            {/* Ícone e linha da timeline */}
            <div className="flex flex-col items-center shrink-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                style={{ background: config.bg, border: `1px solid ${config.border}` }}
              >
                {config.icone}
              </div>
              {!isUltimo && (
                <div className="w-px flex-1 mt-1.5" style={{ background: 'rgba(0,0,0,0.06)' }} />
              )}
            </div>

            {/* Conteúdo */}
            <div className={`flex-1 min-w-0 ${isUltimo ? 'pb-0' : 'pb-4'}`}>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span
                  className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                  style={{ background: config.bg, color: config.text, border: `1px solid ${config.border}` }}
                >
                  {config.label}
                </span>
                <span className="text-[11px] font-medium" style={{ color: '#CBD5E1' }}>
                  {dataRelativa(contato.criado_em)}
                </span>
              </div>
              {contato.conteudo && (
                <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: '#475569' }}>
                  {contato.conteudo}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
