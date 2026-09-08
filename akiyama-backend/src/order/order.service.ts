import { ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ActionService } from 'src/action/action.service';
import { buildResponse } from 'src/common/utils/response.util';
import { FilterOrderDto } from './dto/filter-order.dto';
import { ItemType } from './enums/item-type.enum';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Role } from 'src/user/enums/role.enum';
import { OrderStatus } from './enums/order-status.enum';

@Injectable()
export class OrderService {
  constructor(private readonly action: ActionService) { }

  async create(createOrderDto: CreateOrderDto, user_id: number) {
    try {
      const { start_date, end_date, shipping_address, items } = createOrderDto
      let total_price = 0
      let price: any = []

      if (items && items.length > 0)
        for (const item of items) {
          if (item.item_type === ItemType.CONSOLE) {
            const consoleData: any = (await this.action.getAction('console', 'id', item.console_id)).data
            if (consoleData && consoleData.stock < item.quantity) throw new HttpException(
              buildResponse(HttpStatus.BAD_REQUEST, 'CREATE', 'order', null, `Console ${consoleData.name} stock not enough`),
              HttpStatus.BAD_REQUEST
            )

            total_price += consoleData.price * item.quantity
            price.push(consoleData.price)
          } else if (item.item_type === ItemType.GAME) {
            if (!item.game_id) throw new NotFoundException(
              buildResponse(HttpStatus.NOT_FOUND, 'CREATE', 'order', null, `Game ID is required when item_type is GAME`)
            )
            const gamePlatformData: any = (await this.action.getManyAction('game_platform', 1, 1, {
              game_id: item.game_id,
              console_id: item.console_id
            })).data?.data?.[0]

            if (!gamePlatformData) throw new HttpException(
              buildResponse(HttpStatus.BAD_REQUEST, 'CREATE', 'order', null, `Game not available in the chosen console`),
              HttpStatus.BAD_REQUEST
            )
            if (gamePlatformData.stock < item.quantity) throw new HttpException(
              buildResponse(HttpStatus.BAD_REQUEST, 'CREATE', 'order', null, `Game stock insufficient`),
              HttpStatus.BAD_REQUEST
            )

            total_price += gamePlatformData.price * item.quantity
            price.push(gamePlatformData.price)
          }
        }

      const result = await this.action.createAction('order', {
        user_id,
        start_date,
        end_date,
        shipping_address,
        total_price
      })
      const orderData = result.data

      if (items && items.length > 0) {

        const junctionPromises = items.map(async (item, index) => {
          const item_price: any = price[index]

          await this.action.createAction('order_item', {
            order_id: orderData.id,
            item_type: item.item_type,
            console_id: item.console_id,
            game_id: item.game_id ? item.game_id : null,
            quantity: item.quantity,
            price: item_price,
            subtotal: item.quantity * item_price
          })

          if (item.item_type === ItemType.CONSOLE) {
            const consoleData: any = (await this.action.getAction('console', 'id', item.console_id)).data
            await this.action.updateAction('console', item.console_id, { stock: consoleData.stock - item.quantity })
          } else if (item.item_type === ItemType.GAME) {
            const gamePlatformData: any = (await this.action.getManyAction('game_platform', 1, 1, {
              game_id: item.game_id,
              console_id: item.console_id
            })).data?.data?.[0]
            await this.action.updateAction('game_platform', gamePlatformData.id, { stock: gamePlatformData.stock - item.quantity })
          }
        })
        await Promise.all(junctionPromises)
      }

      orderData.items = items
      return buildResponse(HttpStatus.CREATED, 'CREATE', 'order', orderData)
    } catch (error: any) {
      if (error instanceof HttpException) throw error
      throw new HttpException(
        buildResponse(HttpStatus.BAD_REQUEST, 'CREATE', 'order', null, error.message || JSON.stringify(error)),
        HttpStatus.BAD_REQUEST
      )
    }

  }

  findAll(filterOrderDto: FilterOrderDto) {
    const { page, limit, user_name, status, item_type } = filterOrderDto
    const filters = {
      ...(status && { status }),
      ...(item_type && { item_type })
    }
    if (user_name) filters['user.name'] = user_name

    let selectQuery = '*, user(*), order_item(*, console(*), game(*))'
    if (user_name) selectQuery = '*, user!inner(*), order_item(*, console(*), game(*))'

    return this.action.getManyAction('order', page, limit, filters, selectQuery)
  }

  async findOne(uuid: string, user: {id: number, role: string}) {
    const order: any = await this.action.getAction('order', 'id', uuid, '*, user(*), order_item(*, console(*), game(*))')
    
    if (user.role !== Role.ADMIN && order.data?.user_id !== user.id)
      throw new ForbiddenException('You are not allowed to view this order')
    return order
  }

  findMine(id: number, paginationDto: PaginationDto) {
    const { page, limit } = paginationDto
    return this.action.getManyAction('order', page, limit, { user_id: id }, '*, user(*), order_item(*, console(*), game(*))')
  }

  async update(uuid: string, updateOrderDto: UpdateOrderDto) {
    try {
      const { user_id, status, start_date, end_date, shipping_address, items } = updateOrderDto
      const currentItemsRes: any = (await this.action.getManyAction('order_item', 1, 1000, { order_id: uuid }))
      const currentItems = currentItemsRes.data?.data || []
      let total_price = 0
      let price: number[] = []

      if (items && items.length > 0) {
        for (const item of items) {
          const currentItem = currentItems.find((i: any) =>
            i.console_id === item.console_id && (i.item_type === ItemType.CONSOLE || i.game_id === item.game_id)
          )
          const currentQuantity = currentItem ? currentItem.quantity : 0

          if (item.item_type === ItemType.CONSOLE) {
            const consoleData: any = (await this.action.getAction('console', 'id', item.console_id)).data

            const originalStock = currentQuantity + (consoleData?.stock || 0)
            if (!consoleData || originalStock < item.quantity) throw new HttpException(
              buildResponse(HttpStatus.BAD_REQUEST, 'UPDATE', 'order', null, `Console ${consoleData.name} stock insufficient`),
              HttpStatus.BAD_REQUEST
            )
            total_price += consoleData.price * item.quantity
            price.push(consoleData.price)
          } else if (item.item_type === ItemType.GAME) {
            if (!item.game_id) throw new NotFoundException(
              buildResponse(HttpStatus.NOT_FOUND, 'UPDATE', 'order', null, `Game ID is required when item_type is GAME`)
            )
            const gamePlatformData: any = (await this.action.getManyAction('game_platform', 1, 1, {
              game_id: item.game_id,
              console_id: item.console_id
            })).data?.data?.[0]
            if (!gamePlatformData) throw new HttpException(
              buildResponse(HttpStatus.BAD_REQUEST, 'UPDATE', 'order', null, `Game not available in the chosen console`),
              HttpStatus.BAD_REQUEST
            )

            const originalStock = currentQuantity + gamePlatformData.stock
            if (originalStock < item.quantity) throw new HttpException(
              buildResponse(HttpStatus.BAD_REQUEST, 'UPDATE', 'order', null, `Game stock insufficient`),
              HttpStatus.BAD_REQUEST
            )
            total_price += gamePlatformData.price * item.quantity
            price.push(gamePlatformData.price)
          }
        }

        for (const oldItem of currentItems) {
          if (oldItem.item_type === ItemType.CONSOLE) {
            const consoleData: any = (await this.action.getAction('console', 'id', oldItem.console_id)).data
            await this.action.updateAction('console', oldItem.console_id, { stock: consoleData.stock + oldItem.quantity })
          } else if (oldItem.item_type === ItemType.GAME) {
            const gamePlatformData: any = (await this.action.getManyAction('game_platform', 1, 1, {
              game_id: oldItem.game_id,
              console_id: oldItem.console_id
            })).data?.data?.[0]
            await this.action.updateAction('game_platform', gamePlatformData.id, { stock: gamePlatformData.stock + oldItem.quantity })
          }
        }
      }


      await this.action.updateAction('order', uuid, {
        ...(user_id && { user_id }),
        ...(status && { status }),
        ...(start_date && { start_date }),
        ...(end_date && { end_date }),
        ...(shipping_address && { shipping_address }),
        ...(items && items.length > 0 && { total_price })
      })


      if (items && items.length > 0) {
        try {
          await this.action.deleteManyAction('order_item', 'order_id', uuid)
        } catch (error: any) {
          if (error instanceof NotFoundException) {
          } else if (error instanceof HttpException) {
            throw error
          } else {
            throw new HttpException(
              buildResponse(HttpStatus.BAD_REQUEST, 'UPDATE', 'order', null, error.message || JSON.stringify(error)),
              HttpStatus.BAD_REQUEST
            )
          }
        }
        const junctionPromises = items.map(async (item, index) => {
          const item_price = price[index]
          await this.action.createAction('order_item', {
            order_id: uuid,
            item_type: item.item_type,
            console_id: item.console_id ? item.console_id : null,
            game_id: item.game_id ? item.game_id : null,
            quantity: item.quantity,
            price: item_price,
            subtotal: item.quantity * item_price
          })


          if (item.item_type === ItemType.CONSOLE) {
            const consoleData: any = (await this.action.getAction('console', 'id', item.console_id)).data
            await this.action.updateAction('console', item.console_id, { stock: consoleData.stock - item.quantity })
          } else if (item.item_type === ItemType.GAME) {
            const gamePlatformData: any = (await this.action.getManyAction('game_platform', 1, 1, {
              game_id: item.game_id,
              console_id: item.console_id
            })).data?.data?.[0]
            await this.action.updateAction('game_platform', gamePlatformData.id, { stock: gamePlatformData.stock - item.quantity })
          }
        })
        await Promise.all(junctionPromises)
      }

      const result = await this.action.getAction('order', 'id', uuid)
      return buildResponse(HttpStatus.OK, 'UPDATE', 'order', result.data)
    } catch (error: any) {
      if (error instanceof HttpException) throw error
      throw new HttpException(
        buildResponse(HttpStatus.BAD_REQUEST, 'UPDATE', 'order', null, error.message || JSON.stringify(error)),
        HttpStatus.BAD_REQUEST
      )
    }

  }

  async cancel(uuid: string) {
    const order: any = await this.action.getAction('order', 'id', uuid, '*, order_item(*)')
    const items = order.data?.order_item

    if (items && items.length > 0) {
      for (const item of items) {
        if (item.item_type === ItemType.CONSOLE) {
          const consoleData: any = (await this.action.getAction('console', 'id', item.console_id)).data
          await this.action.updateAction('console', item.console_id, { stock: consoleData.stock + item.quantity })
        } else if (item.item_type === ItemType.GAME) {
          const gamePlatformData: any = (await this.action.getManyAction('game_platform', 1, 1, {
            game_id: item.game_id,
            console_id: item.console_id
          })).data?.data?.[0]
          await this.action.updateAction('game_platform', gamePlatformData.id, { stock: gamePlatformData.stock + item.quantity })
        }
      }
    }

    return this.action.updateAction('order', uuid, { status: OrderStatus.CANCELLED })
  }

  remove(uuid: string) {
    return this.action.deleteAction('order', uuid)
  }
}
