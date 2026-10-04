import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client'; // prípadne cesty podľa vášho projektu

export const CardsTab = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      // Načítanie kariet zo Supabase tabuľky "cards"
      const { data, error } = await supabase
        .from('cards')
        .select('*');

      if (error) {
        console.error('Chyba pri načítaní kariet:', error.message);
      } else {
        setCards(data || []);
      }
      setLoading(false);
    };

    fetchCards();
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Načítavam karty z cloudu...</div>;
  }

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold">Moje Platebné Karty</h2>
      {cards.length === 0 ? (
        <p className="text-gray-500">Žiadne aktívne karty neboli nájdené.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card) => (
            <div key={card.id} className="p-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <span className="font-semibold">{card.card_type || 'Debetná karta'}</span>
                <span className="text-sm opacity-80">{card.status || 'Aktívna'}</span>
              </div>
              <div className="text-lg tracking-widest mb-4">
                •••• •••• •••• {card.last_four || '1234'}
              </div>
              <div className="flex justify-between text-xs opacity-75">
                <span>Platnosť: {card.expiry || '12/28'}</span>
                <span>{card.holder_name || 'Tomáš Lizák'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
