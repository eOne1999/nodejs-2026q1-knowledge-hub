import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ApiQuery } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: string,
  ) {
    return this.userService.findAll(+page, +limit, sortBy, order);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePasswordDto) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    this.userService.remove(id);
  }
}
