import { PaginationDto } from "src/common/dto/pagination.dto";
import { Genre } from "../enums/genre.enum";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { Transform, Type } from "class-transformer";

export class FilterGameDto extends PaginationDto {
    @IsOptional()
    @IsString()
    title?: string

    @IsOptional()
    @IsEnum(Genre)
    genre?: Genre

    @IsOptional()
    @IsString()
    platform?: string
    
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    min_price?: number

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    max_price?: number

    @IsBoolean()
    @IsOptional()
    @Transform(({value}) => {
        if (value === 'true' || value === true) return true
        if (value === 'false' || value === false) return false
        return value
    })
    available?: boolean
}