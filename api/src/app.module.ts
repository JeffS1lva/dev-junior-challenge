import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CheckInsController } from './checkins/checkins.controller.js';
import { CheckInsService } from './checkins/checkins.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Cliente HTTP usado para falar com o mock-service.
    HttpModule,
  ],
  controllers: [CheckInsController],
  providers: [CheckInsService],
})
export class AppModule { }
