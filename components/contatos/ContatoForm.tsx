'use client'

// Formulário para registrar um novo contato com uma oficina
import { useState } from 'react'
import type { TipoContato } from '@/lib/types'

interface ContatoFormProps {
  onSalvar: (tipo: TipoContato, conteudo: string) => void
  carregando?: boolean
}

const TIPOS: Array<{ valor: TipoContato; label: string; icone: string }> = [
  { valor: 'whatsapp',   label: 'WhatsApp',   icone: '💬' },
  { valor: 'ligacao',    label: 'Ligação',    icone: '📞' },
  { valor: 'email',      label: 'E-mail',     icone: '✉️' },
  { valor: 'presencial', label: 'Presencial', icone: '🤝' },
  { valor: 'outro',      label: 'Outro',      icone: '📋' },
]

export function ContatoForm({ onSalvar, carregando = false }: ContatoFormProps) {
  const [tipo, setTipo] = useState<TipoContato>('whatsapp')
  const [conteudo, setConteudo] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!conteudo.trim()) return
    onSalvar(tipo, conteudo.trim())
    setConteudo('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Seletor de tipo */}
      <div>
        <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-2">
          Tipo de contato
        </label>
        <div className="flex flex-wrap gap-2">
          {TIPOS.map((t) => (
            <button
              key={t.valor}
              type="button"
              onClick={() => setTipo(t.valor)}
              className={`
                text-xs px-3 py-1.5 rounded-full border font-medium transition-colors
                ${tipo === t.valor
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {t.icone} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Textarea do conteúdo */}
      <div>
        <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">
          Resumo do contato
        </label>
        <textarea
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          placeholder="O que foi conversado, resultado, próximos passos..."
          rows={3}
          required
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={carregando || !conteudo.trim()}
        className="self-start bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        {carregando ? 'Salvando...' : 'Registrar contato'}
      </button>
    </form>
  )
}
