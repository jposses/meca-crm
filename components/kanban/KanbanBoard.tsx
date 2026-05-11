'use client'

import { useState } from 'react'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import type { Estagio, Oficina } from '@/lib/types'
import { mudarEstagio } from '@/lib/actions/oficinas'
import { KanbanColuna } from './KanbanColuna'

const ESTAGIOS_ORDEM: Estagio[] = [
  'prospectando',
  'contato',
  'negociando',
  'aguardando_cadastro',
  'cadastrado',
  'perdido',
]

interface KanbanBoardProps {
  oficinasIniciais: Oficina[]
}

export function KanbanBoard({ oficinasIniciais }: KanbanBoardProps) {
  const [oficinas, setOficinas] = useState<Oficina[]>(oficinasIniciais)

  function porEstagio(estagio: Estagio): Oficina[] {
    return oficinas.filter((o) => o.estagio === estagio)
  }

  function handleDelete(id: string) {
    setOficinas((prev) => prev.filter((o) => o.id !== id))
  }

  function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const novoEstagio = destination.droppableId as Estagio
    const agora = new Date().toISOString()
    setOficinas((prev) =>
      prev.map((o) => (o.id === draggableId ? { ...o, estagio: novoEstagio, estagio_entrou_em: agora } : o))
    )
    mudarEstagio(draggableId, novoEstagio)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-5 overflow-x-auto pb-6 min-h-[600px] items-start">
        {ESTAGIOS_ORDEM.map((estagio) => (
          <KanbanColuna
            key={estagio}
            estagio={estagio}
            oficinas={porEstagio(estagio)}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </DragDropContext>
  )
}
