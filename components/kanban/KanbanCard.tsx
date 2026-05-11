'use client'

import { useState } from 'react'
import { Draggable } from '@hello-pangea/dnd'
import { useRouter } from 'next/navigation'
import type { Oficina, TipoAcao, NivelInteresse } from '@/lib/types'
import { editarOficina, deletarOficina } from '@/lib/actions/oficinas'

interface KanbanCardProps {
  oficina: Oficina
  index: number
  onDelete: (id: string) => void
}

const ACAO_LABEL: Record<TipoAcao, string> = {
  ligar:     '📞 Ligar',
  whatsapp:  '💬 WhatsApp',
  reuniao:   '🤝 Reunião',
  follow_up: '🔄 Follow-up',
  proposta:  '📄 Proposta',
  outro:     '✅ Ação',
}

const NIVEL_CONFIG: Record<NivelInteresse, { label: string; bg: string; text: string; border: string }> = {
  alto:  { label: 'Alto',  bg: '#FFF1F2', text: '#DC2626', border: '#FECDD3' },
  medio: { label: 'Médio', bg: '#FFFBEB', text: '#B45309', border: '#FCD34D' },
  baixo: { label: 'Baixo', bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
}

const NIVEL_CICLO: Array<NivelInteresse | null> = ['alto', 'medio', 'baixo', null]

function diasNaEtapa(ts: string | null): number {
  if (!ts) return 0
  return Math.floor((Date.now() - new Date(ts).getTime()) / 86400000)
}

function dataRelativaAcao(s: string): string {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  const diff = Math.floor((new Date(s + 'T00:00:00').getTime() - hoje.getTime()) / 86400000)
  if (diff < 0) return `atrasada ${Math.abs(diff)}d`
  if (diff === 0) return 'hoje'
  if (diff === 1) return 'amanhã'
  return `em ${diff}d`
}

function slaInteracao(ts: string | null): { texto: string; cls: string } | null {
  if (!ts) return null
  const ms = Date.now() - new Date(ts).getTime()
  const min = Math.floor(ms / 60000)
  const h = Math.floor(ms / 3600000)
  const d = Math.floor(ms / 86400000)
  const texto = min < 60 ? `${min}min` : h < 24 ? `${h}h` : `${d}d`
  const cls = h < 2 ? 'text-gray-400' : h < 12 ? 'text-yellow-600' : 'text-red-500'
  return { texto, cls }
}

function isLeadQuente(o: Oficina): boolean {
  if (!o.ultimo_contato_em) return false
  const h = (Date.now() - new Date(o.ultimo_contato_em).getTime()) / 3600000
  return h < 24 || (o.estagio === 'negociando' && h < 48)
}

function getLeftBorderColor(nivel: NivelInteresse | null, atrasada: boolean): string {
  if (atrasada) return '#ef4444'
  if (nivel === 'alto') return '#ef4444'
  if (nivel === 'medio') return '#f59e0b'
  if (nivel === 'baixo') return '#3b82f6'
  return '#e2e8f0'
}

function whatsappUrl(tel: string): string {
  const n = tel.replace(/\D/g, '')
  return `https://wa.me/${n.startsWith('55') ? n : '55' + n}`
}

export function KanbanCard({ oficina, index, onDelete }: KanbanCardProps) {
  const router = useRouter()
  const [nivelLocal, setNivelLocal] = useState<NivelInteresse | null>(oficina.nivel_interesse)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)
  const [excluindo, setExcluindo] = useState(false)

  const quente = isLeadQuente(oficina)
  const dias = diasNaEtapa(oficina.estagio_entrou_em)
  const temAcao = !!(oficina.proxima_acao_tipo && oficina.proxima_acao_data)
  const acaoAtrasada = temAcao && new Date(oficina.proxima_acao_data! + 'T00:00:00') < new Date(new Date().setHours(0, 0, 0, 0))
  const acaoHoje = temAcao && !acaoAtrasada && (() => {
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
    return Math.floor((new Date(oficina.proxima_acao_data! + 'T00:00:00').getTime() - hoje.getTime()) / 86400000) === 0
  })()
  const sla = slaInteracao(oficina.ultimo_contato_em)

  const slaColor =
    !sla ? undefined :
    sla.cls === 'text-gray-400' ? '#CBD5E1' :
    sla.cls === 'text-yellow-600' ? '#F59E0B' :
    '#F43F5E'

  async function handleConfirmarExclusao(e: React.MouseEvent) {
    e.stopPropagation()
    setExcluindo(true)
    const { error } = await deletarOficina(oficina.id)
    if (!error) {
      onDelete(oficina.id)
    } else {
      setExcluindo(false)
      setConfirmandoExclusao(false)
    }
  }

  function handleCiclarNivel(e: React.MouseEvent) {
    e.stopPropagation()
    const idx = NIVEL_CICLO.indexOf(nivelLocal)
    const proximo = NIVEL_CICLO[(idx + 1) % NIVEL_CICLO.length]
    setNivelLocal(proximo)
    editarOficina(oficina.id, { nivel_interesse: proximo })
  }

  const leftBorderColor = getLeftBorderColor(nivelLocal, acaoAtrasada)

  return (
    <Draggable draggableId={oficina.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => router.push(`/oficinas/${oficina.id}`)}
          className={`
            rounded-2xl p-3.5 cursor-pointer select-none transition-all duration-200
            ${snapshot.isDragging
              ? 'shadow-[0_20px_48px_rgba(0,0,0,0.22)]'
              : quente
                ? 'shadow-[0_0_0_2px_rgba(0,201,119,0.28),0_4px_12px_rgba(0,0,0,0.07)] hover:shadow-[0_0_0_2px_rgba(0,201,119,0.4),0_10px_24px_rgba(0,0,0,0.11)] hover:-translate-y-0.5'
                : 'shadow-[0_2px_8px_rgba(0,0,0,0.07)] hover:shadow-[0_10px_24px_rgba(0,0,0,0.11)] hover:-translate-y-0.5'
            }
          `}
          style={{
            ...provided.draggableProps.style,
            background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)',
            border: '1px solid rgba(0,0,0,0.06)',
            borderLeft: `4px solid ${snapshot.isDragging ? '#6366F1' : leftBorderColor}`,
            transform: snapshot.isDragging && provided.draggableProps.style?.transform
              ? `${provided.draggableProps.style.transform} rotate(2deg)`
              : provided.draggableProps.style?.transform,
          }}
        >
          {/* Nome + interesse */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <p className="text-[13px] font-semibold text-[#0F172A] leading-snug truncate flex-1 min-w-0">
              {quente && <span className="mr-1">🔥</span>}
              {oficina.nome}
            </p>
            <button
              onClick={handleCiclarNivel}
              title="Clique para alterar nível de interesse"
              className="shrink-0 text-[10px] px-2 py-0.5 rounded-full font-semibold border transition-all duration-150 hover:opacity-75"
              style={
                nivelLocal
                  ? {
                      background: NIVEL_CONFIG[nivelLocal].bg,
                      color: NIVEL_CONFIG[nivelLocal].text,
                      borderColor: NIVEL_CONFIG[nivelLocal].border,
                    }
                  : { background: '#F8FAFC', color: '#CBD5E1', borderColor: '#E2E8F0' }
              }
            >
              {nivelLocal ? NIVEL_CONFIG[nivelLocal].label : '★ nível'}
            </button>
          </div>

          {/* Localização */}
          {(oficina.bairro || oficina.cidade) && (
            <p className="text-[11px] mb-2.5 truncate font-medium" style={{ color: '#94A3B8' }}>
              📍 {[oficina.bairro, oficina.cidade].filter(Boolean).join(', ')}
            </p>
          )}

          {/* Próxima ação */}
          <div
            className="flex items-center justify-between gap-1.5 text-xs px-2.5 py-1.5 rounded-xl mb-2.5 border"
            style={
              !temAcao
                ? { background: '#FFFBEB', color: '#B45309', borderColor: '#FCD34D' }
                : acaoAtrasada
                  ? { background: '#FFF1F2', color: '#DC2626', borderColor: '#FECDD3' }
                  : acaoHoje
                    ? { background: '#FFF7ED', color: '#EA580C', borderColor: '#FED7AA' }
                    : { background: '#EFF6FF', color: '#2563EB', borderColor: '#BFDBFE' }
            }
          >
            <span className="font-semibold truncate">
              {temAcao ? ACAO_LABEL[oficina.proxima_acao_tipo!] : '⚠ Sem próxima ação'}
            </span>
            {temAcao && (
              <span className="font-bold shrink-0 ml-1">
                {dataRelativaAcao(oficina.proxima_acao_data!)}
              </span>
            )}
          </div>

          {/* Rodapé: botões de contato + SLA + dias na etapa */}
          <div
            className="flex items-center justify-between gap-1 pt-2.5"
            style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}
          >
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {oficina.contato && (
                <a
                  href={whatsappUrl(oficina.contato)}
                  target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-bold transition-all duration-150 hover:scale-110"
                  style={{ background: '#DCFCE7', color: '#16A34A' }}
                >
                  WA
                </a>
              )}
              {oficina.contato && (
                <a
                  href={`tel:${oficina.contato}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-bold transition-all duration-150 hover:scale-110"
                  style={{ background: '#EFF6FF', color: '#2563EB' }}
                >
                  Tel
                </a>
              )}
              {oficina.instagram && (
                <a
                  href={`https://instagram.com/${oficina.instagram.replace('@', '')}`}
                  target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-bold transition-all duration-150 hover:scale-110"
                  style={{ background: '#FDF2F8', color: '#C026D3' }}
                >
                  IG
                </a>
              )}
              {sla && (
                <span
                  className="text-[11px] ml-1 font-medium"
                  style={{ color: slaColor }}
                  title="Última interação"
                >
                  {sla.texto}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Dias na etapa */}
              <span
                className="text-[11px] px-2 py-0.5 rounded-lg font-bold"
                style={
                  dias >= 7
                    ? { background: '#FFF1F2', color: '#DC2626' }
                    : dias >= 3
                      ? { background: '#FFFBEB', color: '#B45309' }
                      : { background: '#F1F5F9', color: '#64748B' }
                }
              >
                {dias}d
              </span>

              {/* Botão de exclusão */}
              {!confirmandoExclusao ? (
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmandoExclusao(true) }}
                  title="Excluir oficina"
                  className="flex items-center justify-center w-6 h-6 rounded-lg text-[11px] transition-all duration-150 hover:scale-110 opacity-40 hover:opacity-100"
                  style={{ background: '#FFF1F2', color: '#DC2626' }}
                >
                  🗑
                </button>
              ) : (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={handleConfirmarExclusao}
                    disabled={excluindo}
                    title="Confirmar exclusão"
                    className="flex items-center justify-center w-6 h-6 rounded-lg text-[11px] font-bold transition-all duration-150 hover:scale-110 disabled:opacity-50"
                    style={{ background: '#FFF1F2', color: '#DC2626', border: '1px solid #FECDD3' }}
                  >
                    {excluindo ? '…' : '✓'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmandoExclusao(false) }}
                    title="Cancelar"
                    className="flex items-center justify-center w-6 h-6 rounded-lg text-[11px] font-bold transition-all duration-150 hover:scale-110"
                    style={{ background: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0' }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  )
}
