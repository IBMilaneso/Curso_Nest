import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config.js';
import { ClientesModule } from './clientes/clientes.module.js';
import { VehiculosModule } from './vehiculos/vehiculos.module.js';
import { OrdenesModule } from './ordenes/ordenes.module.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mssql',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        autoLoadEntities: true,
        synchronize: false,
        options: {
          encrypt: configService.get<boolean>('database.encrypt'),
          trustServerCertificate: configService.get<boolean>('database.trustServerCertificate'),
        },
      }),
    }),
    ClientesModule,
    VehiculosModule,
    OrdenesModule,
    AuthModule,
  ],
})
export class AppModule {}