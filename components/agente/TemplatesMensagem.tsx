'use client'

import { useState } from 'react'
import type { Oficina } from '@/lib/types'

const LINK_CADASTRO = 'https://linktr.ee/mecabr'

interface TemplatesMensagemProps {
  oficina: Oficina
}

const TEMPLATES = [
  {
    id: 'abordagem',
    label: 'Primeira abordagem',
    icon: '👋',
    texto: (o: Oficina) =>
      `Fala, tudo bem? Vi sua oficina aqui em ${o.bairro || 'sua região'} e queria te mostrar como o Meca pode te trazer novos clientes da região.`,
  },
  {
    id: 'followup',
    label: 'Follow-up',
    icon: '🔄',
    texto: () =>
      `Fala! Passando aqui pra ver se conseguiu dar uma olhada no que te mandei sobre o Meca.`,
  },
  {
    id: 'cadastro',
    label: 'Link de cadastro',
    icon: '🔗',
    badge: 'conversão',
    texto: () =>
      `Boa! Então faz o seguinte: se cadastra aqui rapidinho que eu mesmo já te aprovo. A partir disso, sua oficina já começa a aparecer para clientes da sua região no Meca 👇\n\n${LINK_CADASTRO}`,
  },
  {
    id: 'recuperar',
    label: 'Recuperar lead',
    icon: '💪',
    texto: () =>
      `Fala! Faz um tempo que a gente se falou. Hoje o Meca já está trazendo clientes pra várias oficinas aí da região.`,
  },
]

function whatsappUrl(tel: string, texto: string): string {
  const n = tel.replace(/\D/g, '')
  return `https://wa.me/${n.startsWith('55') ? n : '55' + n}?text=${encodeURIComponent(texto)}`
}

export function TemplatesMensagem({ oficina }: TemplatesMensagemProps) {
  const [copiado, setCopiado] = useState<string | null>(null)
  const [expandido, setExpandido] = useState<string | null>(null)

  async function copiar(texto: string, id: string) {
    await navigator.clipboard.writeText(texto)
    setCopiado(id)
    setTimeout(() => setCopiado(null), 2000)
  }

  function toggleExpandir(id: string) {
    setExpandido((prev) => (prev === id ? null : id))
  }

  return (
    <section
      className="rounded-2xl p-6"
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)',
      }}
    >
      <div className="mb-4">
        <h2 className="text-[15px] font-semibold" style={{ color: '#0F172A' }}>Templates de mensagem</h2>
        <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Copie ou envie direto pelo WhatsApp</p>
      </div>

      <div className="flex flex-col gap-2">
        {TEMPLATES.map((t) => {
          const texto = t.texto(oficina)
          const temContato = !!oficina.contato
          const foiCopiado = copiado === t.id
          const estaExpandido = expandido === t.id

          return (
            <div
              key={t.id}
              className="rounded-xl overflow-hidden transition-all duration-150"
              style={{
                border: '1px solid rgba(0,0,0,0.06)',
                background: estaExpandido ? '#F8FAFC' : '#ffffff',
              }}
            >
              {/* Linha principal */}
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <button
                  onClick={() => toggleExpandir(t.id)}
                  className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                >
                  <span className="text-base shrink-0">{t.icon}</span>
                  <span className="text-sm font-semibold truncate" style={{ color: '#0F172A' }}>{t.label}</span>
                  {'badge' in t && t.badge && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: 'rgba(0,201,119,0.12)', color: '#00A060', border: '1px solid rgba(0,201,119,0.25)' }}
                    >
                      {t.badge}
                    </span>
                  )}
                  <span className="text-[10px] shrink-0 transition-transform duration-150" style={{ color: '#CBD5E1' }}>
                    {estaExpandido ? '▲' : '▼'}
                  </span>
                </button>

                <div className="flex items-center gap-1.5 shrink-0">
                  {temContato ? (
                    <a
                      href={whatsappUrl(oficina.contato!, texto)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-white px-3 py-1.5 rounded-lg transition-all duration-150 hover:-translate-y-0.5 hover:opacity-90"
                      style={{
                        background: 'linear-gradient(135deg, #00C977, #00A060)',
                        boxShadow: '0 2px 8px rgba(0,201,119,0.35)',
                      }}
                    >
                      WA
                    </a>
                  ) : (
                    <span
                      className="text-xs font-bold px-3 py-1.5 rounded-lg cursor-not-allowed"
                      style={{ background: '#F1F5F9', color: '#CBD5E1' }}
                      title="Sem contato cadastrado"
                    >
                      WA
                    </span>
                  )}
                  <button
                    onClick={() => copiar(texto, t.id)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-150 hover:opacity-80"
                    style={
                      foiCopiado
                        ? { background: 'rgba(0,201,119,0.1)', color: '#00A060', border: '1px solid rgba(0,201,119,0.25)' }
                        : { background: '#F8FAFC', color: '#64748B', border: '1px solid #E5EAF2' }
                    }
                  >
                    {foiCopiado ? '✓ Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>

              {/* Prévia expansível */}
              {estaExpandido && (
                <div className="px-4 pb-4" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                  <p className="text-xs whitespace-pre-wrap leading-relaxed pt-3" style={{ color: '#475569' }}>
                    {texto}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
