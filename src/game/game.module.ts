import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { ActionModule } from 'src/action/action.module';

@Module({
  imports: [ActionModule],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}
