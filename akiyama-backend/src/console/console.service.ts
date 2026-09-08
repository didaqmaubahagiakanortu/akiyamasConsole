import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateConsoleDto } from './dto/create-console.dto';
import { UpdateConsoleDto } from './dto/update-console.dto';
import { ActionService } from 'src/action/action.service';
import { FilterConsoleDto } from './dto/filter-console.dto';

@Injectable()
export class ConsoleService {
  constructor(private readonly action: ActionService) { }

  create(createConsoleDto: CreateConsoleDto) {
    const {
      name,
      brand,
      price,
      stock
    } = createConsoleDto
    return this.action.createAction('console', {
      name,
      brand,
      price,
      stock
    });
  }

  async findAll(filterConsoleDto: FilterConsoleDto) {
    const { page, limit, name, brand, min_price, max_price, available } = filterConsoleDto

    const filter: Record<string, any> = {
      ...(name && { name }),
      ...(brand && { brand }),
    }

    if (min_price || max_price) {
      filter.price = {
        ...(min_price !== undefined && { gte: min_price }),
        ...(max_price !== undefined && { lte: max_price })
      }
    }

    if (available !== undefined) filter.stock = available ? { gte: 1 } : { lte: 0 }

    return this.action.getManyAction('console', page, limit, filter, '*, game_platform(price, stock, game(*))');
  }

  findOne(uuid: string) {
    return this.action.getAction('console', 'id', uuid, '*, game_platform(price, stock, game(*))');
  }

  update(uuid: string, updateConsoleDto: UpdateConsoleDto) {
    const {
      name,
      brand,
      price,
      stock
    } = updateConsoleDto
    return this.action.updateAction('console', uuid, {
      ...(name && { name }),
      ...(brand && { brand }),
      ...(price && { price }),
      ...(stock && { stock })
    });
  }

  remove(uuid: string) {
    return this.action.deleteAction('console', uuid);
  }
}
