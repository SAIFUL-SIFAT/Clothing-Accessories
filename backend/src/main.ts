import * as crypto from 'crypto';

// Polyfill for Node.js < 20 where crypto is not global
if (!global.crypto) {
  (global as any).crypto = crypto;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';

async function bootstrap() {
  // console.log('DB URL check:', process.env.DATABASE_URL ? 'Variable found' : 'VARIABLE NOT FOUND');
  const bcrypt = require('bcrypt');
  bcrypt.hash('admin@123', 10).then(console.log);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Security
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));
  const frontendUrl = process.env.FRONTEND_URL;
  app.enableCors({
    origin: [
      frontendUrl,
      'http://localhost:8080',
      'http://localhost:5173',
      'http://localhost:3000',
    ].filter((origin): origin is string => !!origin),
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  await app.listen(process.env.PORT ?? 3000);
  // await app.listen(process.env.PORT || 10000, '0.0.0.0');
  // console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
