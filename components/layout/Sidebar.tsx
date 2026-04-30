'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  nomeExibido: string
  inicial: string
  role: string
}

function SvgIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-[17px] h-[17px] shrink-0"
    >
      {children}
    </svg>
  )
}

function IconDashboard() {
  return (
    <SvgIcon>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </SvgIcon>
  )
}

function IconFunil() {
  return (
    <SvgIcon>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </SvgIcon>
  )
}

function IconOficinas() {
  return (
    <SvgIcon>
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </SvgIcon>
  )
}

function IconTarefas() {
  return (
    <SvgIcon>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </SvgIcon>
  )
}

function IconAgenda() {
  return (
    <SvgIcon>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </SvgIcon>
  )
}

function IconRelatorios() {
  return (
    <SvgIcon>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </SvgIcon>
  )
}

function IconConfig() {
  return (
    <SvgIcon>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </SvgIcon>
  )
}

function IconLogout() {
  return (
    <SvgIcon>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </SvgIcon>
  )
}

const NAV_ITEMS = [
  { href: '/dashboard',  label: 'Dashboard',          Icon: IconDashboard,  exact: true,  soon: false },
  { href: '/funil',      label: 'Funil de Prospecção', Icon: IconFunil,      exact: false, soon: false },
  { href: '/oficinas',   label: 'Oficinas',            Icon: IconOficinas,   exact: false, soon: true  },
  { href: '/tarefas',    label: 'Tarefas',             Icon: IconTarefas,    exact: false, soon: true  },
  { href: '/agenda',     label: 'Agenda',              Icon: IconAgenda,     exact: false, soon: true  },
  { href: '/relatorios', label: 'Relatórios',          Icon: IconRelatorios, exact: false, soon: true  },
  { href: '/config',     label: 'Configurações',       Icon: IconConfig,     exact: false, soon: true  },
]

function isActive(pathname: string, href: string, exact: boolean): boolean {
  if (exact) return pathname === href
  return pathname.startsWith(href)
}

export function Sidebar({ nomeExibido, inicial, role }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className="w-[240px] flex flex-col flex-shrink-0 overflow-hidden"
      style={{
        background: 'linear-gradient(170deg, #0E1C30 0%, #07111F 55%, #060E1A 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Logo */}
      <div className="px-5 pt-7 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-1.5">
          <Image
            src="/logo-meca.svg"
            alt="Meca"
            width={124}
            height={30}
            style={{ display: 'block', flexShrink: 0 }}
          />
          <span className="font-bold text-[11px] tracking-tight leading-none" style={{ color: '#00C977' }}>
            CRM
          </span>
        </div>
        <p className="mt-3 text-[11px] font-medium" style={{ color: '#4A6580' }}>
          Prospecção de oficinas
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map(({ href, label, Icon, exact, soon }) => {
          const ativo = !soon && isActive(pathname, href, exact)
          return (
            <Link
              key={href}
              href={soon ? '#' : href}
              onClick={soon ? (e) => e.preventDefault() : undefined}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 select-none ${
                ativo
                  ? ''
                  : soon
                    ? 'cursor-default'
                    : 'hover:bg-white/[0.05]'
              }`}
              style={{
                color: ativo ? '#00C977' : soon ? '#1D3350' : '#6B8299',
                background: ativo
                  ? 'linear-gradient(135deg, rgba(0,201,119,0.16) 0%, rgba(0,201,119,0.07) 100%)'
                  : undefined,
                boxShadow: ativo
                  ? 'inset 0 0 0 1px rgba(0,201,119,0.22), 0 2px 10px rgba(0,201,119,0.1)'
                  : undefined,
              }}
            >
              <span
                className="transition-colors duration-150"
                style={{ color: ativo ? '#00C977' : soon ? '#1D3350' : '#3E5A74' }}
              >
                <Icon />
              </span>
              <span className="flex-1 truncate">{label}</span>
              {soon && (
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-md shrink-0"
                  style={{
                    color: '#1D3350',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  breve
                </span>
              )}
              {ativo && (
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: '#00C977', boxShadow: '0 0 6px rgba(0,201,119,0.7)' }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User area */}
      <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 px-1 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#07111F] text-xs font-black shrink-0"
            style={{ background: 'linear-gradient(135deg, #00C977 0%, #00A060 100%)' }}
          >
            {inicial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold truncate" style={{ color: '#C2D4E8' }}>{nomeExibido}</p>
            <p className="text-[11px] truncate capitalize" style={{ color: '#2A3D52' }}>{role}</p>
          </div>
        </div>
        <form action="/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 text-xs py-1.5 rounded-lg transition-all duration-150"
            style={{ color: '#2A3D52' }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.color = '#6B8299'
              ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.color = '#2A3D52'
              ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
            }}
          >
            <IconLogout />
            Sair da conta
          </button>
        </form>
      </div>
    </aside>
  )
}
