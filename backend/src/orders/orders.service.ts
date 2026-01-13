import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { SteadfastService } from '../steadfast/steadfast.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailingService } from '../mailing/mailing.service';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
        private notificationsService: NotificationsService,
        private steadfastService: SteadfastService,
        private mailingService: MailingService,
        private dataSource: DataSource,
    ) { }

    async create(createOrderDto: CreateOrderDto, userId?: number | null) {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Calculate total amount and check stock
            let totalAmount = 0;

            for (const item of createOrderDto.items) {
                // Fetch product with pessimistic write lock to avoid race conditions
                const product = await queryRunner.manager.findOne(Product, {
                    where: { id: item.productId },
                    lock: { mode: 'pessimistic_write' },
                });

                if (!product) {
                    throw new BadRequestException(`Product with ID ${item.productId} not found`);
                }

                if (product.stock < item.quantity) {
                    throw new BadRequestException(`Insufficient stock for product: ${product.name}. Available: ${product.stock}`);
                }

                // Decrement stock
                product.stock -= item.quantity;
                await queryRunner.manager.save(product);

                totalAmount += item.price * item.quantity;
            }

            // Determine initial status based on payment method
            const status = createOrderDto.paymentMethod === 'cash_on_delivery' ? 'confirmed' : 'pending';

            const order = queryRunner.manager.create(Order, {
                ...createOrderDto,
                userId,
                totalAmount,
                status,
                paymentStatus: 'pending',
                transactionId: createOrderDto.transactionId || null,
            });

            const savedOrder = await queryRunner.manager.save(order);

            // Create notification for admin
            await this.notificationsService.create({
                message: `New order #${savedOrder.id} placed by ${savedOrder.customerName}`,
                orderId: savedOrder.id,
            });

            await queryRunner.commitTransaction();

            // Send email notification to admins (async, don't block response)
            this.mailingService.sendOrderNotification(savedOrder).catch(err =>
                console.error('Failed to send order email notification:', err)
            );

            return savedOrder;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
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
        order.courierConsignmentId = steadfastResponse.consignment.consignment_id;
        order.courierStatus = steadfastResponse.consignment.status; // Should be 'in_review'
        order.status = 'confirmed';

        const savedOrder = await this.ordersRepository.save(order);

        // Send confirmation email to customer (async)
        this.mailingService.sendOrderConfirmation(savedOrder).catch(err =>
            console.error('Failed to send order confirmation email:', err)
        );

        return savedOrder;
    }

    async syncStatus(orderId: number) {
        const order = await this.ordersRepository.findOne({ where: { id: orderId } });
        if (!order || order.courier !== 'steadfast' || !order.courierConsignmentId) {
            return order;
        }

        try {
            const res = await this.steadfastService.getStatusByCid(order.courierConsignmentId);
            if (res.status === 200) {
                order.courierStatus = res.delivery_status;
                // Map statuses
                if (res.delivery_status === 'delivered') {
                    order.status = 'delivered';
                    order.paymentStatus = 'paid';
                } else if (res.delivery_status === 'cancelled') {
                    order.status = 'cancelled';
                }
                return await this.ordersRepository.save(order);
            }
        } catch (error) {
            console.error(`Failed to sync status for order ${order.id}:`, error.message);
        }
        return order;
    }

    async remove(id: number) {
        const order = await this.findOne(id);
        if (!order) throw new BadRequestException('Order not found');
        return this.ordersRepository.remove(order);
    }
}
