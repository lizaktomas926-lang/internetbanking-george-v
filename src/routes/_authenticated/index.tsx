import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const Overview = () => {
  const [account, setAccount] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      // 1. Načítanie zostatku na účte
      const { data: accData, error: accError } = await supabase
        .from('accounts')
        .select('*')
        .single();

      if (accError) console.error('Chyba účtu:', accError.message);
      else setAccount(accData);

      // 2. Načítanie posledných transakcií z cloudu
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (txError) console.error('Chyba transakcií:', txError.message);
      else setTransactions(txData || []);

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-4">Načítavam Prehľad z cloudu...</div>;

  return (
    <div className="space-y-6 p-4">
      {/* Karta zostatku */}
      <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
        <span className="text-sm text-gray-500">Hlavný účet (IBAN)</span>
        <div className="text-xs text-gray-400 mb-2">{account?.iban || 'SK88 0900 0000 0012 3456 7890'}</div>
        <div className="text-3xl font-extrabold text-gray-900">
          {account?.balance !== undefined ? `${account.balance.toFixed(2)} €` : '0.00 €'}
        </div>
      </div>

      {/* Nedávne transakcie */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-lg mb-4">Posledné pohyby</h3>
        <div className="divide-y divide-gray-100">
          {transactions.map((tx) => (
            <div key={tx.id} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">{tx.title || tx.category || 'Platba'}</p>
                <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`font-bold ${tx.amount < 0 ? 'text-red-500' : 'text-green-600'}`}>
                {tx.amount > 0 ? `+${tx.amount.toFixed(2)}` : `${tx.amount.toFixed(2)}`} €
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
