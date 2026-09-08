import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { Genre } from "../enums/genre.enum";
import { PlatformAvailabilityDto } from "./platform-availability.dto";
import { Type } from "class-transformer";

export class CreateGameDto {
    @IsString({message: 'Title must be a string'})
    @IsNotEmpty({message: 'Title is required'})
    title: string;

    @IsEnum(Genre, {message: 'Genre must be a valid genre'})
    @IsNotEmpty({message: 'Genre is required'})
    genre: Genre;
    
    @IsArray({message: 'Platform must be an array'})
    @ArrayNotEmpty({message: 'Platform is required'})
    @ValidateNested({ each: true })
    @Type(() => PlatformAvailabilityDto)
    platforms: PlatformAvailabilityDto[];
}
