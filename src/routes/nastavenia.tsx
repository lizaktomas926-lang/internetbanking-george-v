import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/nastavenia')({
  component: Nastavenia,
});

function Nastavenia() {
  const [prijatyPrevod, setPrijatyPrevod] = useState(true);
  const [odoslanaPlatba, setOdoslanaPlatba] = useState(true);
  const [prekrocenieRozpoctu, setPrekrocenieRozpoctu] = useState(true);

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Nastavenia upozornení</h1>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Prijatý prevod</span>
          <input type="checkbox" checked={prijatyPrevod} onChange={() => setPrijatyPrevod(!prijatyPrevod)} />
        </div>
        <div className="flex items-center justify-between">
          <span>Odoslaná platba</span>
          <input type="checkbox" checked={odoslanaPlatba} onChange={() => setOdoslanaPlatba(!odoslanaPlatba)} />
        </div>
        <div className="flex items-center justify-between">
          <span>Prekročenie rozpočtu</span>
          <input type="checkbox" checked={prekrocenieRozpoctu} onChange={() => setPrekrocenieRozpoctu(!prekrocenieRozpoctu)} />
        </div>
      </div>
    </div>
  );
}
