'use client'

import type { Estagio } from '@/lib/types'

interface EstagioSelectorProps {
  estagioAtual: Estagio
  onChange: (novoEstagio: Estagio) => void
  podeEditar: boolean
}

const ESTAGIOS: Array<{
  valor: Estagio
  label: string
  accent: string
  activeBg: string
  activeShadow: string
  inactiveBg: string
  inactiveText: string
  inactiveBorder: string
}> = [
  {
    valor: 'prospectando',
    label: 'Prospectando',
    accent: '#6366F1',
    activeBg: 'linear-gradient(135deg, #6366F1, #4F46E5)',
    activeShadow: '0 3px 10px rgba(99,102,241,0.45)',
    inactiveBg: '#F5F3FF',
    inactiveText: '#6366F1',
    inactiveBorder: '#C7D2FE',
  },
  {
    valor: 'contato',
    label: 'Contato',
    accent: '#3B82F6',
    activeBg: 'linear-gradient(135deg, #3B82F6, #2563EB)',
    activeShadow: '0 3px 10px rgba(59,130,246,0.45)',
    inactiveBg: '#EFF6FF',
    inactiveText: '#3B82F6',
    inactiveBorder: '#BFDBFE',
  },
  {
    valor: 'negociando',
    label: 'Negociando',
    accent: '#F97316',
    activeBg: 'linear-gradient(135deg, #F97316, #EA580C)',
    activeShadow: '0 3px 10px rgba(249,115,22,0.45)',
    inactiveBg: '#FFF7ED',
    inactiveText: '#F97316',
    inactiveBorder: '#FED7AA',
  },
  {
    valor: 'aguardando_cadastro',
    label: 'Aguard. cadastro',
    accent: '#14B8A6',
    activeBg: 'linear-gradient(135deg, #14B8A6, #0D9488)',
    activeShadow: '0 3px 10px rgba(20,184,166,0.45)',
    inactiveBg: '#F0FDFA',
    inactiveText: '#14B8A6',
    inactiveBorder: '#99F6E4',
  },
  {
    valor: 'cadastrado',
    label: 'Cadastrado ✓',
    accent: '#00C977',
    activeBg: 'linear-gradient(135deg, #00C977, #00A060)',
    activeShadow: '0 3px 10px rgba(0,201,119,0.45)',
    inactiveBg: '#F0FDF9',
    inactiveText: '#00A060',
    inactiveBorder: '#6EE7C4',
  },
  {
    valor: 'perdido',
    label: 'Perdido',
    accent: '#F43F5E',
    activeBg: 'linear-gradient(135deg, #F43F5E, #E11D48)',
    activeShadow: '0 3px 10px rgba(244,63,94,0.45)',
    inactiveBg: '#FFF1F2',
    inactiveText: '#F43F5E',
    inactiveBorder: '#FECDD3',
  },
]

export function EstagioSelector({ estagioAtual, onChange, podeEditar }: EstagioSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ESTAGIOS.map((estagio) => {
        const ativo = estagioAtual === estagio.valor
        return (
          <button
            key={estagio.valor}
            onClick={() => podeEditar && onChange(estagio.valor)}
            disabled={!podeEditar}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
              !podeEditar ? 'cursor-not-allowed' : ativo ? 'cursor-default' : 'cursor-pointer'
            }`}
            style={
              ativo
                ? {
                    background: estagio.activeBg,
                    color: '#ffffff',
                    border: 'none',
                    boxShadow: estagio.activeShadow,
                    opacity: 1,
                  }
                : {
                    background: estagio.inactiveBg,
                    color: estagio.inactiveText,
                    borderColor: estagio.inactiveBorder,
                    opacity: podeEditar ? 0.6 : 0.45,
                  }
            }
          >
            {estagio.label}
          </button>
        )
      })}
    </div>
  )
}
