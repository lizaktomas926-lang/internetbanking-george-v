import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, CreditCard, Send, PlusCircle } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/')({
  component: PrehladPage,
})

function PrehladPage() {
  const navigate = useNavigate()

  // 1. Načítanie reálneho zostatku používateľa zo Supabase cloudu
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile-balance'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('profiles')
        .select('balance, account_number')
        .eq('id', user.id)
        .single()

      if (error) throw error
      return data
    },
  })

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      {/* Hlavička */}
      <div>
        <h1 className="text-2xl font-bold">Prehľad účtu</h1>
        <p className="text-muted-foreground text-sm">Vítajte v George bankingu</p>
      </div>

      {/* 2. Karta Účtu - Preklik na históriu transakcií */}
      <Card 
        onClick={() => navigate({ to: '/karty' })}
        className="p-6 bg-card hover:bg-accent/50 cursor-pointer transition-all shadow-md border border-border"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Osobný účet</h2>
              <p className="text-xs text-muted-foreground">
                {profile?.account_number || 'SK83 0900 0000 0012 3456 7890'}
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Reálny zostatok z cloudu */}
        <div className="mt-4">
          <p className="text-xs text-muted-foreground">Dostupný zostatok</p>
          <p className="text-3xl font-extrabold text-primary">
            {isLoading ? 'Načítavam...' : `${profile?.balance ?? '0.00'} €`}
          </p>
        </div>

        <div className="mt-4 text-xs font-medium text-primary flex items-center gap-1">
          Kliknutím zobrazíte históriu platieb a detail
        </div>
      </Card>

      {/* Rýchle akcie */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={() => navigate({ to: '/platby' })}
          className="flex items-center gap-2 py-6"
          variant="outline"
        >
          <Send className="h-4 w-4" />
          Nová platba
        </Button>
        <Button 
          onClick={() => navigate({ to: '/karty' })}
          className="flex items-center gap-2 py-6"
          variant="outline"
        >
          <PlusCircle className="h-4 w-4" />
          História transakcií
        </Button>
      </div>
    </div>
  )
}
