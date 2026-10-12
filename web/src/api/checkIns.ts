import { request } from './client';

export interface CheckIn {
  id: string;
  cpf: string;
  nome: string;
  horarioChegada: string;
}

export function criarCheckIn(cpf: string): Promise<CheckIn> {
  return request<CheckIn>('/checkins', {
    method: 'POST',
    body: JSON.stringify({ cpf }),
  });
}

export function listarFila(): Promise<CheckIn[]> {
  return request<CheckIn[]>('/checkins');
}