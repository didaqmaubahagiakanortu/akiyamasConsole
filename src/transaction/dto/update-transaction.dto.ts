import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionDto } from './create-transaction.dto';
import { PaymentStatus } from '../enums/payment-status.enum';
import { IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {
    @Transform(({value}) => typeof value === 'string' ? 
    (value.toLowerCase()) as PaymentStatus :
    value
    )
    @IsEnum(PaymentStatus)
    @IsOptional()
    status: PaymentStatus
}
