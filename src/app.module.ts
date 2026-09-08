import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ConfigModule } from '@nestjs/config';
import { ActionModule } from './action/action.module';
import { BcryptService } from './bcrypt/bcrypt.service';
import { BcryptModule } from './bcrypt/bcrypt.module';
import { AuthModule } from './auth/auth.module';
import { ConsoleModule } from './console/console.module';
import { GameModule } from './game/game.module';
import { OrderModule } from './order/order.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    UserModule,
    SupabaseModule,
    ActionModule,
    BcryptModule,
    AuthModule,
    ConsoleModule,
    GameModule,
    OrderModule,
    TransactionModule],
  controllers: [AppController],
  providers: [AppService, BcryptService],
})
export class AppModule {}
