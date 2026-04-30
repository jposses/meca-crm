// Endpoint do Agente IA — recebe mensagens e contexto da oficina, retorna streaming do Claude
import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

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

interface RequestBody {
  messages: ChatMessage[]
  contextoOficina: ContextoOficina
}

// Monta o system prompt injetando o contexto da oficina
function montarSystemPrompt(ctx: ContextoOficina): string {
  return `Você é um assistente especializado em prospecção de oficinas mecânicas para o Meca — um marketplace que conecta motoristas a oficinas de confiança.

Contexto da oficina atual:
- Nome: ${ctx.nome}
- Bairro: ${ctx.bairro ?? 'não informado'}, ${ctx.cidade ?? 'não informada'}
- Estágio no funil: ${ctx.estagio}
- Responsável: ${ctx.responsavel ?? 'não informado'}
- Observações: ${ctx.obs ?? 'nenhuma'}
- Histórico de contatos:
${ctx.historico}

Sobre o Meca:
- Marketplace que conecta motoristas a oficinas de confiança
- A oficina recebe clientes com intenção real de serviço, sem concorrência simultânea
- Taxa de 12% sobre o valor líquido de cada serviço executado
- Gestão de agenda, orçamentos e execução em um único sistema
- Canal de aquisição de clientes sem depender de marketing próprio

Seu papel é ajudar o time de vendas a converter essa oficina em parceira do Meca.
Tom: direto, prático, sem enrolação. Linguagem simples. Foco em resultado.`
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body: RequestBody = await req.json()
    const { messages, contextoOficina } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ erro: 'Campo "messages" é obrigatório.' }, { status: 400 })
    }

    if (!contextoOficina) {
      return Response.json({ erro: 'Campo "contextoOficina" é obrigatório.' }, { status: 400 })
    }

    const systemPrompt = montarSystemPrompt(contextoOficina)

    // Cria o stream com a API do Claude
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    })

    // Retorna ReadableStream com os chunks de texto conforme chegam
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              controller.enqueue(new TextEncoder().encode(chunk.delta.text))
            }
          }
          controller.close()
        } catch (e) {
          controller.error(e)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (e) {
    const mensagem = e instanceof Error ? e.message : 'Erro interno.'
    console.error('[api/ai] Erro:', mensagem)
    return Response.json({ erro: mensagem }, { status: 500 })
  }
}
