/** Hora no formato 14:05. */
export function hhmm(data: Date): string {
  return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/** Tempo decorrido desde a chegada: "12 min" ou "2h05". */
export function tempoDeEspera(horarioIso: string): string {
  const minutos = Math.max(
    0,
    Math.round((Date.now() - new Date(horarioIso).getTime()) / 60000),
  );
  if (minutos < 60) return `${minutos} min`;
  return `${Math.floor(minutos / 60)}h${String(minutos % 60).padStart(2, '0')}`;
}
