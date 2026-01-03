import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { SteadfastService } from '../steadfast/steadfast.service';

import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
        private notificationsService: NotificationsService,
        private steadfastService: SteadfastService,

    ) { }

    async create(createOrderDto: CreateOrderDto, userId: number) {
        // Calculate total amount
        const totalAmount = createOrderDto.items.reduce(
            (sum, item) => sum + (item.price * item.quantity),
            0
        );

        // Determine initial status based on payment method
        const status = createOrderDto.paymentMethod === 'cash_on_delivery' ? 'confirmed' : 'pending';

        const order = this.ordersRepository.create({
            ...createOrderDto,
            userId,
            totalAmount,
            status,
            paymentStatus: 'pending',
            transactionId: createOrderDto.transactionId || null,
        });

        const savedOrder = await this.ordersRepository.save(order);

        // Create notification for admin
        await this.notificationsService.create({
            message: `New order #${savedOrder.id} placed by ${savedOrder.customerName}`,
            orderId: savedOrder.id,
        });

        return savedOrder;
    }

    async findAll() {
        return this.ordersRepository.find({
            relations: ['user'],
            order: { createdAt: 'DESC' }
        });
    }

    async findByUser(userId: number) {
        return this.ordersRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' }
        });
    }

    async findOne(id: number) {
        return this.ordersRepository.findOne({
            where: { id },
            relations: ['user']
        });
    }

    async updateStatus(id: number, status: string) {
        await this.ordersRepository.update(id, { status: status as any });
        return this.findOne(id);
    }

    async updatePaymentStatus(id: number, paymentStatus: string) {
        await this.ordersRepository.update(id, { paymentStatus: paymentStatus as any });
        return this.findOne(id);
    }

    async count() {
        return this.ordersRepository.count();
    }

    async getTotalRevenue() {
        const result = await this.ordersRepository
            .createQueryBuilder('order')
            .select('SUM(order.totalAmount)', 'total')
            .where('order.status != :status', { status: 'cancelled' })
            .getRawOne();

        return parseFloat(result.total) || 0;
    }

    async confirmOrder(orderId: number) {
        const order = await this.ordersRepository.findOne({ where: { id: orderId } });

        if (!order) throw new Error('Order not found');

        // Send to Steadfast
        const steadfastResponse = await this.steadfastService.createParcel(order);

        order.courier = 'steadfast';
        order.courierConsignmentId = steadfastResponse.consignment_id;
        order.courierStatus = 'created';
        order.status = 'confirmed';

        return this.ordersRepository.save(order);
    }

}
