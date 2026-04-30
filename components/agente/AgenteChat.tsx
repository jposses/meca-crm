'use client'

import { useState, useRef, useEffect } from 'react'
import type { Oficina, Contato } from '@/lib/types'
import { AtalhoButton } from './AtalhoButton'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ContextoOficina {
  nome: string
  bairro: string | null
  cidade: string | null
  estagio: string
  responsavel: string | null
  obs: string | null
  historico: string
}

interface AgenteChatProps {
  oficina: Oficina
  contatos: Contato[]
}

const ATALHOS = [
  {
    label: 'Primeira abordagem',
    prompt: 'Gere uma mensagem de WhatsApp para o primeiro contato com essa oficina. Seja direto e mostre o valor do Meca em 3 linhas.',
  },
  {
    label: 'Follow-up',
    prompt: 'Gere uma mensagem de follow-up para essa oficina que ainda não respondeu. Tom leve, sem pressão.',
  },
  {
    label: 'Pitch do Meca',
    prompt: 'Monte o pitch completo de valor do Meca para essa oficina, destacando os benefícios práticos: clientes qualificados, gestão simples, sem concorrência simultânea.',
  },
  {
    label: 'Contornar objeção',
    prompt: 'Quais são as objeções mais comuns de oficinas e como contorná-las? Foque nas 3 principais.',
  },
  {
    label: 'Próximo passo',
    prompt: 'Com base no estágio atual e no histórico, qual deve ser o próximo passo concreto com essa oficina?',
  },
]

function formatarHistorico(contatos: Contato[]): string {
  if (contatos.length === 0) return 'Nenhum contato registrado.'
  return contatos
    .map((c) => {
      const data = new Date(c.criado_em).toLocaleDateString('pt-BR')
      return `[${data}] ${c.tipo ?? 'outro'}: ${c.conteudo ?? ''}`
    })
    .join('\n')
}

export function AgenteChat({ oficina, contatos }: AgenteChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const fimRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function montarContexto(): ContextoOficina {
    return {
      nome: oficina.nome,
      bairro: oficina.bairro,
      cidade: oficina.cidade,
      estagio: oficina.estagio,
      responsavel: oficina.responsavel,
      obs: oficina.obs,
      historico: formatarHistorico(contatos),
    }
  }

  async function enviarMensagem(texto: string): Promise<void> {
    if (!texto.trim() || carregando) return

    const novaMensagemUsuario: ChatMessage = { role: 'user', content: texto }
    const historicoAtualizado = [...messages, novaMensagemUsuario]

    setMessages(historicoAtualizado)
    setInput('')
    setCarregando(true)
    setErro(null)

    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    try {
      const resposta = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historicoAtualizado,
          contextoOficina: montarContexto(),
        }),
      })

      if (!resposta.ok) {
        throw new Error(`Erro ${resposta.status}: ${resposta.statusText}`)
      }

      if (!resposta.body) throw new Error('Resposta sem corpo.')

      const reader = resposta.body.getReader()
      const decoder = new TextDecoder()
      let textoAcumulado = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        textoAcumulado += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const copia = [...prev]
          copia[copia.length - 1] = { role: 'assistant', content: textoAcumulado }
          return copia
        })
      }
    } catch (e) {
      const mensagemErro = e instanceof Error ? e.message : 'Erro desconhecido.'
      setErro(`Falha ao conectar com o assistente. ${mensagemErro}`)
      setMessages((prev) => prev.filter((_, i) => i < prev.length - 1))
    } finally {
      setCarregando(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    enviarMensagem(input)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Atalhos rápidos */}
      <div className="flex flex-wrap gap-1.5">
        {ATALHOS.map((atalho) => (
          <AtalhoButton
            key={atalho.label}
            label={atalho.label}
            onClick={() => enviarMensagem(atalho.prompt)}
            disabled={carregando}
          />
        ))}
      </div>

      {/* Área de mensagens */}
      <div
        className="h-64 overflow-y-auto flex flex-col gap-3 p-3 rounded-xl scrollbar-thin"
        style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {messages.length === 0 && (
          <p className="text-xs italic text-center mt-8" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Use um atalho ou escreva uma pergunta para o assistente.
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-[85%] text-xs rounded-xl px-3 py-2 whitespace-pre-wrap leading-relaxed"
              style={
                msg.role === 'user'
                  ? { background: 'linear-gradient(135deg, #00C977, #00A060)', color: '#fff', boxShadow: '0 2px 8px rgba(0,201,119,0.3)' }
                  : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              {msg.content || (carregando && msg.role === 'assistant' ? (
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>...</span>
              ) : '')}
            </div>
          </div>
        ))}
        {erro && (
          <p className="text-xs text-center" style={{ color: '#F87171' }}>{erro}</p>
        )}
        <div ref={fimRef} />
      </div>

      {/* Campo de input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={carregando}
          placeholder="Pergunte ao assistente..."
          className="flex-1 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 disabled:opacity-50 transition-all"
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.85)',
          }}
        />
        <button
          type="submit"
          disabled={carregando || !input.trim()}
          className="text-xs font-bold text-white px-4 py-2.5 rounded-xl transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #00C977, #00A060)', boxShadow: '0 2px 8px rgba(0,201,119,0.3)' }}
        >
          {carregando ? '...' : 'Enviar'}
        </button>
      </form>
    </div>
  )
}
