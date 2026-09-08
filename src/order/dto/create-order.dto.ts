import { ArrayNotEmpty, IsArray, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator"
import { OrderStatus } from "../enums/order-status.enum"
import { OrderItemDto } from "./order-item.dto"
import { Type } from "class-transformer"

export class CreateOrderDto {

    @IsNumber()
    @IsOptional()
    user_id?: number

    @IsDate({message: 'Start date must be a date'})
    @IsNotEmpty({message: 'Start date is required'})
    @Type(() => Date)
    start_date: Date

    @IsDate({message: 'End date must be a date'})
    @IsNotEmpty({message: 'End date is required'})
    @Type(() => Date)
    end_date: Date

    @IsString({message: 'Shipping address must be a string'})
    @IsNotEmpty({message: 'Shipping address is required'})
    shipping_address: string

    @Type(() => OrderItemDto)
    @ValidateNested({ each: true })
    @IsArray()
    @ArrayNotEmpty({message: 'Items must not be empty'})
    items: OrderItemDto[]
}
