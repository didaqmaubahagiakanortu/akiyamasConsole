import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { BcryptService } from 'src/bcrypt/bcrypt.service';
import { JwtService } from '@nestjs/jwt';
import { ActionService } from 'src/action/action.service';
import { buildResponse } from 'src/common/utils/response.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly action: ActionService,
    private readonly bcrypt: BcryptService,
    private jwt: JwtService
  ) { }

  async signIn(signInDto: SignInDto) {
    try {
      const { email, password } = signInDto
      let userResponse

      try {
        userResponse = await this.action.getAction('user', 'email', email)
      } catch (error) {
        throw new UnauthorizedException(
          buildResponse(HttpStatus.UNAUTHORIZED, 'SIGN IN', 'user', null, 'Email or password is not correct')
        )
      }

      const user = userResponse.data
      const checkPass = await this.bcrypt.comparePassword(password, user.password)

      if (!checkPass) throw new UnauthorizedException(
        buildResponse(HttpStatus.UNAUTHORIZED, 'SIGN IN', 'user', null, 'Email or password is not correct')
      )
      const payload = { id: user.id, email: user.email, role: user.role }
      const token = await this.jwt.signAsync(payload)
      return buildResponse(HttpStatus.OK, 'SIGN IN', 'user', { ...user, token })

    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        buildResponse(HttpStatus.BAD_REQUEST, 'SIGN IN', 'user', null, error.message || JSON.stringify(error)),
        HttpStatus.BAD_REQUEST);
    }
  }
}
