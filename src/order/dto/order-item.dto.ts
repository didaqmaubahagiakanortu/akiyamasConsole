import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { ItemType } from "../enums/item-type.enum";
import { Transform, Type } from "class-transformer";

export class OrderItemDto {
    @Transform(({value}) => 
        typeof value === 'string' ? (value.toLowerCase() as ItemType) : value
    )
    @IsNotEmpty({message: 'Item type is required'})
    @IsEnum(ItemType, {message: 'Item type must be either console or game'})
    item_type: ItemType

    @IsString({message: 'Console ID must be a string'})
    @IsNotEmpty({message: 'Console ID is required'})
    console_id: string

    @IsString({message: 'Game ID must be a string'})
    @IsOptional()
    game_id?: string

    @IsNotEmpty({message: 'Quantity is required'})
    @IsNumber({}, {message: 'Quantity must be a number'})
    quantity: number
}