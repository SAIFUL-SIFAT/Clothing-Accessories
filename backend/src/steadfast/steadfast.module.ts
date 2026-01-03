import { Module } from '@nestjs/common';
import { SteadfastService } from './steadfast.service';

@Module({
    providers: [SteadfastService],
    exports: [SteadfastService],
})
export class SteadfastModule { }
