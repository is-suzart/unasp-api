import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { CommunityModule } from './modules/community/community.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'unasp',
      entities: [__dirname + '/**/*.orm-entity{.ts,.js}'],
      synchronize: false, // Desabilitado - use db:setup para criar tabelas
      logging: process.env.NODE_ENV === 'development',
    }),
    UserModule,
    AuthModule,
    CommunityModule,
    CommonModule,
  ],
})
export class AppModule {}
