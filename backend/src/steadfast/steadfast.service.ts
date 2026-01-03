import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class SteadfastService {
    private baseUrl: string;
    private apiKey: string;
    private secret: string;

    constructor(private config: ConfigService) {
        this.baseUrl = this.config.get<string>('STEADFAST_BASE_URL') || '';
        this.apiKey = this.config.get<string>('STEADFAST_API_KEY') || '';
        this.secret = this.config.get<string>('STEADFAST_SECRET') || '';
    }

    async createParcel(order: Order) {
        const payload = {
            invoice: `ORD-${order.id}`,
            recipient_name: order.customerName,
            recipient_phone: order.customerPhone,
            recipient_address: order.shippingAddress,
            cod_amount:
                order.paymentMethod === 'cash_on_delivery'
                    ? Number(order.totalAmount)
                    : 0,
        };

        try {
            const res = await axios.post(
                `${this.baseUrl}/create_order`,
                payload,
                {
                    headers: {
                        'Api-Key': this.apiKey,
                        'Secret-Key': this.secret,
                        'Content-Type': 'application/json',
                    },
                    timeout: 10000, // 10s timeout
                },
            );

            if (res.data?.status !== 200) {
                throw new Error(res.data?.message || 'Steadfast API returned an error');
            }

            return res.data;
        } catch (error: any) {
            console.error('Steadfast Error:', error.message);
            if (error.response?.status >= 500) {
                throw new Error('Steadfast Courier service is currently unavailable (Server Error)');
            }
            if (error.code === 'ECONNABORTED') {
                throw new Error('Connection to Steadfast timed out. Please try again later.');
            }
            throw new Error(error.response?.data?.message || error.message || 'Failed to connect to Steadfast');
        }
    }

    async track(consignmentId: string) {
        const res = await axios.get(
            `${this.baseUrl}/track/${consignmentId}`,
            {
                headers: {
                    'Api-Key': this.apiKey,
                    'Secret-Key': this.secret,
                },
            },
        );
        return res.data;
    }

}
