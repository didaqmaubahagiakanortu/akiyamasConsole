import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateConsoleDto {
    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @IsString({ message: 'Brand must be a string' })
    @IsNotEmpty({ message: 'Brand is required' })
    brand: string;

    @IsNumber({}, { message: 'Price must be a number' })
    @IsNotEmpty({ message: 'Price is required' })
    price: number;

    @IsNumber({}, { message: 'Stock must be a number' })
    @IsNotEmpty({ message: 'Stock is required' })
    stock: number;
}
