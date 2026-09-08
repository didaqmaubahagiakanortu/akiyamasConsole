import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { ActionModule } from 'src/action/action.module';

@Module({
  imports: [ActionModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
