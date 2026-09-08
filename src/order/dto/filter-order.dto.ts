import { IsEnum, IsOptional, IsString } from "class-validator";
import { ItemType } from "../enums/item-type.enum";
import { OrderStatus } from "../enums/order-status.enum";
import { PaginationDto } from "src/common/dto/pagination.dto";

export class FilterOrderDto extends PaginationDto {
    @IsOptional()
    @IsString()
    user_name?: string

    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus

    @IsOptional()
    @IsEnum(ItemType)
    item_type?: ItemType
}