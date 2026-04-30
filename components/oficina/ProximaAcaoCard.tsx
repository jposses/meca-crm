'use client'

import { useState } from 'react'
import type { Oficina, TipoAcao } from '@/lib/types'

interface ProximaAcaoCardProps {
  oficina: Oficina
  podeEditar: boolean
  onSalvar: (dados: Partial<Oficina>) => void
}

const TIPOS_ACAO: Array<{ valor: TipoAcao; label: string }> = [
  { valor: 'ligar',     label: '📞 Ligar' },
  { valor: 'whatsapp',  label: '💬 WhatsApp' },
  { valor: 'reuniao',   label: '🤝 Reunião' },
  { valor: 'follow_up', label: '🔄 Follow-up' },
  { valor: 'proposta',  label: '📄 Proposta' },
  { valor: 'outro',     label: '✅ Outro' },
]

const ACAO_LABEL: Record<TipoAcao, string> = {
  ligar: '📞 Ligar', whatsapp: '💬 WhatsApp', reuniao: '🤝 Reunião',
  follow_up: '🔄 Follow-up', proposta: '📄 Proposta', outro: '✅ Ação',
}

function dataRelativa(dataStr: string): string {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const data = new Date(dataStr + 'T00:00:00')
  const diff = Math.floor((data.getTime() - hoje.getTime()) / 86400000)
  if (diff < 0) return `atrasada ${Math.abs(diff)}d`
  if (diff === 0) return 'hoje'
  if (diff === 1) return 'amanhã'
  return `em ${diff}d`
}

function dataFormatada(dataStr: string): string {
  return new Date(dataStr + 'T00:00:00').toLocaleDateString('pt-BR')
}

export function ProximaAcaoCard({ oficina, podeEditar, onSalvar }: ProximaAcaoCardProps) {
  const [editando, setEditando] = useState(false)
  const [tipo, setTipo] = useState<TipoAcao>(oficina.proxima_acao_tipo ?? 'ligar')
  const [data, setData] = useState(oficina.proxima_acao_data ?? '')
  const [obs, setObs] = useState(oficina.proxima_acao_obs ?? '')

  const temAcao = !!(oficina.proxima_acao_tipo && oficina.proxima_acao_data)
  const atrasada = temAcao && new Date(oficina.proxima_acao_data! + 'T00:00:00') < new Date(new Date().setHours(0, 0, 0, 0))
  const hoje = temAcao && !atrasada && (() => {
    const d = new Date(); d.setHours(0,0,0,0)
    return Math.floor((new Date(oficina.proxima_acao_data! + 'T00:00:00').getTime() - d.getTime()) / 86400000) === 0
  })()

  function handleEditar() {
    setTipo(oficina.proxima_acao_tipo ?? 'ligar')
    setData(oficina.proxima_acao_data ?? '')
    setObs(oficina.proxima_acao_obs ?? '')
    setEditando(true)
  }

  function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    onSalvar({ proxima_acao_tipo: tipo, proxima_acao_data: data || null, proxima_acao_obs: obs || null })
    setEditando(false)
  }

  const leftBorder = !temAcao ? '#F59E0B' : atrasada ? '#EF4444' : hoje ? '#F97316' : '#3B82F6'
  const bgColor = !temAcao ? '#FFFBEB' : atrasada ? '#FFF1F2' : hoje ? '#FFF7ED' : '#EFF6FF'
  const borderColor = !temAcao ? '#FCD34D' : atrasada ? '#FECDD3' : hoje ? '#FED7AA' : '#BFDBFE'
  const textColor = !temAcao ? '#B45309' : atrasada ? '#DC2626' : hoje ? '#EA580C' : '#2563EB'

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderLeft: `4px solid ${leftBorder}`,
      }}
    >
      <div className="px-4 py-3">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: leftBorder }}>
            Próxima ação
          </p>
          {podeEditar && !editando && (
            <button
              onClick={handleEditar}
              className="text-[11px] font-semibold transition-all duration-150 px-2.5 py-1 rounded-lg hover:opacity-80"
              style={{ color: textColor, background: 'rgba(255,255,255,0.7)', border: `1px solid ${borderColor}` }}
            >
              Atualizar
            </button>
          )}
        </div>

        {/* Modo visualização */}
        {!editando && (
          temAcao ? (
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold" style={{ color: textColor }}>
                  {ACAO_LABEL[oficina.proxima_acao_tipo!]}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.7)', color: textColor }}>
                  {dataRelativa(oficina.proxima_acao_data!)}
                </span>
                <span className="text-xs" style={{ color: textColor, opacity: 0.65 }}>
                  {dataFormatada(oficina.proxima_acao_data!)}
                </span>
              </div>
              {oficina.proxima_acao_obs && (
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: textColor, opacity: 0.75 }}>
                  {oficina.proxima_acao_obs}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm font-semibold" style={{ color: '#B45309' }}>
              ⚠ Nenhuma próxima ação definida
            </p>
          )
        )}

        {/* Modo edição */}
        {editando && (
          <form onSubmit={handleSalvar} className="flex flex-col gap-2.5 mt-1">
            <div className="grid grid-cols-2 gap-2">
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoAcao)}
                className="border rounded-lg px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition-shadow"
                style={{ borderColor: '#E5EAF2', color: '#0F172A' }}
              >
                {TIPOS_ACAO.map(t => <option key={t.valor} value={t.valor}>{t.label}</option>)}
              </select>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
                className="border rounded-lg px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition-shadow"
                style={{ borderColor: '#E5EAF2', color: '#0F172A' }}
              />
            </div>
            <input
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Observação (opcional)"
              className="border rounded-lg px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition-shadow"
              style={{ borderColor: '#E5EAF2', color: '#0F172A' }}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="text-xs font-semibold text-white px-4 py-1.5 rounded-lg transition-all duration-150 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #00C977, #00A060)', boxShadow: '0 2px 8px rgba(0,201,119,0.35)' }}
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setEditando(false)}
                className="text-xs font-semibold px-4 py-1.5 rounded-lg transition-all duration-150 hover:bg-[#F1F5F9]"
                style={{ color: '#64748B', border: '1px solid #E5EAF2', background: 'white' }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
