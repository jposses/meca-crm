'use client'

import type { Tarefa } from '@/lib/types'

interface TarefaItemProps {
  tarefa: Tarefa
  onToggle: (id: string, feita: boolean) => void
  podeEditar: boolean
}

function estaVencida(tarefa: Tarefa): boolean {
  if (tarefa.feita || !tarefa.prazo) return false
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  return new Date(tarefa.prazo) < hoje
}

function formatarData(dataIso: string): string {
  return new Date(dataIso + 'T00:00:00').toLocaleDateString('pt-BR')
}

export function TarefaItem({ tarefa, onToggle, podeEditar }: TarefaItemProps) {
  const vencida = estaVencida(tarefa)

  return (
    <div
      className="flex items-start gap-3 p-3.5 rounded-xl transition-all duration-150 hover:brightness-[0.98]"
      style={
        tarefa.feita
          ? { background: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)', borderLeft: '3px solid #E2E8F0' }
          : vencida
            ? { background: '#FFF1F2', border: '1px solid #FECDD3', borderLeft: '3px solid #EF4444' }
            : { background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderLeft: '3px solid #00C977' }
      }
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={tarefa.feita}
        onChange={(e) => podeEditar && onToggle(tarefa.id, e.target.checked)}
        disabled={!podeEditar}
        className="mt-0.5 w-4 h-4 cursor-pointer disabled:cursor-not-allowed rounded"
        style={{ accentColor: '#00C977' }}
      />

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium leading-snug"
          style={{ color: tarefa.feita ? '#94A3B8' : '#0F172A', textDecoration: tarefa.feita ? 'line-through' : 'none' }}
        >
          {tarefa.descricao}
        </p>

        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {tarefa.prazo && (
            <span
              className="text-[11px] font-semibold"
              style={{ color: vencida ? '#DC2626' : '#94A3B8' }}
            >
              {vencida ? '⚠ ' : '📅 '}Prazo: {formatarData(tarefa.prazo)}
            </span>
          )}
          {tarefa.responsavel && (
            <span className="text-[11px] font-medium" style={{ color: '#94A3B8' }}>
              👤 {tarefa.responsavel}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
