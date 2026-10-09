import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CheckInsController } from './check-ins/check-ins.controller';
import { CheckInsService } from './check-ins/check-ins.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HttpModule],
  controllers: [CheckInsController],
  providers: [CheckInsService],
})
export class AppModule { }
