'use client'

import { useState } from 'react'
import type { Oficina, TipoAcao, NivelInteresse } from '@/lib/types'

interface OficinaFormProps {
  oficina: Oficina
  onSalvar: (dados: Partial<Oficina>) => void
  onCancelar: () => void
}

const TIPOS_ACAO: Array<{ valor: TipoAcao; label: string }> = [
  { valor: 'ligar',     label: '📞 Ligar' },
  { valor: 'whatsapp',  label: '💬 WhatsApp' },
  { valor: 'reuniao',   label: '🤝 Reunião' },
  { valor: 'follow_up', label: '🔄 Follow-up' },
  { valor: 'proposta',  label: '📄 Proposta' },
  { valor: 'outro',     label: '✅ Outro' },
]

export function OficinaForm({ oficina, onSalvar, onCancelar }: OficinaFormProps) {
  const [nome, setNome] = useState(oficina.nome)
  const [bairro, setBairro] = useState(oficina.bairro ?? '')
  const [cidade, setCidade] = useState(oficina.cidade ?? '')
  const [contato, setContato] = useState(oficina.contato ?? '')
  const [responsavel, setResponsavel] = useState(oficina.responsavel ?? '')
  const [obs, setObs] = useState(oficina.obs ?? '')
  const [instagram, setInstagram] = useState(oficina.instagram ?? '')
  const [nivelInteresse, setNivelInteresse] = useState<NivelInteresse | ''>(oficina.nivel_interesse ?? '')
  const [acaoTipo, setAcaoTipo] = useState<TipoAcao>(oficina.proxima_acao_tipo ?? 'ligar')
  const [acaoData, setAcaoData] = useState(oficina.proxima_acao_data ?? '')
  const [acaoObs, setAcaoObs] = useState(oficina.proxima_acao_obs ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSalvar({
      nome,
      bairro: bairro || null,
      cidade: cidade || null,
      contato: contato || null,
      responsavel: responsavel || null,
      obs: obs || null,
      instagram: instagram || null,
      nivel_interesse: nivelInteresse || null,
      proxima_acao_tipo: acaoTipo,
      proxima_acao_data: acaoData || null,
      proxima_acao_obs: acaoObs || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">Nome *</label>
        <input required value={nome} onChange={(e) => setNome(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">Bairro</label>
          <input value={bairro} onChange={(e) => setBairro(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
        </div>
        <div>
          <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">Cidade</label>
          <input value={cidade} onChange={(e) => setCidade(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">Contato (WhatsApp)</label>
          <input value={contato} onChange={(e) => setContato(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
        </div>
        <div>
          <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">Instagram</label>
          <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@oficina"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">Nível de interesse</label>
        <select value={nivelInteresse} onChange={(e) => setNivelInteresse(e.target.value as NivelInteresse | '')}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
          <option value="">Não definido</option>
          <option value="alto">🔴 Alto</option>
          <option value="medio">🟡 Médio</option>
          <option value="baixo">🔵 Baixo</option>
        </select>
      </div>

      <div>
        <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">Responsável</label>
        <input value={responsavel} onChange={(e) => setResponsavel(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
      </div>

      <div>
        <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">Observações</label>
        <textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={2}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none" />
      </div>

      {/* Próxima ação */}
      <div className="pt-2 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Próxima Ação</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">Tipo</label>
            <select value={acaoTipo} onChange={(e) => setAcaoTipo(e.target.value as TipoAcao)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
              {TIPOS_ACAO.map(t => <option key={t.valor} value={t.valor}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">Data</label>
            <input type="date" value={acaoData} onChange={(e) => setAcaoData(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
          </div>
        </div>
        <div className="mt-2">
          <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">Observação</label>
          <input value={acaoObs} onChange={(e) => setAcaoObs(e.target.value)}
            placeholder="Detalhes da ação..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Salvar
        </button>
        <button type="button" onClick={onCancelar}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  )
}
