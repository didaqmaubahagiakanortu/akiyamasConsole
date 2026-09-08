import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes, ValidationPipe, Req, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/user/enums/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FilterOrderDto } from './dto/filter-order.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({transform: true}))
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Req() req) {
    const userId = (req.user.role === Role.ADMIN && createOrderDto.user_id) ?
    createOrderDto.user_id : +req.user.id
    
    return this.orderService.create(createOrderDto, userId);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  findMine(@Req() req, @Query() paginationDto: PaginationDto) {
    return this.orderService.findMine(+req.user.id, paginationDto)
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @Get()
  findAll(@Query() filterOrderDto: FilterOrderDto) {
    return this.orderService.findAll(filterOrderDto);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.orderService.findOne(id, req.user);
  }

  @UseGuards(AuthGuard)
  @Patch('cancel/:id')
  cancel(@Param('id') id: string) {
    return this.orderService.cancel(id)
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe({transform: true}))
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
