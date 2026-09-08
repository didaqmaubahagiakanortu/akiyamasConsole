import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ActionService } from 'src/action/action.service';
import { PaymentStatus } from './enums/payment-status.enum';
import { SupabaseService } from 'src/supabase/supabase.service';
import { buildResponse } from 'src/common/utils/response.util';
import { FilterTransactionDto } from './dto/filter-transaction.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { OrderStatus } from 'src/order/enums/order-status.enum';

@Injectable()
export class TransactionService {
  constructor(
    private readonly action: ActionService,
    private readonly supabase: SupabaseService
  ) { }

  async create(createTransactionDto: CreateTransactionDto) {
    const { order_id, notes } = createTransactionDto

    const order: any = ((await this.action.getAction('order', 'id', order_id)).data)
    return this.action.createAction('transaction', {
      order_id,
      total_price: order.total_price,
      status: PaymentStatus.UNPAID,
      notes: notes || ''
    })
  }

  findMine(user_id: number, paginationDto: PaginationDto) {
    const { page, limit } = paginationDto
    return this.action.getManyAction('transaction', page, limit, { 'order.user_id': user_id }, '*, order(*, user!inner(*), order_item(*))')
  }

  findAll(filterTransaction: FilterTransactionDto) {
    const { page, limit, ...filters } = filterTransaction
    return this.action.getManyAction('transaction', page, limit, filters, '*, order(*, order_item(*))')
  }

  findOne(uuid: string) {
    return this.action.getAction('transaction', 'id', uuid, '*, order(*, order_item(*))')
  }

  async update(uuid: string, updateTransactionDto: UpdateTransactionDto) {
    const { order_id, status, notes } = updateTransactionDto
    const order: any = order_id ? ((await this.action.getAction('order', 'id', order_id)).data) : null

    return this.action.updateAction('transaction', uuid, {
      ...(order_id && { order_id }),
      ...(order_id && { total_price: order.total_price }),
      ...(status && { status }),
      ...(notes && { notes })
    })
  }

  async remove(uuid: string) {
    return this.action.deleteAction('transaction', uuid)
  }

  async uploadProof(uuid: string, file: Express.Multer.File) {
    try {
      const transaction: any = (await this.findOne(uuid)).data
      if (!transaction) {
        throw new HttpException(
          buildResponse(HttpStatus.NOT_FOUND, `GET WHERE UUID = ${uuid}`, 'transaction', null, `Data transaction WHERE UUID = ${uuid} not found`),
          HttpStatus.NOT_FOUND
        )
      }

      const order: any = (await this.action.getAction('order', 'id', transaction.order_id)).data
      if (!order) {
        throw new HttpException(
          buildResponse(HttpStatus.NOT_FOUND, `GET WHERE ID = ${transaction.order_id}`, 'order', null, `Data order WHERE ID = ${transaction.order_id} not found`),
          HttpStatus.NOT_FOUND
        )
      }

      if ((transaction.status !== PaymentStatus.UNPAID && transaction.status !== PaymentStatus.REJECTED) && order.status !== OrderStatus.PENDING_PAYMENT) {
        throw new HttpException(
          buildResponse(HttpStatus.BAD_REQUEST, 'UPLOAD PROOF', 'transaction', null, `Transaction WHERE UUID = ${uuid} is not pending`),
          HttpStatus.BAD_REQUEST
        )
      }

      const supabase = this.supabase.getClient()
      const fileExt = file.originalname.split('.').pop()?.toLowerCase() || ''
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`
      const filePath = `proofs/${fileName}`

      let contentType = file.mimetype
      if (!contentType || contentType === 'application/octet-stream') {
        const mimeTypes: Record<string, string> = {
          png: 'image/png',
          jpg: 'image/jpg',
          jpeg: 'image/jpeg',
          webp: 'image/webp'
        }
        contentType = mimeTypes[fileExt] || 'image/jpeg'
      }

      const { data, error } = await supabase.storage.from('payment-proofs').upload(filePath, file.buffer, {
        contentType,
        upsert: false
      })

      if (error) throw error

      const url = supabase.storage.from('payment-proofs').getPublicUrl(filePath)

      await this.action.updateAction('order', order.id, {
        status: OrderStatus.PAID
      })

      return this.action.updateAction('transaction', uuid, {
        payment_proof: url.data.publicUrl,
        status: PaymentStatus.PENDING,
      })
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        buildResponse(HttpStatus.BAD_REQUEST, 'UPLOAD PROOF', 'transaction', null, error.message || JSON.stringify(error)),
        HttpStatus.BAD_REQUEST);
    }

  }

  async verify(uuid: string, notes?: string) {
    const transaction: any = (await this.action.getAction('transaction', 'id', uuid)).data
    const order: any = (await this.action.getAction('order', 'id', transaction.order_id)).data

    if (transaction.status !== PaymentStatus.PENDING && order.status !== OrderStatus.PAID) {
      throw new HttpException(
        buildResponse(HttpStatus.BAD_REQUEST, 'VERIFY PAYMENT', 'transaction', null, `Transaction WHERE UUID = ${uuid} is not pending`),
        HttpStatus.BAD_REQUEST
      )
    }

    await this.action.updateAction('order', order.id, {
      status: OrderStatus.PROCESSING
    })

    return this.action.updateAction('transaction', uuid, {
      status: PaymentStatus.VERIFIED,
      notes: notes || '',
      verified_at: new Date().toISOString()
    })
  }

  async reject(uuid: string, notes?: string) {
    const transaction: any = (await this.action.getAction('transaction', 'id', uuid)).data
    const order: any = (await this.action.getAction('order', 'id', transaction.order_id)).data

    if (transaction.status !== PaymentStatus.PENDING && order.status !== OrderStatus.PAID) {
      throw new HttpException(
        buildResponse(HttpStatus.BAD_REQUEST, 'REJECT PAYMENT', 'transaction', null, `Transaction WHERE UUID = ${uuid} is not pending`),
        HttpStatus.BAD_REQUEST
      )
    }

    await this.action.updateAction('order', order.id, {
      status: OrderStatus.PENDING_PAYMENT
    })

    return this.action.updateAction('transaction', uuid, {
      status: PaymentStatus.REJECTED,
      notes: notes || ''
    })
  }
}
