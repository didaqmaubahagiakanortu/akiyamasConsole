import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"
import { PaymentStatus } from "../enums/payment-status.enum"
import { Transform } from "class-transformer"

export class CreateTransactionDto {
    @IsString({ message: 'Order ID must be a string' })
    @IsNotEmpty({ message: 'Order ID is required' })
    order_id: string

    @IsString({ message: 'Notes must be a string' })
    @IsOptional()
    notes: string
}
