import { Controller, Get, Post, Body, Param, Patch, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    create(@Body() body: any) {
        // Extract userId before DTO validation
        const userId = body.userId || 1;

        // Remove userId from body to pass DTO validation
        const { userId: _, ...createOrderDto } = body;

        return this.ordersService.create(createOrderDto as CreateOrderDto, userId);
    }

    @Get()
    findAll() {
        return this.ordersService.findAll();
    }

    @Get('user/:userId')
    findByUser(@Param('userId') userId: string) {
        return this.ordersService.findByUser(+userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ordersService.findOne(+id);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.ordersService.updateStatus(+id, status);
    }

    @Patch(':id/payment-status')
    updatePaymentStatus(@Param('id') id: string, @Body('paymentStatus') paymentStatus: string) {
        return this.ordersService.updatePaymentStatus(+id, paymentStatus);
    }

    @Post(':id/confirm')
    confirmOrder(@Param('id') id: string) {
        return this.ordersService.confirmOrder(+id);
    }
}
