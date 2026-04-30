'use client'

import { Droppable } from '@hello-pangea/dnd'
import type { Estagio, Oficina } from '@/lib/types'
import { KanbanCard } from './KanbanCard'

interface KanbanColunaProps {
  estagio: Estagio
  oficinas: Oficina[]
}

const ESTAGIO_CONFIG: Record<Estagio, {
  label: string
  accent: string
  headerBg: string
  dropBg: string
}> = {
  prospectando:        { label: 'Prospectando',     accent: '#6366F1', headerBg: 'rgba(99,102,241,0.09)',  dropBg: 'rgba(99,102,241,0.07)'  },
  contato:             { label: 'Contato',           accent: '#3B82F6', headerBg: 'rgba(59,130,246,0.09)',  dropBg: 'rgba(59,130,246,0.07)'  },
  negociando:          { label: 'Negociando',        accent: '#F97316', headerBg: 'rgba(249,115,22,0.09)',  dropBg: 'rgba(249,115,22,0.07)'  },
  aguardando_cadastro: { label: 'Aguard. cadastro', accent: '#14B8A6', headerBg: 'rgba(20,184,166,0.09)',  dropBg: 'rgba(20,184,166,0.07)'  },
  cadastrado:          { label: 'Cadastrado',        accent: '#00C977', headerBg: 'rgba(0,201,119,0.09)',   dropBg: 'rgba(0,201,119,0.07)'   },
  perdido:             { label: 'Perdido',           accent: '#F43F5E', headerBg: 'rgba(244,63,94,0.09)',   dropBg: 'rgba(244,63,94,0.07)'   },
}

export function KanbanColuna({ estagio, oficinas }: KanbanColunaProps) {
  const cfg = ESTAGIO_CONFIG[estagio]

  return (
    <div
      className="flex flex-col shrink-0 rounded-2xl overflow-hidden"
      style={{
        width: '275px',
        background: '#F8FAFC',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      }}
    >
      {/* Cabeçalho da coluna */}
      <div
        className="flex items-center justify-between px-4 py-3.5"
        style={{
          background: cfg.headerBg,
          borderBottom: `1px solid ${cfg.accent}28`,
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: cfg.accent, boxShadow: `0 0 6px ${cfg.accent}90` }}
          />
          <span className="text-[13px] font-bold text-[#0F172A] tracking-tight">{cfg.label}</span>
        </div>
        <span
          className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
          style={{
            background: cfg.accent + '22',
            color: cfg.accent,
            border: `1px solid ${cfg.accent}38`,
          }}
        >
          {oficinas.length}
        </span>
      </div>

      {/* Área droppable */}
      <Droppable droppableId={estagio}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-1 min-h-[540px] p-3 flex flex-col gap-2.5 transition-colors duration-150"
            style={{
              background: snapshot.isDraggingOver ? cfg.dropBg : 'transparent',
            }}
          >
            {oficinas.map((oficina, index) => (
              <KanbanCard key={oficina.id} oficina={oficina} index={index} />
            ))}

            {oficinas.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-1 items-center justify-center py-10">
                <p
                  className="text-xs text-center leading-relaxed"
                  style={{ color: '#CBD5E1' }}
                >
                  Nenhum lead<br />nesta etapa
                </p>
              </div>
            )}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
