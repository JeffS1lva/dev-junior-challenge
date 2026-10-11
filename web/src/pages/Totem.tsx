import { useEffect, useState } from 'react';
import { criarCheckIn, type CheckIn } from '@/api/checkIns';
import { ApiError } from '@/api/client';
import { Alerta } from '@/components/Alerta';
import { CampoCpf } from '@/components/CampoCpf';
import { TecladoNumerico } from '@/components/TecladoNumerico';
import { Button } from '@/components/ui/button';
import { soDigitos } from '@/lib/cpf';
import { hhmm } from '@/lib/formato';

interface Props {
  /** Avisa o App que a fila mudou, para a tela da recepção recarregar. */
  aoRegistrar: () => void;
}

export function Totem({ aoRegistrar }: Props) {
  const [cpf, setCpf] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [recibo, setRecibo] = useState<CheckIn | null>(null);
  const [segundos, setSegundos] = useState(5);

  useEffect(() => {
    if (!recibo) return;

    setSegundos(5);

    //Duas funções distintas: uma para contar os segundos, outra para limpar o recibo e o CPF.
    const contagem = setInterval(() => setSegundos((s) => s - 1), 1000);
    const limpeza = setTimeout(() => {
      setRecibo(null);
      setCpf('');
    }, 5000)

    //Cancelar os dois ao sair evita que disparem depois que a tela mudou.
    return () => {
      clearInterval(contagem);
      clearTimeout(limpeza);
    };
  }, [recibo]);

  function digitar(digito: string) {
    setErro(null);
    setCpf((atual) => soDigitos(atual + digito).slice(0, 11));
  }

  async function enviar() {
    setEnviando(true);
    setErro(null);

    try {
      const checkIn = await criarCheckIn(cpf);
      setRecibo(checkIn);
      aoRegistrar();
    } catch (e) {
      setErro(
        e instanceof ApiError ? e.message : 'Erro inesperado. Tente novamente.',
      );
    } finally {
      // finally garante que o botão destrava mesmo quando dá erro.
      setEnviando(false);
    }
  }

  if (recibo) {
    return (
      <div className="mx-auto max-w-130">
        <div className="rounded-xl border border-border bg-card px-6 py-8 text-center shadow-sm">
          <div className="mx-auto mb-3.5 grid size-13 place-items-center rounded-full bg-success-soft text-success">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>

          <p className="text-[0.7rem] font-semibold tracking-[0.14em] uppercase text-muted-foreground">
            Check-in confirmado
          </p>
          <p className="mt-2.5 font-display text-xl font-semibold">
            {recibo.nome}
          </p>
          <p className="mt-1.5 mb-5 text-sm tabular-nums text-muted-foreground">
            Chegada às {hhmm(new Date(recibo.horarioChegada))}
          </p>
          <p className="text-sm text-muted-foreground">
            Check-in realizado. Aguarde ser chamado na recepção.
          </p>

          <p className='mt-5 text-sm tabular-nums text-muted-foreground'>
            Essa tela se fecha em {segundos} segundos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-130">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="text-[0.7rem] font-semibold tracking-[0.14em] uppercase text-muted-foreground">
          Recepção · Ambulatório
        </p>
        <h1 className="mt-1.5 font-display text-[1.6rem] font-bold tracking-tight text-balance">
          Digite seu CPF para fazer o check-in
        </h1>
        <p className="text-sm text-muted-foreground">
          Apenas os números. Seus dados vêm do cadastro do hospital.
        </p>

        <CampoCpf cpf={cpf} />

        <TecladoNumerico
          onDigitar={digitar}
          onApagar={() => {
            setErro(null);
            setCpf((atual) => atual.slice(0, -1));
          }}
          onLimpar={() => {
            setErro(null);
            setCpf('');
          }}
          desabilitado={enviando}
        />

        {/* Botão travado durante o envio: evita o duplo toque no totem.
            A recusa de duplicidade também existe na API (409) — aqui é só UX. */}
        <Button
          onClick={enviar}
          disabled={cpf.length !== 11 || enviando}
          className="mt-3.5 h-13 w-full font-display text-base font-semibold"
        >
          {enviando ? 'Consultando cadastro…' : 'Confirmar check-in'}
        </Button>

        {erro && <Alerta mensagem={erro} />}
      </div>
    </div>
  );
}
