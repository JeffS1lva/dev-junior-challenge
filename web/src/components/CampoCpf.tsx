import { formatarCpf } from '@/lib/cpf';

interface Props {
  cpf: string;
}

export function CampoCpf({ cpf }: Props) {
  const texto = formatarCpf(cpf);
  const molde = '___.___.___-__'.slice(texto.length);

  return (
    <div
      aria-live="polite"
      aria-label={`CPF digitado: ${texto || 'vazio'}`}
      className="mt-5 mb-1.5 rounded-lg border border-border bg-muted px-2.5 py-3.5
                 text-center font-mono text-[clamp(1.6rem,8vw,2.25rem)] font-medium
                 tracking-wide tabular-nums"
    >
      {texto}
      <span className="text-muted-foreground opacity-50">{molde}</span>
    </div>
  );
}
