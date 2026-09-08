import { Transform, Type } from "class-transformer";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";

export class FilterConsoleDto extends PaginationDto {
    @IsString()
    @IsOptional()
    name?: string

    @IsString()
    @IsOptional()
    brand?: string

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