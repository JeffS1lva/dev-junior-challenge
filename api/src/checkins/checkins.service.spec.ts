import { HttpService } from '@nestjs/axios';
import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CheckInsService } from './checkins.service.js';

describe('CheckInsService', () => {
  let service: CheckInsService;
  let http: { get: ReturnType<typeof vi.fn> };

  beforeEach(async () => {

    http = { get: vi.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [CheckInsService, { provide: HttpService, useValue: http }],
    }).compile();

    service = moduleRef.get(CheckInsService);
  });

  it('registra o check-in com o nome vindo do cadastro externo', async () => {
    http.get.mockReturnValue(of({ data: { nome: 'Maria Silva' } }));

    const checkIn = await service.create('12345678901');

    expect(checkIn.nome).toBe('Maria Silva');
    expect(checkIn.cpf).toBe('12345678901');
    expect(service.listar()).toHaveLength(1);
  });

  it('devolve 404 quando o CPF não existe no cadastro', async () => {
    http.get.mockReturnValue(throwError(() => ({ response: { status: 404 } })));

    await expect(service.create('00000000000')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    // Nada entra na fila quando o paciente não foi encontrado.
    expect(service.listar()).toHaveLength(0);
  });

  it('devolve 503 quando o cadastro está fora do ar', async () => {

    http.get.mockReturnValue(throwError(() => new Error('ECONNREFUSED')));

    await expect(service.create('12345678901')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
