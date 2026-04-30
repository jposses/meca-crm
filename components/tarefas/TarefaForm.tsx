'use client'

// Formulário para criar uma nova tarefa vinculada a uma oficina
import { useState } from 'react'

interface TarefaFormProps {
  onSalvar: (descricao: string, prazo: string | null, responsavel: string | null) => void
  carregando?: boolean
}

export function TarefaForm({ onSalvar, carregando = false }: TarefaFormProps) {
  const [descricao, setDescricao] = useState('')
  const [prazo, setPrazo] = useState('')
  const [responsavel, setResponsavel] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!descricao.trim()) return
    onSalvar(
      descricao.trim(),
      prazo || null,
      responsavel.trim() || null
    )
    setDescricao('')
    setPrazo('')
    setResponsavel('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Descrição */}
      <div>
        <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">
          Tarefa *
        </label>
        <input
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Ex: Ligar para confirmar interesse amanhã"
          required
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
        />
      </div>

      {/* Prazo + Responsável em linha */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">
            Prazo
          </label>
          <input
            type="date"
            value={prazo}
            onChange={(e) => setPrazo(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">
            Responsável
          </label>
          <input
            value={responsavel}
            onChange={(e) => setResponsavel(e.target.value)}
            placeholder="Nome ou role"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={carregando || !descricao.trim()}
        className="self-start bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        {carregando ? 'Salvando...' : 'Adicionar tarefa'}
      </button>
    </form>
  )
}
