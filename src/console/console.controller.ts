import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes, ValidationPipe, Query } from '@nestjs/common';
import { ConsoleService } from './console.service';
import { CreateConsoleDto } from './dto/create-console.dto';
import { UpdateConsoleDto } from './dto/update-console.dto';
import { FilterConsoleDto } from './dto/filter-console.dto';
import { Role } from 'src/user/enums/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('console')
export class ConsoleController {
  constructor(private readonly consoleService: ConsoleService) { }

  @Roles(Role.ADMIN)
  @UsePipes(new ValidationPipe())
  @UseGuards(AuthGuard, RolesGuard)
  @Post()
  create(@Body() createConsoleDto: CreateConsoleDto) {
    return this.consoleService.create(createConsoleDto);
  }

  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get()
  findAll(@Query() filterConsoleDto: FilterConsoleDto) {
    return this.consoleService.findAll(filterConsoleDto);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.consoleService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @UsePipes(new ValidationPipe())
  @UseGuards(AuthGuard, RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConsoleDto: UpdateConsoleDto) {
    return this.consoleService.update(id, updateConsoleDto);
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.consoleService.remove(id);
  }
}
