import { HttpService } from '@nestjs/axios';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException
} from '@nestjs/common';
import type { AxiosError } from 'axios';
import { randomUUID } from 'node:crypto';
import { firstValueFrom } from 'rxjs';

export interface CheckIn {
  id: string;
  cpf: string;
  nome: string;
  horarioChegada: Date;
}

@Injectable()
export class CheckInsService {
  // Fila em memória: os check-ins vivem enquanto a aplicação roda.
  private readonly fila: CheckIn[] = [];

  constructor(private readonly http: HttpService) { }

  /**
 * Registra o paciente na fila:
 * 1. recusa com 409 se o CPF já estiver na fila — evita duplicar o
 *    atendimento quando o paciente toca o botão duas vezes no totem;
 * 2. consulta o cadastro externo para obter o nome (404 se o CPF não
 *    existir, 503 se o cadastro estiver indisponível);
 * 3. grava na fila com o horário de chegada.
 *
 * A checagem vem antes da consulta porque um CPF já na fila foi validado
 * no cadastro quando entrou — repetir a chamada HTTP seria desperdício.
 */
  async create(cpf: string): Promise<CheckIn> {
    const checkInExistente = this.fila.find((checkIn) => checkIn.cpf === cpf);
    if (checkInExistente) {
      const hora = checkInExistente.horarioChegada.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      throw new ConflictException(
        `Check-in já registrado às ${hora}. Se precisar de ajuda, procure a recepção.`,
      );
    }

    const nome = await this.buscarNomeNoCadastro(cpf);

    const checkIn: CheckIn = {
      id: randomUUID(),
      cpf,
      nome,
      horarioChegada: new Date(),
    };

    this.fila.push(checkIn);
    return checkIn;
  }

  /** Fila de check-ins, da chegada mais antiga para a mais recente. */
  listar(): CheckIn[] {
    return this.fila;
  }


  private async buscarNomeNoCadastro(cpf: string): Promise<string> {
    const baseUrl = process.env.MOCK_SERVICE_URL ?? 'http://localhost:4000';

    try {
      const { data } = await firstValueFrom(
        this.http.get<{ nome: string }>(`${baseUrl}/pacientes/${cpf}`, {
          timeout: 5000,
        }),
      );
      return data.nome;
    } catch (error) {
      // 404 do cadastro = o CPF não existe.
      if ((error as AxiosError).response?.status === 404) {
        throw new NotFoundException(
          'CPF não encontrado no cadastro de pacientes.',
        );
      }


      throw new ServiceUnavailableException(
        'Não foi possível consultar o cadastro de pacientes. Tente novamente.',
      );
    }
  }
}
