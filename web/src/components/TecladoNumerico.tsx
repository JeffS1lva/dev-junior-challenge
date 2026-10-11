import { Button } from '@/components/ui/button';

interface Props {
  onDigitar: (digito: string) => void;
  onApagar: () => void;
  onLimpar: () => void;
  desabilitado?: boolean;
}

const DIGITOS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

/** Teclado do totem — o paciente digita sem teclado físico. */
export function TecladoNumerico({
  onDigitar,
  onApagar,
  onLimpar,
  desabilitado = false,
}: Props) {
  return (
    <div className="mt-3.5 grid grid-cols-3 gap-2">
      {DIGITOS.map((d) => (
        <Button
          key={d}
          variant="outline"
          onClick={() => onDigitar(d)}
          disabled={desabilitado}
          className="h-14 bg-muted font-mono text-lg font-medium active:bg-accent"
        >
          {d}
        </Button>
      ))}

      <Button
        variant="outline"
        onClick={onLimpar}
        disabled={desabilitado}
        className="h-14 bg-muted text-sm font-semibold text-muted-foreground"
      >
        limpar
      </Button>

      <Button
        variant="outline"
        onClick={() => onDigitar('0')}
        disabled={desabilitado}
        className="h-14 bg-muted font-mono text-lg font-medium active:bg-accent"
      >
        0
      </Button>

      <Button
        variant="outline"
        onClick={onApagar}
        disabled={desabilitado}
        className="h-14 bg-muted text-sm font-semibold text-muted-foreground"
      >
        apagar
      </Button>
    </div>
  );
}
