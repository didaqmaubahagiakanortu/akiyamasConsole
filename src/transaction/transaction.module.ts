import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { ActionModule } from 'src/action/action.module';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  imports: [ActionModule, SupabaseModule],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
