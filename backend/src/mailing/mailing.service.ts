import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailingService {
    private readonly logger = new Logger(MailingService.name);
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        const host = this.configService.get('SMTP_HOST');
        const port = Number(this.configService.get('SMTP_PORT', 587));
        const user = this.configService.get('SMTP_USER');
        const pass = this.configService.get('SMTP_PASS');
        // Ensure secure is a boolean, as env vars are strings
        const secure = String(this.configService.get('SMTP_SECURE', 'false')).toLowerCase() === 'true';

        this.logger.log(`Initializing SMTP with ${host}:${port} (Secure: ${secure}, User: ${user})`);

        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: { user, pass },
            // Add timeouts to prevent hanging indefinitely
            connectionTimeout: 10000, // 10 seconds
            greetingTimeout: 10000,
            socketTimeout: 15000,
        });

        // Verify connection early to catch config errors
        this.transporter.verify((error) => {
            if (error) {
                this.logger.error('SMTP Connection Error during verification:', error.message);
            } else {
                this.logger.log('SMTP Server is ready to take messages');
            }
        });
    }

    async sendOrderNotification(order: any) {
        const recipients = ['sifat.sai3@gmail.com'];
        const subject = `New Order #${order.id} - Petal & Pearl`;

        // Use SMTP_USER for from field if SMTP_FROM is not set, as Gmail requires this
        const fromEmail = this.configService.get('SMTP_FROM') ||
            `"Petal & Pearl" <${this.configService.get('SMTP_USER')}>`;

        const itemsList = order.items.map((item: any) =>
            `<li>${item.name} x ${item.quantity} - ৳${item.price * item.quantity}</li>`
        ).join('');

        const html = `
            <div style="font-family: sans-serif; color: #333;">
                <h1>New Order Received!</h1>
                <p>A new order has been placed on Petal & Pearl.</p>
                <hr />
                <h2>Order Details:</h2>
                <ul>
                    <li><strong>Order ID:</strong> #${order.id}</li>
                    <li><strong>Customer Name:</strong> ${order.customerName}</li>
                    <li><strong>Email:</strong> ${order.customerEmail}</li>
                    <li><strong>Phone:</strong> ${order.customerPhone}</li>
                    <li><strong>Total Amount:</strong> ৳${order.totalAmount}</li>
                </ul>
                <h3>Items:</h3>
                <ul>${itemsList}</ul>
                <p>Please log in to the admin panel to process this order.</p>
            </div>
        `;

        try {
            this.logger.log(`Attempting to send order notification for #${order.id} to ${recipients}...`);
            await this.transporter.sendMail({ from: fromEmail, to: recipients.join(', '), subject, html });
            this.logger.log(`Order notification email sent successfully for order #${order.id}`);
        } catch (error) {
            this.logger.error(`CRITICAL: SMTP Failure for order #${order.id}. Check your SMTP_USER/PASS. Error: ${error.message}`);
        }
    }

    // async sendOrderConfirmation(order: any) {
    //     const recipients = [order.customerEmail, 'sifat.sai3@gmail.com'];
    //     const subject = `Order Confirmed #${order.id} - Petal & Pearl`;

    //     const fromEmail = this.configService.get('SMTP_FROM') ||
    //         `"Petal & Pearl" <${this.configService.get('SMTP_USER')}>`;

    //     const html = `
    //         <div style="font-family: sans-serif; color: #333;">
    //             <h1>Order Confirmed!</h1>
    //             <p>Hello ${order.customerName}, your order #${order.id} has been confirmed and is being processed.</p>
    //             <p><strong>Tracking Number:</strong> ${order.courierConsignmentId || 'Pending'}</p>
    //             <p>We will notify you once it has been shipped. Thank you for shopping with Petal & Pearl!</p>
    //         </div>
    //     `;

    //     try {
    //         this.logger.log(`Sending confirmation email for #${order.id} to ${order.customerEmail}...`);
    //         await this.transporter.sendMail({ from: fromEmail, to: recipients.join(', '), subject, html });
    //         this.logger.log(`Order confirmation email sent for order #${order.id}`);
    //     } catch (error) {
    //         this.logger.error(`Failed to send confirmation email for order #${order.id}: ${error.message}`);
    //     }
    // }
}
