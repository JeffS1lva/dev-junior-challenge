import { Body, Controller, Get, Post } from '@nestjs/common';
import type { CheckIn } from './checkins.service.js';
import { CheckInsService } from './checkins.service.js';
import { CreateCheckInDto } from './create-check-in.dto.js';

@Controller('checkins')
export class CheckInsController {
  constructor(private readonly checkIns: CheckInsService) { }

  /** POST /api/checkins — registra o paciente na fila a partir do CPF. */
  @Post()
  create(@Body() dto: CreateCheckInDto): Promise<CheckIn> {
    return this.checkIns.create(dto.cpf);
  }

  /** GET /api/checkins — lista a fila de check-ins. */
  @Get()
  list(): CheckIn[] {
    return this.checkIns.listar();
  }
}
