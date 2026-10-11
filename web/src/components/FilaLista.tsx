import type { CheckIn } from '@/api/checkIns';
import { mascararCpf } from '@/lib/cpf';
import { hhmm, tempoDeEspera } from '@/lib/formato';

interface Props {
  fila: CheckIn[];
}

/** Lista da fila, na ordem de chegada que a API devolve. */
export function FilaLista({ fila }: Props) {
  if (fila.length === 0) {
    return (
      <p className="px-5 py-9 text-center text-sm text-muted-foreground">
        Nenhum check-in registrado ainda.
      </p>
    );
  }

  return (
    <>
      {fila.map((checkIn, indice) => (
        <div
          key={checkIn.id}
          className="flex flex-wrap items-center gap-3.5 border-b border-border
                     px-4 py-3 last:border-b-0"
        >
          <span className="w-6 shrink-0 font-mono text-sm tabular-nums text-muted-foreground">
            {String(indice + 1).padStart(2, '0')}
          </span>

          <span className="min-w-35 flex-1">
            <b className="block text-[0.95rem] font-semibold">{checkIn.nome}</b>
            <span className="font-mono text-xs text-muted-foreground">
              {mascararCpf(checkIn.cpf)}
            </span>
          </span>

          <span className="min-w-23 text-right font-mono text-sm tabular-nums text-muted-foreground">
            {hhmm(new Date(checkIn.horarioChegada))} ·{' '}
            {tempoDeEspera(checkIn.horarioChegada)}
          </span>
        </div>
      ))}
    </>
  );
}
