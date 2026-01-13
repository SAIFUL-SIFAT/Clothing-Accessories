import { Controller, Get, UseGuards } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppService } from './app.service';
import { ProductsService } from './products/products.service';
import { UsersService } from './users/users.service';
import { OrdersService } from './orders/orders.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
    private readonly ordersService: OrdersService,
    private readonly dataSource: DataSource,
  ) { }

  @Get('health')
  async ping() {
    await this.dataSource.query('SELECT 1');
    return 'OK';
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Secure this in production with @UseGuards(JwtAuthGuard)
  @Get('dashboard/stats')
  async getDashboardStats() {
    const productsCount = await this.productsService.count();
    const usersCount = await this.usersService.count();
    const ordersCount = await this.ordersService.count();
    const totalRevenue = await this.ordersService.getTotalRevenue();

    return {
      products: productsCount,
      users: usersCount,
      orders: ordersCount,
      sales: ordersCount, // Using orders count as sales count
      earnings: totalRevenue,
      chartData: [
        { name: 'Jan', sales: 4000 },
        { name: 'Feb', sales: 3000 },
        { name: 'Mar', sales: 2000 },
        { name: 'Apr', sales: 2780 },
        { name: 'May', sales: 1890 },
        { name: 'Jun', sales: 2390 },
        { name: 'Jul', sales: 3490 },
      ]
    };
  }
}
