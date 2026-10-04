import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CreditCard } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/karty')({
  component: KartyPage,
})

function KartyPage() {
  const navigate = useNavigate()

  // 1. Načítanie reálneho zostatku zo Supabase cloudu
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

  // 2. Načítanie reálnej histórie transakcií pre daný účet
  const { data: transactions } = useQuery({
    queryKey: ['account-transactions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
  })

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <Button 
        variant="ghost" 
        onClick={() => navigate({ to: '/prehlad' })}
        className="flex items-center gap-2 mb-2"
      >
        <ArrowLeft className="h-4 w-4" /> Späť na Prehľad
      </Button>

      <Card className="p-6 bg-card text-card-foreground shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Detail účtu a karty</h1>
        </div>
        
        <div className="space-y-2 border-b pb-4 mb-4">
          <p className="text-sm text-muted-foreground">Číslo účtu</p>
          <p className="font-mono text-lg">{profile?.account_number || 'SK83 0900 0000 0012 3456 7890'}</p>
          <p className="text-sm text-muted-foreground mt-2">Aktuálny zostatok</p>
          <p className="text-3xl font-bold text-primary">
            {isLoading ? 'Načítavam...' : `${profile?.balance ?? '0.00'} €`}
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">História transakcií</h2>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((tx: any) => (
                <div key={tx.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{tx.title || tx.recipient_name || 'Platba'}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString('sk-SK')}
                    </p>
                  </div>
                  <span className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount} €
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Žiadne nedávne transakcie.</p>
          )}
        </div>
      </Card>
    </div>
  )
}
