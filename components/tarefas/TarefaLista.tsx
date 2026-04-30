'use client'

import type { Tarefa } from '@/lib/types'
import { TarefaItem } from './TarefaItem'

interface TarefaListaProps {
  tarefas: Tarefa[]
  onToggle: (id: string, feita: boolean) => void
  podeEditar: boolean
}

export function TarefaLista({ tarefas, onToggle, podeEditar }: TarefaListaProps) {
  if (tarefas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2.5">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-xl"
          style={{ background: '#F1F5F9' }}
        >
          ✅
        </div>
        <p className="text-sm font-semibold" style={{ color: '#94A3B8' }}>Nenhuma tarefa cadastrada</p>
        <p className="text-xs" style={{ color: '#CBD5E1' }}>Clique em &quot;Nova tarefa&quot; para adicionar</p>
      </div>
    )
  }

  const pendentes = tarefas
    .filter((t) => !t.feita)
    .sort((a, b) => {
      if (!a.prazo && !b.prazo) return 0
      if (!a.prazo) return 1
      if (!b.prazo) return -1
      return new Date(a.prazo).getTime() - new Date(b.prazo).getTime()
    })

  const feitas = tarefas.filter((t) => t.feita)

  return (
    <div className="flex flex-col gap-2">
      {pendentes.map((tarefa) => (
        <TarefaItem key={tarefa.id} tarefa={tarefa} onToggle={onToggle} podeEditar={podeEditar} />
      ))}

      {pendentes.length > 0 && feitas.length > 0 && (
        <div className="flex items-center gap-3 py-1.5">
          <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.06)' }} />
          <span className="text-[11px] font-medium" style={{ color: '#CBD5E1' }}>Concluídas</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.06)' }} />
        </div>
      )}

      {feitas.map((tarefa) => (
        <TarefaItem key={tarefa.id} tarefa={tarefa} onToggle={onToggle} podeEditar={podeEditar} />
      ))}
    </div>
  )
}
