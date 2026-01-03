import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column('jsonb')
    items: Array<{
        productId: number;
        name: string;
        price: number;
        quantity: number;
        image: string;
    }>;

    @Column('decimal', { precision: 10, scale: 2 })
    totalAmount: number;

    @Column({ default: 'pending' })
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

    @Column({ default: 'pending' })
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';

    @Column({ type: 'varchar', nullable: true })
    transactionId: string | null;

    @Column()
    shippingAddress: string;

    @Column()
    customerName: string;

    @Column()
    customerEmail: string;

    @Column()
    customerPhone: string;

    @Column({ nullable: true })
    paymentMethod: 'cash_on_delivery' | 'bkash' | 'nagad' | 'bank_transfer';

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'varchar', nullable: true })
    courier: 'steadfast' | null;

    @Column({ type: 'varchar', nullable: true })
    courierConsignmentId: string | null;

    @Column({ type: 'varchar', nullable: true })
    courierStatus: string | null;

}
