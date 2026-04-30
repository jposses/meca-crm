'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// Hook que escuta mudanças em tempo real na tabela oficinas via Supabase Realtime.
// Chama onUpdate sempre que houver inserção, atualização ou exclusão,
// permitindo que o componente pai recarregue os dados automaticamente.
export function useRealtime(onUpdate: () => void): void {
  useEffect(() => {
    const supabase = createClient()

    const canal = supabase
      .channel('oficinas-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'oficinas' },
        () => {
          onUpdate()
        }
      )
      .subscribe()

    // Cleanup: remove o canal ao desmontar o componente para evitar memory leak
    return () => {
      supabase.removeChannel(canal)
    }
  }, [onUpdate])
}
