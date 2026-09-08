import { IsNotEmpty, IsNumber, IsUUID } from "class-validator";

export class PlatformAvailabilityDto {
    @IsUUID('all', {message: 'Console ID must be UUID'})
    @IsNotEmpty({message: 'Console ID is required'})
    console_id: string;

    @IsNumber({}, {message: 'Stock must be a number'})
    @IsNotEmpty({message: 'Stock is required'})
    stock: number;

    @IsNumber({}, {message: 'Price must be a number'})
    @IsNotEmpty({message: 'Price is required'})
    price: number;
}