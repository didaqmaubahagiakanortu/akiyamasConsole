import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { BcryptModule } from 'src/bcrypt/bcrypt.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ActionModule } from 'src/action/action.module';

@Module({
  imports: [
    ActionModule,
    BcryptModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET_KEY'),
        signOptions: { expiresIn: '1d' }
      })
    })
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule { }
