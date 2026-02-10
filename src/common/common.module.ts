import { Global, Module } from '@nestjs/common';
import { BcryptService } from './services/bcrypt.service';

@Global()
@Module({
    providers: [
        {
            provide: 'HashingService',
            useClass: BcryptService,
        },
    ],
    exports: ['HashingService'],
})
export class CommonModule { }
