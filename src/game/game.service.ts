import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { ActionService } from 'src/action/action.service';
import { buildResponse } from 'src/common/utils/response.util';
import { FilterGameDto } from './dto/filter-game.dto';

@Injectable()
export class GameService {
  constructor(private readonly action: ActionService) { }

  async create(createGameDto: CreateGameDto) {
    try {
      const { title, genre, platforms } = createGameDto
      const result = await this.action.createAction('game', {
        title,
        genre
      });
      const gameData = result.data;

      if (platforms && platforms.length > 0) {
        const junctionPromises = platforms.map((p) =>
          this.action.createAction('game_platform', {
            game_id: gameData.id,
            console_id: p.console_id,
            stock: p.stock,
            price: p.price
          })
        )

        await Promise.all(junctionPromises)
      }

      gameData.platforms = platforms
      return buildResponse(HttpStatus.CREATED, 'CREATE', 'game', gameData)
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        buildResponse(HttpStatus.BAD_REQUEST, 'CREATE', 'game', null, error.message || JSON.stringify(error)),
        HttpStatus.BAD_REQUEST);
    }
  }

  findAll(filterGameDto: FilterGameDto) {
    const {page, limit, title, genre, platform, min_price, max_price, available} = filterGameDto

    let filters: Record<string, any> = {
      ...(title && { title }),
      ...(genre && { genre })
    }

    if (platform) filters['game_platform.console.name'] = platform

    if (min_price || max_price) {
      filters['game_platform.price'] = {
        ...(min_price && { gte: min_price }),
        ...(max_price && { lte: max_price })
      }
    }

    if (available !== undefined) {
      filters['game_platform.stock'] = available ? { gte: 1 } : { lte: 0 }
    }
    

    let selectQuery = '*, game_platform(price, stock, console(*))'
    if (platform || min_price || max_price || available) selectQuery = platform ? '*, game_platform!inner(price, stock, console!inner(*))' : '*, game_platform!inner(price, stock, console(*))'

    return this.action.getManyAction('game', page, limit, filters, selectQuery)
  }

  findOne(uuid: string) {
    return this.action.getAction('game', 'id', uuid, '*, game_platform(*, console(*))');
  }

  async update(uuid: string, updateGameDto: UpdateGameDto) {
    try {
      const { title, genre, platforms } = updateGameDto

      if (title || genre) {
        await this.action.updateAction('game', uuid, {
          ...(title && { title }),
          ...(genre && { genre })
        })
      }

      if (platforms && platforms.length > 0) {
        try {
          await this.action.deleteManyAction('game_platform', 'game_id', uuid);
        } catch (error: any) {
          if (error instanceof NotFoundException) {

          } else if (error instanceof HttpException) {
            throw error
          } else {
            throw new HttpException(
              buildResponse(HttpStatus.BAD_REQUEST, 'UPDATE', 'game', null, error.message || JSON.stringify(error)),
              HttpStatus.BAD_REQUEST
            )
          }
        }

        const junctionPromises = platforms.map((p) =>
          this.action.createAction('game_platform', {
            game_id: uuid,
            console_id: p.console_id,
            stock: p.stock,
            price: p.price
          })
        )

        await Promise.all(junctionPromises)
      }

      const result = await this.action.getAction('game', 'id', uuid)
      return buildResponse(HttpStatus.OK, 'UPDATE', 'game', result.data)
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        buildResponse(HttpStatus.BAD_REQUEST, 'UPDATE', 'game', null, error.message || JSON.stringify(error)),
        HttpStatus.BAD_REQUEST);
    }
  }

  remove(uuid: string) {
    return this.action.deleteAction('game', uuid)
  }
}