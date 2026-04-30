import type { ReactNode } from 'react'
import Link from 'next/link'
import { NovaOficinaModal } from '@/components/oficina/NovaOficinaModal'
import { getMetricasFunil } from '@/lib/queries/metricas'
import { getOficinasCriadas7Dias, getLeadsParados } from '@/lib/queries/oficinas'
import { getTarefasPendentes } from '@/lib/queries/tarefas'
import type { TarefaComOficina } from '@/lib/queries/tarefas'
import { getDesempenhoPorResponsavel } from '@/lib/queries/desempenho'
import type { Estagio, Oficina } from '@/lib/types'

// ─── Design tokens por estágio ────────────────────────────────────────────────

interface EstagioMeta {
  label: string
  accent: string
  accentLight: string
  bg: string
  icon: ReactNode
}

const STAGE_META: Record<Estagio, EstagioMeta> = {
  prospectando: {
    label: 'Prospectando',
    accent: '#6366F1',
    accentLight: '#818CF8',
    bg: 'rgba(99,102,241,0.09)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  contato: {
    label: 'Contato',
    accent: '#3B82F6',
    accentLight: '#60A5FA',
    bg: 'rgba(59,130,246,0.09)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.87-.87a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
  negociando: {
    label: 'Negociando',
    accent: '#F97316',
    accentLight: '#FB923C',
    bg: 'rgba(249,115,22,0.09)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
  aguardando_cadastro: {
    label: 'Aguard. cadastro',
    accent: '#14B8A6',
    accentLight: '#2DD4BF',
    bg: 'rgba(20,184,166,0.09)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  cadastrado: {
    label: 'Cadastrado',
    accent: '#00C977',
    accentLight: '#34EEA0',
    bg: 'rgba(0,201,119,0.09)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  perdido: {
    label: 'Perdido',
    accent: '#F43F5E',
    accentLight: '#FB7185',
    bg: 'rgba(244,63,94,0.09)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
}

const ESTAGIOS_ORDEM: Estagio[] = [
  'prospectando', 'contato', 'negociando', 'aguardando_cadastro', 'cadastrado', 'perdido',
]

const AVATAR_GRADIENTS = [
  { bg: 'linear-gradient(135deg,#6366F1,#4F46E5)', text: '#fff' },
  { bg: 'linear-gradient(135deg,#3B82F6,#2563EB)', text: '#fff' },
  { bg: 'linear-gradient(135deg,#00C977,#00A060)', text: '#07111F' },
  { bg: 'linear-gradient(135deg,#F97316,#EA580C)', text: '#fff' },
  { bg: 'linear-gradient(135deg,#14B8A6,#0D9488)', text: '#fff' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function diasAtras(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (diff === 0) return 'hoje'
  if (diff === 1) return 'ontem'
  return `${diff}d atrás`
}

function diasNaEtapa(iso: string | null | undefined): number {
  if (!iso) return 0
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
}

function statusTarefa(prazo: string | null | undefined): 'atrasada' | 'hoje' | 'breve' | null {
  if (!prazo) return null
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const data = new Date(prazo + 'T00:00:00')
  if (data < hoje) return 'atrasada'
  if (data.getTime() === hoje.getTime()) return 'hoje'
  return 'breve'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const [metricas, recentes, tarefasPendentes, leadsParados, desempenho] = await Promise.all([
    getMetricasFunil(),
    getOficinasCriadas7Dias(),
    getTarefasPendentes(),
    getLeadsParados(),
    getDesempenhoPorResponsavel(),
  ])

  const total = Object.values(metricas.porEstagio).reduce((a, b) => a + b, 0)
  const maxFunil = Math.max(
    ...ESTAGIOS_ORDEM.filter(e => e !== 'perdido').map(e => metricas.porEstagio[e]),
    1,
  )

  return (
    <div className="p-8 min-h-full">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: '#0F172A' }}>
            Dashboard
          </h1>
          <p className="text-sm" style={{ color: '#64748B' }}>
            Visão geral do funil de prospecção
          </p>
        </div>
        <NovaOficinaModal />
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-6 gap-4 mb-8">
        {ESTAGIOS_ORDEM.map((estagio) => {
          const meta = STAGE_META[estagio]
          const count = metricas.porEstagio[estagio]
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          return (
            <div
              key={estagio}
              className="rounded-2xl p-5 flex flex-col gap-4 card-lift"
              style={{
                background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)',
                border: '1px solid rgba(0,0,0,0.06)',
                borderTop: `3px solid ${meta.accent}`,
                boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.05)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: meta.bg, color: meta.accent }}
              >
                {meta.icon}
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#94A3B8' }}>
                  {meta.label}
                </p>
                <p className="text-4xl font-bold leading-none mb-1" style={{ color: '#0F172A' }}>
                  {count}
                </p>
                <p className="text-xs" style={{ color: '#94A3B8' }}>{pct}% do total</p>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                <div
                  className="h-full rounded-full bar-animate"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${meta.accentLight} 0%, ${meta.accent} 100%)`,
                    boxShadow: `0 0 6px ${meta.accent}55`,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Alerta: leads parados ─────────────────────────────────────────── */}
      {leadsParados.length > 0 && (
        <div
          className="mb-6 rounded-2xl p-4 border border-[#FECDD3]"
          style={{ background: '#FFF7F7' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-rose-700">
              Leads parados há mais de 7 dias
            </span>
            <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {leadsParados.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {leadsParados.map((o: Oficina) => {
              const meta = STAGE_META[o.estagio]
              return (
                <Link
                  key={o.id}
                  href={`/oficinas/${o.id}`}
                  className="flex items-center gap-1.5 text-xs bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <span className="font-medium">{o.nome}</span>
                  <span className="text-rose-400">· {diasNaEtapa(o.estagio_entrou_em)}d em {meta.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Grid principal ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-6 mb-6">

        {/* ── Coluna esquerda: Funil hero ─────────────────────────────────── */}
        <div className="col-span-2">
          <div
            className="rounded-2xl p-6 h-full flex flex-col"
            style={{
              background: 'linear-gradient(160deg, #0f172a 0%, #080f1e 55%, #020617 100%)',
              boxShadow: '0 8px 48px rgba(2,6,23,0.55)',
            }}
          >
            {/* Card header */}
            <div className="flex items-center justify-between mb-7">
              <div>
                <h2 className="text-[15px] font-semibold text-white">Funil de Conversão</h2>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Pipeline completo
                </p>
              </div>
              <span
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(0,201,119,0.12)', color: '#00C977', border: '1px solid rgba(0,201,119,0.2)' }}
              >
                {total} leads
              </span>
            </div>

            {/* Bars */}
            <div className="flex flex-col gap-5 flex-1">
              {ESTAGIOS_ORDEM.filter(e => e !== 'perdido').map(estagio => {
                const meta = STAGE_META[estagio]
                const count = metricas.porEstagio[estagio]
                const barPct = maxFunil > 0 ? Math.round((count / maxFunil) * 100) : 0
                const totalPct = total > 0 ? Math.round((count / total) * 100) : 0
                const transicao = metricas.percentuaisTransicao.find(p => p.de === estagio)
                return (
                  <div key={estagio}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span style={{ color: meta.accent }}>{meta.icon}</span>
                        <span className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.68)' }}>
                          {meta.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-white">{count}</span>
                        <span
                          className="text-[10px] w-8 text-right font-medium"
                          style={{ color: 'rgba(255,255,255,0.3)' }}
                        >
                          {totalPct}%
                        </span>
                      </div>
                    </div>
                    {/* Bar track */}
                    <div className="h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div
                        className="h-full rounded-full bar-animate"
                        style={{
                          width: `${barPct}%`,
                          background: `linear-gradient(90deg,${meta.accentLight} 0%,${meta.accent} 100%)`,
                          boxShadow: `0 0 12px ${meta.accent}65`,
                        }}
                      />
                    </div>
                    {transicao && (
                      <p className="text-[10px] mt-1 text-right" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {transicao.percentual}% avançam
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Footer stats */}
            <div
              className="mt-7 pt-5 grid grid-cols-2 gap-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-widest mb-1.5"
                  style={{ color: 'rgba(255,255,255,0.28)' }}
                >
                  Conversão geral
                </p>
                <p className="text-3xl font-bold" style={{ color: '#00C977' }}>
                  {metricas.taxaConversao}%
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.22)' }}>
                  prosp. → cadastrado
                </p>
              </div>
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-widest mb-1.5"
                  style={{ color: 'rgba(255,255,255,0.28)' }}
                >
                  Aguard. → Cadastrado
                </p>
                <p className="text-3xl font-bold" style={{ color: '#14B8A6' }}>
                  {metricas.taxaConversaoCadastro}%
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.22)' }}>
                  taxa de ativação
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Coluna direita: Atividades + Tarefas ───────────────────────── */}
        <div className="col-span-3 flex flex-col gap-6">

          {/* Atividades recentes — timeline */}
          <div
            className="rounded-2xl p-6 h-[340px] flex flex-col"
            style={{
              background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)',
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[15px] font-semibold" style={{ color: '#0F172A' }}>
                  Atividades recentes
                </h2>
                <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                  Últimas oficinas adicionadas
                </p>
              </div>
              <span
                className="text-[11px] font-medium px-2.5 py-1 rounded-full border"
                style={{ color: '#94A3B8', background: '#F8FAFC', borderColor: '#E5EAF2' }}
              >
                7 dias · {recentes.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 scrollbar-thin">
            {recentes.length === 0 ? (
              <div className="text-center py-10">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
                  style={{ background: '#F8FAFC' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth={1.5} className="w-5 h-5">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                  </svg>
                </div>
                <p className="text-sm" style={{ color: '#94A3B8' }}>Nenhuma oficina adicionada esta semana</p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div
                  className="absolute left-4 top-4 bottom-4 w-px"
                  style={{ background: 'linear-gradient(to bottom,#E5EAF2,transparent)' }}
                />
                <div className="flex flex-col">
                  {recentes.slice(0, 6).map((o: Oficina) => {
                    const meta = STAGE_META[o.estagio]
                    return (
                      <Link
                        key={o.id}
                        href={`/oficinas/${o.id}`}
                        className="flex items-start gap-3 py-3 -mx-2 px-2 rounded-xl hover:bg-[#EEF2F7] transition-colors duration-150 group"
                      >
                        {/* Avatar (atua como ponto da timeline) */}
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 text-xs font-bold border-2 border-white"
                          style={{ background: meta.bg, color: meta.accent }}
                        >
                          {o.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="text-[13px] font-semibold truncate" style={{ color: '#0F172A' }}>
                            {o.nome}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                              style={{ background: meta.bg, color: meta.accent }}
                            >
                              {meta.label}
                            </span>
                            {(o.bairro || o.cidade) && (
                              <span className="text-xs truncate" style={{ color: '#94A3B8' }}>
                                {[o.bairro, o.cidade].filter(Boolean).join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          className="text-[11px] shrink-0 pt-0.5 group-hover:opacity-100 opacity-60 transition-opacity"
                          style={{ color: '#94A3B8' }}
                        >
                          {diasAtras(o.criado_em)}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {recentes.length > 6 && (
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid #F1F5F9' }}>
                <Link href="/funil" className="text-xs font-semibold" style={{ color: '#6366F1' }}>
                  Ver todas as {recentes.length} atividades →
                </Link>
              </div>
            )}
            </div>
          </div>

          {/* Tarefas pendentes — colored urgency cards */}
          <div
            className="rounded-2xl p-6 h-[340px] flex flex-col"
            style={{
              background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)',
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[15px] font-semibold" style={{ color: '#0F172A' }}>
                  Tarefas pendentes
                </h2>
                <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                  Ações aguardando conclusão
                </p>
              </div>
              {tarefasPendentes.length > 0 && (
                <span className="text-[11px] font-bold text-white bg-rose-500 px-2.5 py-0.5 rounded-full">
                  {tarefasPendentes.length}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin">
            {tarefasPendentes.length === 0 ? (
              <div className="text-center py-10">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
                  style={{ background: 'rgba(0,201,119,0.1)' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#00C977" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-sm" style={{ color: '#94A3B8' }}>Nenhuma tarefa pendente</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {tarefasPendentes.slice(0, 5).map((t: TarefaComOficina) => {
                  const status = statusTarefa(t.prazo)
                  const theme =
                    status === 'atrasada'
                      ? { bg: '#FFF1F2', stripe: '#F43F5E', badge: '#FEE2E2', badgeText: '#DC2626', label: 'Atrasada', dot: '#F43F5E' }
                      : status === 'hoje'
                        ? { bg: '#FFFBEB', stripe: '#F59E0B', badge: '#FEF3C7', badgeText: '#D97706', label: 'Hoje', dot: '#F59E0B' }
                        : { bg: '#F0F9FF', stripe: '#3B82F6', badge: '#DBEAFE', badgeText: '#2563EB', label: 'Em breve', dot: '#3B82F6' }

                  return (
                    <div
                      key={t.id}
                      className="flex items-start gap-3 p-3.5 rounded-xl relative overflow-hidden"
                      style={{ background: theme.bg }}
                    >
                      {/* Left accent stripe */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                        style={{ background: theme.stripe }}
                      />
                      {/* Checkbox */}
                      <div
                        className="w-4 h-4 rounded border-2 shrink-0 mt-0.5 ml-2"
                        style={{ borderColor: theme.dot }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium leading-snug" style={{ color: '#0F172A' }}>
                          {t.descricao}
                        </p>
                        {t.oficinas && (
                          <Link
                            href={`/oficinas/${t.oficinas.id}`}
                            className="text-xs font-medium mt-0.5 hover:underline"
                            style={{ color: '#6366F1' }}
                          >
                            {t.oficinas.nome}
                          </Link>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {status && (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: theme.badge, color: theme.badgeText }}
                          >
                            {theme.label}
                          </span>
                        )}
                        {t.prazo && (
                          <span className="text-[10px]" style={{ color: '#94A3B8' }}>
                            {new Date(t.prazo + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {tarefasPendentes.length > 5 && (
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid #F1F5F9' }}>
                <Link href="/tarefas" className="text-xs font-semibold" style={{ color: '#6366F1' }}>
                  Ver todas as {tarefasPendentes.length} tarefas →
                </Link>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Desempenho por responsável (full-width) ─────────────────────── */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[15px] font-semibold" style={{ color: '#0F172A' }}>
              Desempenho por responsável
            </h2>
            <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
              Resultados individuais do time de prospecção
            </p>
          </div>
        </div>

        {desempenho.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              Nenhum dado disponível — os leads precisam ter um responsável cadastrado.
            </p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div
              className="grid gap-4 px-4 pb-3 mb-2"
              style={{
                gridTemplateColumns: '2fr 1fr 1fr 2fr',
                borderBottom: '1px solid #F1F5F9',
              }}
            >
              {['Responsável', 'Leads', 'Cadastrados', 'Taxa de conversão'].map(col => (
                <span
                  key={col}
                  className="text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: '#94A3B8' }}
                >
                  {col}
                </span>
              ))}
            </div>

            {/* Table rows */}
            <div className="flex flex-col gap-1">
              {desempenho.map((d, i) => {
                const grad = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]
                return (
                  <div
                    key={d.id}
                    className="grid gap-4 items-center px-4 py-3.5 rounded-xl hover:bg-[#F1F5F9] transition-colors duration-150"
                    style={{ gridTemplateColumns: '2fr 1fr 1fr 2fr' }}
                  >
                    {/* Avatar + nome */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                        style={{ background: grad.bg, color: grad.text }}
                      >
                        {d.inicial}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>{d.nome}</p>
                      </div>
                    </div>

                    {/* Total leads */}
                    <div>
                      <p className="text-2xl font-bold" style={{ color: '#0F172A' }}>{d.total}</p>
                      <p className="text-[10px]" style={{ color: '#94A3B8' }}>leads</p>
                    </div>

                    {/* Cadastrados */}
                    <div>
                      <p className="text-2xl font-bold" style={{ color: '#00C977' }}>{d.cadastrados}</p>
                      <p className="text-[10px]" style={{ color: '#94A3B8' }}>cadastrados</p>
                    </div>

                    {/* Taxa de conversão */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold" style={{ color: '#0F172A' }}>{d.taxa}%</span>
                        <span className="text-[10px]" style={{ color: '#94A3B8' }}>
                          {d.cadastrados} de {d.total}
                        </span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: '#F1F5F9' }}>
                        <div
                          className="h-full rounded-full bar-animate"
                          style={{
                            width: `${d.taxa}%`,
                            background: 'linear-gradient(90deg,#34EEA0 0%,#00C977 100%)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

    </div>
  )
}
