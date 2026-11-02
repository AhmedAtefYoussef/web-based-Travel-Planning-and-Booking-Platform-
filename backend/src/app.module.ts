import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { SecurityModule } from './common/security/security.module';
import { DevAuthGuard } from './common/guards/dev-auth.guard';
import { ContractStubsModule } from './common/stubs/contract-stubs.module';
import { validateEnv } from './config/env.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'),
      }),
    }),
    SecurityModule,
    ContractStubsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: DevAuthGuard }],
})
export class AppModule {}
