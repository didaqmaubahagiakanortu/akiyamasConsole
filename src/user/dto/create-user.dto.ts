import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Role } from "../enums/role.enum";

export class CreateUserDto {

    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @IsEmail({}, { message: 'Email must be a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString({ message: 'Phone number must be a string' })
    @IsNotEmpty({ message: 'Phone number is required' })
    phone_number: string;

    @IsString({ message: 'Address must be a string' })
    @IsNotEmpty({ message: 'Address is required' })
    address: string;

    @IsString({ message: 'City must be a string' })
    @IsNotEmpty({ message: 'City is required' })
    city: string;

    @IsString({ message: 'Postal code must be a string' })
    @IsNotEmpty({ message: 'Postal code is required' })
    postal_code: string;

    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password is required' })
    password: string;

    @IsEnum(Role, { message: 'Role must be a valid role enum value (USER or ADMIN)' })
    @IsOptional()
    role?: Role;
}
