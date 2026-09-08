import { PaginationDto } from "src/common/dto/pagination.dto";
import { Role } from "../enums/role.enum";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class FilterUserDto extends PaginationDto {
    @IsOptional()
    @IsString()
    name?: string

    @IsOptional()
    @IsString()
    email?: string

    @IsOptional()
    @IsString()
    city?: string

    @IsOptional()
    @IsEnum(Role)
    role?: Role
}