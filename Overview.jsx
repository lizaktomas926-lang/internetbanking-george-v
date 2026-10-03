import React from 'react';
import { 
  Search, 
  CreditCard, 
  BarChart2, 
  TrendingUp, 
  LayoutGrid, 
  MessageSquare, 
  Activity, 
  MoreVertical, 
  ShoppingBag 
} from 'lucide-react';

export default function Overview({ onSelectAccount }) {
  return (
    <div className="min-h-screen bg-[#0B0E17] text-white font-sans pb-28 relative max-w-md mx-auto shadow-2xl overflow-hidden selection:bg-blue-500/30">
      
      {/* 1. HLAVIČKA (Prehľad + ikony) */}
      <header className="px-5 pt-8 pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Prehľad</h1>
        
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-all text-slate-300">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-all text-slate-300">
            <CreditCard className="w-5 h-5" />
          </button>
          <div className="relative cursor-pointer p-1">
            <div className="w-8 h-8 rounded-full bg-amber-200 border-2 border-[#0B0E17] overflow-hidden flex items-center justify-center text-xs font-bold text-slate-900">
              🐻
            </div>
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-[#0B0E17]" />
          </div>
        </div>
      </header>

      <main className="px-4 space-y-5">
        
        {/* 2. MESAČNÉ KARTY (Výdavky & Príjmy) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Výdavky */}
          <div className="bg-[#171B26] p-4 rounded-2xl border border-slate-800/80 relative">
            <div className="flex justify-between items-start">
              <span className="text-xs text-slate-400 font-medium leading-tight">Výdavky za október</span>
              <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                <BarChart2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-lg font-bold text-white">0</span>
              <span className="text-xs font-bold align-top text-slate-300">,00 €</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Neurčený rozpočet</p>
          </div>

          {/* Príjmy */}
          <div className="bg-[#171B26] p-4 rounded-2xl border border-slate-800/80">
            <span className="text-xs text-slate-400 font-medium leading-tight">Príjmy za október</span>
            <div className="mt-3">
              <span className="text-lg font-bold text-white">0</span>
              <span className="text-xs font-bold align-top text-slate-300">,00 €</span>
            </div>
          </div>
        </div>

        {/* Sekcia: Vaše produkty */}
        <section className="space-y-3 pt-1">
          <h2 className="text-xs font-semibold text-slate-400 px-1">Vaše produkty</h2>

          {/* KARTA 1: ÚČET (Klikateľná) */}
          <div 
            onClick={onSelectAccount}
            className="bg-[#171B26] rounded-2xl border border-slate-800/80 overflow-hidden relative cursor-pointer hover:border-slate-700 transition-all active:scale-[0.99] group"
          >
            {/* Horný fuksiový pásik */}
            <div className="h-1 bg-gradient-to-r from-[#D8005A] to-[#C8005A]" />
            
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-white">Účet</h3>
                  {/* Záporná suma v červenej farbe */}
                  <div className="text-2xl font-black text-[#FF4D6D] tracking-tight mt-1">
                    <span>-18 299</span>
                    <span className="text-sm font-bold align-top ml-0.5">,05 €</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">-18 299,05 € vlastné zdroje</p>
                </div>

                {/* Náhľadový obrázok účtu */}
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0">
                  <img 
                    src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=120&q=80" 
                    alt="Mesto" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Spodný riadok karty */}
              <div className="flex justify-between items-center pt-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); }}
                  className="bg-[#1E2638] hover:bg-[#253047] text-[#4C9EEB] text-xs font-bold px-4 py-2 rounded-full transition-colors"
                >
                  Nová platba
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-full transition-colors"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* KARTA 2: INVESTÍCIE */}
          <div className="bg-[#171B26] rounded-2xl border border-slate-800/80 overflow-hidden relative">
            {/* Horný modrý pásik */}
            <div className="h-1 bg-[#2E2A72]" />
            
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-white">Investície</h3>
                  <div className="text-2xl font-black text-white tracking-tight mt-1">
                    <span>0</span>
                    <span className="text-sm font-bold align-top ml-0.5">,00 €</span>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0">
                  <img 
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=120&q=80" 
                    alt="Budova" 
                    className="w-full h-full object-cover opacity-80"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button className="bg-[#1E2638] hover:bg-[#253047] text-[#4C9EEB] text-xs font-bold px-4 py-2 rounded-full transition-colors">
                  Vyhľadať a kúpiť
                </button>
              </div>
            </div>
          </div>

          {/* KARTA 3: MONEYBACK */}
          <div className="bg-[#171B26] rounded-2xl border border-slate-800/80 overflow-hidden relative">
            {/* Horný fialový pásik */}
            <div className="h-1 bg-[#8E24AA]" />
            
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Moneyback</h3>
                  <span className="inline-block bg-[#132A4A] text-[#4C9EEB] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    5 nových ponúk
                  </span>
                </div>

                <div className="w-10 h-10 rounded-full bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Objavte ponuky od najlepších značiek a získajte späť časť svojich peňazí.
              </p>

              <div className="pt-1">
                <button className="bg-[#1E2638] hover:bg-[#253047] text-[#4C9EEB] text-xs font-bold px-4 py-2 rounded-full transition-colors">
                  Prezrite si 5 nových ponúk
                </button>
              </div>
            </div>
          </div>

        </section>
      </main>

      {/* 3. SPODNÁ NAVIGAČNÁ LIŠTA (5 záložiek v tmavom režime) */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0D101A]/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-2 z-40">
        <div className="flex items-center justify-around">
          
          {/* 1. Prehľad (Aktívny) */}
          <button className="flex flex-col items-center gap-1">
            <div className="bg-[#13325B] text-[#4C9EEB] px-4 py-1 rounded-full flex items-center justify-center">
              <span className="font-serif italic font-black text-sm">g</span>
            </div>
            <span className="text-[10px] font-bold text-[#4C9EEB]">Prehľad</span>
          </button>

          {/* 2. FIT */}
          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors relative">
            <div className="relative p-1">
              <Activity className="w-5 h-5" />
              <span className="absolute top-1 right-0 w-2 h-2 bg-rose-500 rounded-full" />
            </div>
            <span className="text-[10px] font-medium">FIT</span>
          </button>

          {/* 3. Invest */}
          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors p-1">
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] font-medium">Invest</span>
          </button>

          {/* 4. Objavujte */}
          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors p-1">
            <LayoutGrid className="w-5 h-5" />
            <span className="text-[10px] font-medium">Objavujte</span>
          </button>

          {/* 5. Kontakty */}
          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors p-1">
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] font-medium">Kontakty</span>
          </button>

        </div>
      </nav>

    </div>
  );
}
