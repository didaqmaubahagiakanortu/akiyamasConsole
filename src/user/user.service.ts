import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ActionService } from '../action/action.service';
import { BcryptService } from '../bcrypt/bcrypt.service';
import { FilterUserDto } from './dto/filter-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly action: ActionService,
    private readonly bcrypt: BcryptService
  ) { }

  async create(createUserDto: CreateUserDto) {
    const { name, email, phone_number, address, city, postal_code, password, role } = createUserDto
    const hashedPassword = await this.bcrypt.hashPassword(password);

    return await this.action.createAction('user', { 
      name, 
      email, 
      phone_number, 
      address, 
      city, 
      postal_code, 
      password: hashedPassword, 
      role 
    });
  }

  async findAll(filterUserDto: FilterUserDto) {
    const {page, limit, ...filter} = filterUserDto
    return await this.action.getManyAction('user', page, limit, filter)
  }

  async findOne(id: number) {
    return await this.action.getAction('user', 'id', id)
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { name, email, phone_number, address, city, postal_code, password, role } = updateUserDto
    if (password) {
      updateUserDto.password = await this.bcrypt.hashPassword(password)
    }
    return await this.action.updateAction('user', id, {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone_number && { phone_number }),
      ...(address && { address }),
      ...(city && { city }),
      ...(postal_code && { postal_code }),
      ...(password && { password }),
      ...(role && { role })
    })
  }
  
  async remove(id: number) {
    return await this.action.deleteAction('user', id)
  }
}

