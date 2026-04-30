'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AlterarSenhaModalProps {
  aberto: boolean
  onFechar: () => void
}

export function AlterarSenhaModal({ aberto, onFechar }: AlterarSenhaModalProps) {
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [carregando, setCarregando] = useState(false)

  function handleFechar() {
    setNovaSenha('')
    setConfirmacao('')
    setErro('')
    setSucesso(false)
    onFechar()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (novaSenha.length < 8) {
      setErro('A senha deve ter pelo menos 8 caracteres.')
      return
    }
    if (novaSenha !== confirmacao) {
      setErro('As senhas não coincidem.')
      return
    }

    setCarregando(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: novaSenha })
    setCarregando(false)

    if (error) {
      setErro('Não foi possível alterar a senha. Tente novamente.')
    } else {
      setSucesso(true)
    }
  }

  if (!aberto) return null

  const inputCls = 'w-full px-3 py-2.5 rounded-xl text-sm text-[#0F172A] placeholder-[#CBD5E1] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#00C977]/40 focus:border-[#00C977]'
  const inputStyle = { background: '#ffffff', border: '1px solid #E2E8F0' }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(7,17,31,0.6)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-5 flex items-start justify-between" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#0F172A' }}>Alterar senha</h2>
            <p className="text-sm mt-0.5" style={{ color: '#94A3B8' }}>Defina uma nova senha para sua conta</p>
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

        <div className="px-6 py-5">
          {sucesso ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                style={{ background: 'rgba(0,201,119,0.12)', border: '1px solid rgba(0,201,119,0.3)' }}
              >
                ✓
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>Senha alterada com sucesso</p>
                <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Use a nova senha no próximo acesso.</p>
              </div>
              <button
                onClick={handleFechar}
                className="mt-2 w-full py-2.5 text-sm font-bold text-white rounded-xl transition-all duration-150 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #00C977 0%, #00A060 100%)', boxShadow: '0 4px 14px rgba(0,201,119,0.4)' }}
              >
                Fechar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: '#64748B' }}>
                  Nova senha
                </label>
                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  className={inputCls}
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: '#64748B' }}>
                  Confirmar nova senha
                </label>
                <input
                  type="password"
                  value={confirmacao}
                  onChange={(e) => setConfirmacao(e.target.value)}
                  placeholder="Repita a senha"
                  required
                  className={inputCls}
                  style={inputStyle}
                />
              </div>

              {erro && (
                <p className="text-sm text-center py-2 px-3 rounded-xl" style={{ color: '#EF4444', background: '#FEF2F2', border: '1px solid #FECACA' }}>
                  {erro}
                </p>
              )}

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
                  disabled={carregando}
                  className="flex-1 py-2.5 text-sm font-bold text-white rounded-xl transition-all duration-150 disabled:opacity-50 hover:opacity-90 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #00C977 0%, #00A060 100%)', boxShadow: '0 4px 14px rgba(0,201,119,0.4)' }}
                >
                  {carregando ? 'Salvando...' : 'Alterar senha'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
