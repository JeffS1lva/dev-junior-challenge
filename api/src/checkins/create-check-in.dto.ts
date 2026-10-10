import { Transform } from 'class-transformer';
import { IsString, Matches } from 'class-validator';

export class CreateCheckInDto {
  // O paciente pode digitar "123.456.789-01" ou "12345678901".
  // O @Transform remove a máscara ANTES da validação, então o resto da
  // aplicação só lida com dígitos.
  @IsString({ message: 'CPF é obrigatório.' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value,
  )
  @Matches(/^\d{11}$/, { message: 'CPF deve conter 11 dígitos.' })
  cpf!: string;
}
