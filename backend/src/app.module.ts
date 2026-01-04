// import { Module } from '@nestjs/common';
// import { join } from 'path';
// import { ServeStaticModule } from '@nestjs/serve-static';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { ProductsModule } from './products/products.module';
// import { Product } from './products/entities/product.entity';
// import { UsersModule } from './users/users.module';
// import { User } from './users/entities/user.entity';
// import { OrdersModule } from './orders/orders.module';
// import { Order } from './orders/entities/order.entity';
// import { NotificationsModule } from './notifications/notifications.module';
// import { Notification } from './notifications/entities/notification.entity';

// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       isGlobal: true,
//     }),
//     // 2. Use forRootAsync to ensure env vars are ready
//     TypeOrmModule.forRootAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: (configService: ConfigService) => {
//         const dbUrl = configService.get<string>('DATABASE_URL');

//         // console.log('Database URL available:', !!dbUrl);

//         return {
//           type: 'postgres',
//           url: dbUrl,
//           ...(dbUrl
//             ? {}
//             : {
//               host: configService.get<string>('DB_HOST', 'localhost'),
//               port: configService.get<number>('DB_PORT', 5432),
//               username: configService.get<string>('DB_USERNAME', 'postgres'),
//               password: configService.get<string>('DB_PASSWORD', 'postgres123'),
//               database: configService.get<string>('DB_NAME', 'petal_pearl'),
//             }),
//           entities: [Product, User, Order, Notification],
//           synchronize: configService.get<string>('NODE_ENV') !== 'production',
//           ssl: !!dbUrl || configService.get<string>('DB_SSL') === 'true',
//           extra: {
//             ssl: (!!dbUrl || configService.get<string>('DB_SSL') === 'true')
//               ? { rejectUnauthorized: false }
//               : null,
//           },
//         };
//       },
//     }),
//     ServeStaticModule.forRoot({
//       rootPath: join(__dirname, '..', 'public'),
//       serveRoot: '/',
//     }),
//     ProductsModule,
//     UsersModule,
//     OrdersModule,
//     NotificationsModule,
//   ],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule { }


import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { NotificationsModule } from './notifications/notifications.module';

import { Product } from './products/entities/product.entity';
import { User } from './users/entities/user.entity';
import { Order } from './orders/entities/order.entity';
import { Notification } from './notifications/entities/notification.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.production'
          : '.env',
    }),

    // ✅ DATABASE CONFIG GOES HERE
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get<string>('DATABASE_URL');
        const nodeEnv = configService.get<string>('NODE_ENV');

        console.log(
          'Environment:', nodeEnv,
          '| DB Connection:', dbUrl ? 'Using URL' : 'Using individual variables',
        );

        return {
          type: 'postgres',
          url: dbUrl?.replace('postgresql://', 'postgres://'),
          ...(dbUrl ? {} : {
            host: configService.get<string>('DB_HOST', 'localhost'),
            port: configService.get<number>('DB_PORT', 5432),
            username: configService.get<string>('DB_USERNAME', 'postgres'),
            password: configService.get<string>('DB_PASSWORD', 'postgres123'),
            database: configService.get<string>('DB_NAME', 'petal_pearl'),
          }),
          entities: [Product, User, Order, Notification],
          schema: 'public', // ✅ Explicitly force public schema for Neon DB
          synchronize: true, // Set to true to ensure tables are created in Neon during test
          ssl: nodeEnv === 'production' || !!dbUrl,
          extra: {
            ssl: (nodeEnv === 'production' || !!dbUrl)
              ? { rejectUnauthorized: false }
              : null,
            family: 4,
            keepAlive: true,
          },
        };
      },
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),

    AuthModule,
    ProductsModule,
    UsersModule,
    OrdersModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
