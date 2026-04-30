'use client'

import { useState } from 'react'
import type { Oficina, Estagio, NivelInteresse } from '@/lib/types'
import { EstagioSelector } from './EstagioSelector'
import { OficinaForm } from './OficinaForm'
import { ProximaAcaoCard } from './ProximaAcaoCard'

interface OficinaPainelProps {
  oficina: Oficina
  podeEditar: boolean
  onSalvar?: (dados: Partial<Oficina>) => void
  onMudarEstagio?: (novoEstagio: Estagio) => void
}

const NIVEL_CONFIG: Record<NivelInteresse, { label: string; bg: string; text: string; border: string }> = {
  alto:  { label: 'Alto',  bg: '#FFF1F2', text: '#DC2626', border: '#FECDD3' },
  medio: { label: 'Médio', bg: '#FFFBEB', text: '#B45309', border: '#FCD34D' },
  baixo: { label: 'Baixo', bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
}
const NIVEL_CICLO: Array<NivelInteresse | null> = ['alto', 'medio', 'baixo', null]

function Campo({ label, valor }: { label: string; valor: string | null }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#94A3B8' }}>{label}</p>
      <p className="text-sm font-medium" style={{ color: '#0F172A' }}>
        {valor || <span className="italic font-normal" style={{ color: '#CBD5E1' }}>não informado</span>}
      </p>
    </div>
  )
}

function whatsappUrl(tel: string): string {
  const num = tel.replace(/\D/g, '')
  return `https://wa.me/${num.startsWith('55') ? num : '55' + num}`
}

export function OficinaPainel({ oficina, podeEditar, onSalvar, onMudarEstagio }: OficinaPainelProps) {
  const [editando, setEditando] = useState(false)
  const [estagioLocal, setEstagioLocal] = useState(oficina.estagio)

  function handleSalvar(dados: Partial<Oficina>) {
    onSalvar?.(dados)
    setEditando(false)
  }

  function handleMudarEstagio(novoEstagio: Estagio) {
    setEstagioLocal(novoEstagio)
    onMudarEstagio?.(novoEstagio)
  }

  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-5"
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 28px rgba(0,0,0,0.07)',
      }}
    >
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-tight tracking-tight" style={{ color: '#0F172A' }}>
            {oficina.nome}
          </h1>
          {(oficina.bairro || oficina.cidade) && (
            <p className="text-sm mt-1 font-medium" style={{ color: '#94A3B8' }}>
              📍 {[oficina.bairro, oficina.cidade].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!editando && (
            <button
              onClick={() => {
                if (!podeEditar) return
                const idx = NIVEL_CICLO.indexOf(oficina.nivel_interesse)
                const proximo = NIVEL_CICLO[(idx + 1) % NIVEL_CICLO.length]
                onSalvar?.({ nivel_interesse: proximo })
              }}
              disabled={!podeEditar}
              title="Clique para alterar nível de interesse"
              className={`text-xs px-3 py-1 rounded-full font-semibold border transition-all duration-150 ${podeEditar ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
              style={
                oficina.nivel_interesse
                  ? { background: NIVEL_CONFIG[oficina.nivel_interesse].bg, color: NIVEL_CONFIG[oficina.nivel_interesse].text, borderColor: NIVEL_CONFIG[oficina.nivel_interesse].border }
                  : { background: '#F8FAFC', color: '#94A3B8', borderColor: '#E2E8F0' }
              }
            >
              {oficina.nivel_interesse ? NIVEL_CONFIG[oficina.nivel_interesse].label : '★ interesse'}
            </button>
          )}
          {podeEditar && !editando && (
            <button
              onClick={() => setEditando(true)}
              className="text-xs font-semibold transition-all duration-150 hover:bg-[#F1F5F9] px-3 py-1.5 rounded-lg"
              style={{ color: '#0F172A', border: '1px solid #E5EAF2', background: '#F8FAFC' }}
            >
              Editar
            </button>
          )}
        </div>
      </div>

      {/* Botões de ação rápida */}
      {!editando && (
        <div className="flex gap-2">
          {oficina.contato ? (
            <>
              <a
                href={whatsappUrl(oficina.contato)}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-bold text-white px-4 py-2.5 rounded-xl flex-1 justify-center transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0"
                style={{
                  background: 'linear-gradient(135deg, #00C977 0%, #00A060 100%)',
                  boxShadow: '0 4px 14px rgba(0,201,119,0.45)',
                }}
              >
                💬 WhatsApp
              </a>
              <a
                href={`tel:${oficina.contato}`}
                className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#EFF6FF]"
                style={{ color: '#2563EB', border: '1.5px solid #BFDBFE', background: '#F8FAFF' }}
              >
                📞 Ligar
              </a>
            </>
          ) : (
            <>
              <span
                className="flex items-center gap-2 text-sm font-bold text-white px-4 py-2.5 rounded-xl flex-1 justify-center cursor-not-allowed opacity-40"
                style={{ background: '#94A3B8' }}
                title="Sem contato cadastrado"
              >
                💬 WhatsApp
              </span>
              <span
                className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl cursor-not-allowed opacity-40"
                style={{ color: '#2563EB', border: '1.5px solid #BFDBFE', background: '#F8FAFF' }}
                title="Sem contato cadastrado"
              >
                📞 Ligar
              </span>
            </>
          )}
          {oficina.instagram ? (
            <a
              href={`https://instagram.com/${oficina.instagram.replace('@', '')}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center px-3 py-2.5 rounded-xl transition-all duration-150 hover:-translate-y-0.5 text-base"
              style={{ background: '#FDF2F8', color: '#C026D3', border: '1.5px solid #F5D0FE' }}
              title="Instagram"
            >
              📷
            </a>
          ) : (
            <span
              className="flex items-center justify-center px-3 py-2.5 rounded-xl cursor-not-allowed text-base opacity-30"
              style={{ background: '#F8FAFC', border: '1px solid #E5EAF2' }}
              title="Sem Instagram cadastrado"
            >
              📷
            </span>
          )}
        </div>
      )}

      {/* Estágio */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-2.5" style={{ color: '#94A3B8' }}>
          Estágio no funil
        </p>
        <EstagioSelector estagioAtual={estagioLocal} onChange={handleMudarEstagio} podeEditar={podeEditar} />
      </div>

      {/* Próxima ação */}
      <ProximaAcaoCard
        oficina={oficina}
        podeEditar={podeEditar}
        onSalvar={onSalvar ?? (() => {})}
      />

      {/* Dados cadastrais ou formulário */}
      {editando ? (
        <OficinaForm
          oficina={{ ...oficina, estagio: estagioLocal }}
          onSalvar={handleSalvar}
          onCancelar={() => setEditando(false)}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 pt-1" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <Campo label="Contato" valor={oficina.contato} />
          <Campo label="Responsável" valor={oficina.responsavel} />
          {oficina.instagram && <Campo label="Instagram" valor={oficina.instagram} />}
          <div className={oficina.instagram ? 'col-span-1' : 'col-span-2'}>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#94A3B8' }}>Observações</p>
            <p className="text-sm font-medium whitespace-pre-wrap" style={{ color: '#0F172A' }}>
              {oficina.obs || <span className="italic font-normal" style={{ color: '#CBD5E1' }}>sem observações</span>}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
