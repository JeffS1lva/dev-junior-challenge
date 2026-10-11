const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

/** Erro vindo da API, com o status e a mensagem prontos para a tela. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function request<T>(caminho: string, init?: RequestInit): Promise<T> {
  let resposta: Response;

  try {
    resposta = await fetch(`${BASE_URL}${caminho}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    // fetch só rejeita quando a requisição nem sai: API fora do ar, DNS, CORS.
    throw new ApiError(0, 'Não foi possível conectar à API. Ela está rodando?');
  }

  const corpo = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    throw new ApiError(resposta.status, mensagemDoErro(corpo));
  }

  return corpo as T;
}

// Descobri que o formato do erro muda: 404 e 409 trazem uma string,
// mas o 400 do class-validator traz um array com cada regra violada.
// Junto tudo numa frase para a tela não precisar saber disso.
function mensagemDoErro(corpo: unknown): string {
  const message = (corpo as { message?: unknown } | null)?.message;
  if (typeof message === 'string') return message;
  if (Array.isArray(message)) return message.join(' ');
  return 'Erro inesperado ao falar com a API.';
}
