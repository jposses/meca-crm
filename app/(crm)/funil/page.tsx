import { getOficinas } from '@/lib/queries/oficinas'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { NovaOficinaModal } from '@/components/oficina/NovaOficinaModal'

export default async function FunilPage() {
  const oficinas = await getOficinas()

  return (
    <div className="p-8 min-h-full">
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-1">Funil de Prospecção</h1>
          <p className="text-sm text-[#64748B]">Arraste os cards para mover entre estágios</p>
        </div>
        <NovaOficinaModal />
      </div>

      <KanbanBoard oficinasIniciais={oficinas} />
    </div>
  )
}
