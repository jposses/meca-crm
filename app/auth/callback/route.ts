import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Handler do callback de convite — troca o code por sessão e redireciona para definir senha
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Convite: redireciona para definir senha
      if (type === 'invite') {
        return NextResponse.redirect(`${origin}/definir-senha`)
      }
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
