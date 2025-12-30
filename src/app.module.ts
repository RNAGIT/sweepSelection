import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CsvService } from './csv/csv.service';
import { CsvController } from './csv/csv.controller';
import { SpinWheelController } from './spin-wheel/spin-wheel.controller';
import { SpinWheelService } from './spin-wheel/spin-wheel.service';

@Module({
  imports: [],
  controllers: [AppController, CsvController, SpinWheelController],
  providers: [AppService, CsvService, SpinWheelService],
})
export class AppModule {}

