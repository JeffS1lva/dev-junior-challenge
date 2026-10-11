interface Props {
  mensagem: string;
}

/**
 * Exibe o erro vindo da API. A mensagem já chega pronta do back-end, então a
 */
export function Alerta({ mensagem }: Props) {
  return (
    <div
      role="alert"
      className="mt-3.5 flex items-start gap-2.5 rounded-lg border
                 border-destructive/35 bg-destructive-soft p-3 text-sm text-destructive"
    >
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="mt-0.5 shrink-0"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7.5v5.5M12 16.2v.3" />
      </svg>
      <p>{mensagem}</p>
    </div>
  );
}
