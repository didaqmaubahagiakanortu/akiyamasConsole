import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
    @IsNumber({}, { message: 'User ID must be a number' })
    @IsOptional()
    user_id?: number

    @IsEnum(OrderStatus)
    @IsOptional()
    status: OrderStatus
}
