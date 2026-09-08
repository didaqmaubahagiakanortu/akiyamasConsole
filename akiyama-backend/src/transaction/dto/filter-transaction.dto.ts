import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaymentStatus } from "../enums/payment-status.enum";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { Transform } from "class-transformer";

export class FilterTransactionDto extends PaginationDto {
    @Transform(({value}) => typeof value === 'string' ? 
    (value.toLowerCase()) as PaymentStatus :
    value
    )
    @IsEnum(PaymentStatus)
    @IsOptional()
    status: PaymentStatus

    @IsString()
    @IsOptional()
    notes: string
}