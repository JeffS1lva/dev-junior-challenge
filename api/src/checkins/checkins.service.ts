import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { AxiosError } from 'axios';
import { randomUUID } from 'node:crypto';
import { firstValueFrom } from 'rxjs';

export interface CheckIn {
  id: string;
  cpf: string;
  nome: string;
  arrivedAt: Date;
}

@Injectable()
export class CheckInsService {
  // Fila em memória: os check-ins vivem enquanto a aplicação roda.
  private readonly fila: CheckIn[] = [];

  constructor(private readonly http: HttpService) { }

  /**
   * Registra o paciente na fila:
   * 1. consulta o cadastro externo pelo CPF;
   * 2. se não existir, devolve 404 com mensagem clara;
   * 3. grava na fila com o horário de chegada.
   */
  async create(cpf: string): Promise<CheckIn> {
    const nome = await this.buscarNomeNoCadastro(cpf);

    const checkIn: CheckIn = {
      id: randomUUID(),
      cpf,
      nome,
      arrivedAt: new Date(),
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
