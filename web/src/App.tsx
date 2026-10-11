import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Totem } from '@/pages/Totem';

type Modo = 'totem' | 'recepcao';

export function App() {
  const [modo, setModo] = useState<Modo>('totem');
  // Incrementado a cada check-in novo; a Recepcao observa e recarrega a fila.
  const [, setVersao] = useState(0);

  return (
    <div>
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-4 border-b border-border bg-card px-4 py-3">
        <b className="font-display text-base font-bold tracking-tight">
          Check-in de Pacientes
        </b>

        <div
          role="group"
          aria-label="Alternar tela"
          className="ml-auto flex gap-0.5 rounded-full border border-border bg-muted p-0.75"
        >
          {(['totem', 'recepcao'] as const).map((valor) => (
            <button
              key={valor}
              aria-pressed={modo === valor}
              onClick={() => setModo(valor)}
              className={cn(
                'cursor-pointer rounded-full px-3.5 py-1.5 text-[0.8rem] font-medium transition-colors',
                modo === valor
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground',
              )}
            >
              {valor === 'totem' ? 'Totem' : 'Recepção'}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-220 px-4 pt-6 pb-12">

        <Totem aoRegistrar={() => setVersao((v) => v + 1)} />

      </main>
    </div>
  );
}
