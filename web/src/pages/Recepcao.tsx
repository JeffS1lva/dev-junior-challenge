import { useEffect, useState } from 'react';
import { listarFila, type CheckIn } from '@/api/checkIns';
import { ApiError } from '@/api/client';
import { Alerta } from '@/components/Alerta';
import { FilaLista } from '@/components/FilaLista';

const INTERVALO_MS = 15_000;

interface Props {
  /** Muda quando um check-in novo é criado, forçando o recarregamento. */
  versao: number;
}

export function Recepcao({ versao }: Props) {
  const [fila, setFila] = useState<CheckIn[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [ciclo, setCiclo] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => setCiclo((c) => c + 1), INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    let ativo = true;

    listarFila()
      .then((lista) => {
        // `ativo` evita atualizar o estado se o componente saiu da tela
        // antes de a resposta chegar.
        if (ativo) {
          setFila(lista);
          setErro(null);
        }
      })
      .catch((e) => {
        if (ativo) {
          setErro(
            e instanceof ApiError
              ? e.message
              : 'Não foi possível carregar a fila.',
          );
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [versao, ciclo]);

  return (
    <div>
      <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(8.75rem,1fr))] gap-2.5">
        <div className="rounded-lg border border-border bg-card px-3.5 py-3">
          <b className="block font-mono text-[1.4rem] font-semibold tabular-nums">
            {fila.length}
          </b>
          <span className="text-[0.7rem] tracking-[0.08em] uppercase text-muted-foreground">
            Na fila
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-3">
          <h2 className="font-display text-sm font-semibold">
            Fila de check-ins
          </h2>
        </div>

        {erro && (
          <div className="px-4 pb-3">
            <Alerta mensagem={erro} />
          </div>
        )}

        {carregando ? (
          <p className="px-5 py-9 text-center text-sm text-muted-foreground">
            Carregando…
          </p>
        ) : (
          <FilaLista fila={fila} />
        )}
      </div>
    </div>
  );
}
