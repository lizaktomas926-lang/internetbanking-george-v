import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

export const Route = createFileRoute('/_authenticated/nastavenia')({
  component: Nastavenia,
});

function Nastavenia() {
  const [prijatyPrevod, setPrijatyPrevod] = useState(true);
  const [odoslanaPlatba, setOdoslanaPlatba] = useState(true);
  const [prekrocenieRozpoctu, setPrekrocenieRozpoctu] = useState(true);

  return (
    <div className="p-5">
      <div className="flex items-center mb-6">
        <Link to="/" className="mr-4">
          <ArrowLeft className="size-6 cursor-pointer" />
        </Link>
        <h1 className="text-2xl font-bold">Nastavenia upozornení</h1>
      </div>
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
