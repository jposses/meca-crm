'use client'

import { useState, useTransition } from 'react'
import type { Oficina, Contato, Tarefa, Estagio, TipoContato } from '@/lib/types'
import { OficinaPainel } from '@/components/oficina/OficinaPainel'
import { ContatoTimeline } from '@/components/contatos/ContatoTimeline'
import { ContatoForm } from '@/components/contatos/ContatoForm'
import { TarefaLista } from '@/components/tarefas/TarefaLista'
import { TarefaForm } from '@/components/tarefas/TarefaForm'
import { AgenteChat } from '@/components/agente/AgenteChat'
import { TemplatesMensagem } from '@/components/agente/TemplatesMensagem'
import { adicionarContato } from '@/lib/actions/contatos'
import { criarTarefa, marcarTarefaFeita } from '@/lib/actions/tarefas'
import { editarOficina, mudarEstagio } from '@/lib/actions/oficinas'

interface Props {
  oficina: Oficina
  contatosIniciais: Contato[]
  tarefasIniciais: Tarefa[]
  podeEditar: boolean
}

export function OficinaPaginaClient({ oficina: oficinaProp, contatosIniciais, tarefasIniciais, podeEditar }: Props) {
  const [oficina, setOficina] = useState<Oficina>(oficinaProp)
  const [contatos, setContatos] = useState<Contato[]>(contatosIniciais)
  const [tarefas, setTarefas] = useState<Tarefa[]>(tarefasIniciais)
  const [mostrarFormContato, setMostrarFormContato] = useState(false)
  const [mostrarFormTarefa, setMostrarFormTarefa] = useState(false)
  const [isPendingContato, startTransitionContato] = useTransition()
  const [isPendingTarefa, startTransitionTarefa] = useTransition()

  function handleSalvarContato(tipo: TipoContato, conteudo: string) {
    const tempId = crypto.randomUUID()
    const novoContato: Contato = {
      id: tempId,
      oficina_id: oficina.id,
      tipo,
      conteudo,
      autor: null,
      criado_em: new Date().toISOString(),
    }

    const agora = new Date().toISOString()
    setContatos((prev) => [novoContato, ...prev])
    setOficina((prev) => ({ ...prev, ultimo_contato_em: agora }))
    setMostrarFormContato(false)

    startTransitionContato(async () => {
      const { error } = await adicionarContato({
        oficina_id: oficina.id,
        tipo,
        conteudo,
        autor: null,
      })
      if (error) {
        setContatos((prev) => prev.filter((c) => c.id !== tempId))
        setOficina((prev) => ({ ...prev, ultimo_contato_em: oficinaProp.ultimo_contato_em }))
      }
    })
  }

  function handleSalvarTarefa(descricao: string, prazo: string | null, responsavel: string | null) {
    const tempId = crypto.randomUUID()
    const novaTarefa: Tarefa = {
      id: tempId,
      oficina_id: oficina.id,
      descricao,
      prazo,
      feita: false,
      responsavel,
      criado_em: new Date().toISOString(),
    }

    setTarefas((prev) => [...prev, novaTarefa])
    setMostrarFormTarefa(false)

    startTransitionTarefa(async () => {
      const { data, error } = await criarTarefa({
        oficina_id: oficina.id,
        descricao,
        prazo,
        feita: false,
        responsavel: null,
      })
      if (error) {
        setTarefas((prev) => prev.filter((t) => t.id !== tempId))
      } else if (data) {
        setTarefas((prev) => prev.map((t) => (t.id === tempId ? { ...data, responsavel } : t)))
      }
    })
  }

  function handleToggleTarefa(id: string, feita: boolean) {
    setTarefas((prev) => prev.map((t) => (t.id === id ? { ...t, feita } : t)))
    marcarTarefaFeita(id, feita)
  }

  function handleSalvarOficina(dados: Partial<Oficina>) {
    setOficina((prev) => ({ ...prev, ...dados }))
    editarOficina(oficina.id, dados)
  }

  function handleMudarEstagio(novoEstagio: Estagio) {
    setOficina((prev) => ({ ...prev, estagio: novoEstagio }))
    mudarEstagio(oficina.id, novoEstagio)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6">
        <a
          href="/funil"
          className="font-medium transition-colors duration-150 hover:opacity-100"
          style={{ color: '#94A3B8' }}
        >
          Funil
        </a>
        <span style={{ color: '#CBD5E1' }}>/</span>
        <span className="font-semibold" style={{ color: '#0F172A' }}>{oficina.nome}</span>
      </nav>

      <div className="grid grid-cols-5 gap-6">
        {/* Painel principal (esquerda) */}
        <div className="col-span-2 flex flex-col gap-4">
          <OficinaPainel
            oficina={oficina}
            podeEditar={podeEditar}
            onSalvar={handleSalvarOficina}
            onMudarEstagio={handleMudarEstagio}
          />

          {/* Agente IA — seção dark distinta */}
          <section
            className="rounded-2xl p-6"
            style={{
              background: 'linear-gradient(160deg, #0f172a 0%, #090e1d 100%)',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 8px 32px rgba(7,17,31,0.25)',
            }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{ background: 'rgba(0,201,119,0.15)', border: '1px solid rgba(0,201,119,0.3)' }}
              >
                🤖
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-white">Agente IA</h2>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
                  Assistente de prospecção
                </p>
              </div>
            </div>
            <AgenteChat oficina={oficina} contatos={contatos} />
          </section>
        </div>

        {/* Colunas direitas */}
        <div className="col-span-3 flex flex-col gap-5">
          <TemplatesMensagem oficina={oficina} />

          {/* Histórico de Contatos */}
          <section
            className="rounded-2xl p-6 flex flex-col h-[340px]"
            style={{
              background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)',
            }}
          >
            <div className="flex items-center justify-between mb-5 shrink-0">
              <div>
                <h2 className="text-[15px] font-semibold" style={{ color: '#0F172A' }}>
                  Histórico de Contatos
                </h2>
                <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                  Interações registradas com esta oficina
                </p>
              </div>
              {podeEditar && (
                <button
                  onClick={() => setMostrarFormContato((v) => !v)}
                  className="text-xs font-semibold transition-all duration-150 px-3 py-1.5 rounded-lg hover:border-[#00C977] hover:text-[#00C977]"
                  style={{ color: '#0F172A', border: '1px solid #E5EAF2', background: '#F8FAFC' }}
                >
                  {mostrarFormContato ? 'Cancelar' : '+ Registrar contato'}
                </button>
              )}
            </div>
            {mostrarFormContato && (
              <div
                className="mb-4 p-4 rounded-xl shrink-0"
                style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}
              >
                <ContatoForm onSalvar={handleSalvarContato} carregando={isPendingContato} />
              </div>
            )}
            <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin">
              <ContatoTimeline contatos={contatos} />
            </div>
          </section>

          {/* Tarefas */}
          <section
            className="rounded-2xl p-6 flex flex-col h-[340px]"
            style={{
              background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)',
            }}
          >
            <div className="flex items-center justify-between mb-5 shrink-0">
              <div>
                <h2 className="text-[15px] font-semibold" style={{ color: '#0F172A' }}>Tarefas</h2>
                <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Ações vinculadas a este lead</p>
              </div>
              {podeEditar && (
                <button
                  onClick={() => setMostrarFormTarefa((v) => !v)}
                  className="text-xs font-semibold transition-all duration-150 px-3 py-1.5 rounded-lg hover:border-[#00C977] hover:text-[#00C977]"
                  style={{ color: '#0F172A', border: '1px solid #E5EAF2', background: '#F8FAFC' }}
                >
                  {mostrarFormTarefa ? 'Cancelar' : '+ Nova tarefa'}
                </button>
              )}
            </div>
            {mostrarFormTarefa && (
              <div
                className="mb-4 p-4 rounded-xl shrink-0"
                style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}
              >
                <TarefaForm onSalvar={handleSalvarTarefa} carregando={isPendingTarefa} />
              </div>
            )}
            <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin">
              <TarefaLista tarefas={tarefas} onToggle={handleToggleTarefa} podeEditar={podeEditar} />
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
