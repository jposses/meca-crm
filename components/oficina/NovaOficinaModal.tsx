'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { criarOficina } from '@/lib/actions/oficinas'
import type { Estagio, TipoAcao, NivelInteresse } from '@/lib/types'

const TIPOS_ACAO: Array<{ valor: TipoAcao; label: string; emoji: string }> = [
  { valor: 'ligar',     label: 'Ligar',     emoji: '📞' },
  { valor: 'whatsapp',  label: 'WhatsApp',  emoji: '💬' },
  { valor: 'reuniao',   label: 'Reunião',   emoji: '🤝' },
  { valor: 'follow_up', label: 'Follow-up', emoji: '🔄' },
  { valor: 'proposta',  label: 'Proposta',  emoji: '📄' },
  { valor: 'outro',     label: 'Outro',     emoji: '✅' },
]

const ESTAGIOS: Array<{ valor: Estagio; label: string; cor: string }> = [
  { valor: 'prospectando',        label: 'Prospectando',  cor: '#6366F1' },
  { valor: 'contato',             label: 'Contato',       cor: '#3B82F6' },
  { valor: 'negociando',          label: 'Negociando',    cor: '#F59E0B' },
  { valor: 'aguardando_cadastro', label: 'Aguardando',    cor: '#8B5CF6' },
  { valor: 'cadastrado',          label: 'Cadastrado',    cor: '#00C977' },
  { valor: 'perdido',             label: 'Perdido',       cor: '#EF4444' },
]

const NIVEL_CONFIG = {
  '':      { label: '—',     bg: '#F8FAFC', text: '#94A3B8', border: '#E2E8F0' },
  'baixo': { label: 'Baixo', bg: '#EFF6FF', text: '#3B82F6', border: '#BFDBFE' },
  'medio': { label: 'Médio', bg: '#FFFBEB', text: '#F59E0B', border: '#FDE68A' },
  'alto':  { label: 'Alto',  bg: '#FEF2F2', text: '#EF4444', border: '#FECACA' },
} as const

function formatarTelefone(valor: string): string {
  const nums = valor.replace(/\D/g, '').slice(0, 11)
  if (!nums) return ''
  if (nums.length <= 2) return `(${nums}`
  if (nums.length <= 6) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`
  if (nums.length <= 10) return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`
}

export function NovaOficinaModal() {
  const router = useRouter()
  const [aberto, setAberto] = useState(false)
  const [erro, setErro] = useState('')
  const [isPending, startTransition] = useTransition()

  const [form, setForm] = useState({
    nome: '', bairro: '', cidade: '', contato: '', responsavel: '', obs: '',
    estagio: 'prospectando' as Estagio,
    instagram: '',
    nivel_interesse: '' as string,
    proxima_acao_tipo: 'ligar' as TipoAcao,
    proxima_acao_data: '',
    proxima_acao_obs: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleContatoChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, contato: formatarTelefone(e.target.value) }))
  }

  function handleFechar() {
    setAberto(false)
    setErro('')
    setForm({
      nome: '', bairro: '', cidade: '', contato: '', responsavel: '', obs: '',
      estagio: 'prospectando',
      instagram: '',
      nivel_interesse: '',
      proxima_acao_tipo: 'ligar',
      proxima_acao_data: '',
      proxima_acao_obs: '',
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    startTransition(async () => {
      const { error } = await criarOficina({
        nome: form.nome,
        bairro: form.bairro || null,
        cidade: form.cidade || null,
        contato: form.contato || null,
        responsavel: form.responsavel || null,
        obs: form.obs || null,
        estagio: form.estagio,
        instagram: form.instagram || null,
        nivel_interesse: (form.nivel_interesse as NivelInteresse) || null,
        ultimo_contato_em: null,
        proxima_acao_tipo: form.proxima_acao_tipo,
        proxima_acao_data: form.proxima_acao_data || null,
        proxima_acao_obs: form.proxima_acao_obs || null,
        criado_por: null,
        atualizado_por: null,
      })

      if (error) {
        setErro(error)
      } else {
        handleFechar()
        router.refresh()
      }
    })
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-xl text-sm text-[#0F172A] placeholder-[#CBD5E1] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#00C977]/40 focus:border-[#00C977]'
  const inputStyle = { background: '#ffffff', border: '1px solid #E2E8F0' }
  const labelCls = 'block text-[10px] font-semibold uppercase tracking-widest mb-1.5'
  const labelStyle = { color: '#64748B' }

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="flex items-center gap-2 px-5 py-2.5 text-[#07111F] text-sm font-semibold rounded-xl transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, #00C977 0%, #00A060 100%)', boxShadow: '0 2px 10px rgba(0,201,119,0.35)' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Nova oficina
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(7,17,31,0.6)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="w-full max-w-lg max-h-[92vh] overflow-y-auto scrollbar-thin rounded-2xl"
            style={{
              background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.15)',
            }}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-5 flex items-start justify-between" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div>
                <h2 className="text-xl font-bold" style={{ color: '#0F172A' }}>Nova oficina</h2>
                <p className="text-sm mt-0.5" style={{ color: '#94A3B8' }}>Adicione um novo lead e defina a próxima ação</p>
              </div>
              <button
                type="button"
                onClick={handleFechar}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150 hover:bg-gray-100"
                style={{ color: '#94A3B8' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
              {/* Nome */}
              <div>
                <label className={labelCls} style={labelStyle}>Nome *</label>
                <input
                  name="nome" value={form.nome} onChange={handleChange} required
                  placeholder="Ex: Auto Center Pinheiros"
                  className={inputCls} style={inputStyle}
                />
              </div>

              {/* Bairro / Cidade */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls} style={labelStyle}>Bairro</label>
                  <input name="bairro" value={form.bairro} onChange={handleChange} placeholder="Pinheiros"
                    className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Cidade</label>
                  <input name="cidade" value={form.cidade} onChange={handleChange} placeholder="São Paulo"
                    className={inputCls} style={inputStyle} />
                </div>
              </div>

              {/* Contato / Instagram */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls} style={labelStyle}>WhatsApp</label>
                  <input name="contato" value={form.contato} onChange={handleContatoChange} placeholder="(11) 99999-9999"
                    className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Instagram</label>
                  <input name="instagram" value={form.instagram} onChange={handleChange} placeholder="@oficina"
                    className={inputCls} style={inputStyle} />
                </div>
              </div>

              {/* Responsável */}
              <div>
                <label className={labelCls} style={labelStyle}>Responsável</label>
                <input name="responsavel" value={form.responsavel} onChange={handleChange} placeholder="Nome do dono/contato"
                  className={inputCls} style={inputStyle} />
              </div>

              {/* Nível de interesse — segmented buttons */}
              <div>
                <label className={labelCls} style={labelStyle}>Nível de interesse</label>
                <div className="flex gap-2">
                  {(['', 'baixo', 'medio', 'alto'] as const).map((nivel) => {
                    const cfg = NIVEL_CONFIG[nivel]
                    const ativo = form.nivel_interesse === nivel
                    return (
                      <button
                        key={nivel}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, nivel_interesse: nivel }))}
                        className="flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-150"
                        style={{
                          background: ativo ? cfg.bg : '#F8FAFC',
                          color: ativo ? cfg.text : '#94A3B8',
                          border: ativo ? `1px solid ${cfg.border}` : '1px solid #E2E8F0',
                          boxShadow: ativo ? `0 2px 8px ${cfg.border}` : 'none',
                        }}
                      >
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Estágio — pills */}
              <div>
                <label className={labelCls} style={labelStyle}>Estágio</label>
                <div className="flex flex-wrap gap-1.5">
                  {ESTAGIOS.map(({ valor, label, cor }) => {
                    const ativo = form.estagio === valor
                    return (
                      <button
                        key={valor}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, estagio: valor }))}
                        className="px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-150"
                        style={{
                          background: ativo ? cor : '#F1F5F9',
                          color: ativo ? '#ffffff' : '#64748B',
                          border: ativo ? `1px solid ${cor}` : '1px solid #E2E8F0',
                          boxShadow: ativo ? `0 2px 8px ${cor}50` : 'none',
                        }}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className={labelCls} style={labelStyle}>Observações</label>
                <textarea name="obs" value={form.obs} onChange={handleChange}
                  placeholder="Notas sobre a oficina..." rows={2}
                  className={`${inputCls} resize-none`} style={inputStyle} />
              </div>

              {/* Próxima Ação — seção distinta */}
              <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: '#F0FDF8', border: '1px solid rgba(0,201,119,0.2)' }}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0"
                    style={{ background: 'rgba(0,201,119,0.15)', border: '1px solid rgba(0,201,119,0.3)' }}
                  >
                    ⚡
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#00A060' }}>Próxima Ação</p>
                    <p className="text-[10px]" style={{ color: '#64748B' }}>Obrigatório para criar o lead</p>
                  </div>
                </div>

                {/* Tipo — grid de botões */}
                <div>
                  <label className={labelCls} style={labelStyle}>Tipo *</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {TIPOS_ACAO.map(({ valor, label, emoji }) => {
                      const ativo = form.proxima_acao_tipo === valor
                      return (
                        <button
                          key={valor}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, proxima_acao_tipo: valor }))}
                          className="py-2 text-xs font-semibold rounded-xl transition-all duration-150 flex flex-col items-center gap-0.5"
                          style={{
                            background: ativo ? 'rgba(0,201,119,0.12)' : '#ffffff',
                            color: ativo ? '#00A060' : '#64748B',
                            border: ativo ? '1px solid rgba(0,201,119,0.4)' : '1px solid #E2E8F0',
                            boxShadow: ativo ? '0 2px 8px rgba(0,201,119,0.15)' : 'none',
                          }}
                        >
                          <span>{emoji}</span>
                          <span>{label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Data */}
                <div>
                  <label className={labelCls} style={labelStyle}>Data *</label>
                  <input
                    type="date"
                    name="proxima_acao_data"
                    value={form.proxima_acao_data}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>

                {/* Observação */}
                <div>
                  <label className={labelCls} style={labelStyle}>Observação</label>
                  <input
                    name="proxima_acao_obs"
                    value={form.proxima_acao_obs}
                    onChange={handleChange}
                    placeholder="Ex: perguntar sobre interesse em delivery"
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
              </div>

              {erro && (
                <p className="text-sm text-center py-2 px-3 rounded-xl" style={{ color: '#EF4444', background: '#FEF2F2', border: '1px solid #FECACA' }}>
                  {erro}
                </p>
              )}

              {/* Botões */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleFechar}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-150 hover:bg-gray-50"
                  style={{ color: '#64748B', border: '1px solid #E2E8F0', background: '#ffffff' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 text-sm font-bold text-white rounded-xl transition-all duration-150 disabled:opacity-50 hover:opacity-90 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #00C977 0%, #00A060 100%)', boxShadow: '0 4px 14px rgba(0,201,119,0.4)' }}
                >
                  {isPending ? 'Salvando...' : 'Adicionar oficina'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
