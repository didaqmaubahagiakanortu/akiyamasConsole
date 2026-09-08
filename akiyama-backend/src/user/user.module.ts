import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { ActionModule } from '../action/action.module';
import { UserService } from './user.service';
import { BcryptModule } from '../bcrypt/bcrypt.module';

@Module({
  imports: [ActionModule, BcryptModule],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule { }
