import React, { useState } from 'react';
import AccountDetail from './components/AccountDetail';
import Overview from './components/Overview'; // Predpokladáme váš domovský Prehľad

export default function App() {
  // Prepínanie obrazoviek: 'overview' | 'detail'
  const [currentScreen, setCurrentScreen] = useState('overview');

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center items-center p-0 sm:p-4">
      {/* Mobilný výrez / Rámček aplikácie */}
      <div className="w-full max-w-md bg-white min-h-screen sm:min-h-[844px] sm:rounded-[38px] overflow-hidden shadow-2xl border border-slate-800 relative">
        
        {currentScreen === 'overview' ? (
          <Overview onSelectAccount={() => setCurrentScreen('detail')} />
        ) : (
          <AccountDetail onBack={() => setCurrentScreen('overview')} />
        )}

      </div>
    </div>
  );
}
