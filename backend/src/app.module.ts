import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
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
    ContractStubsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: DevAuthGuard }],
})
export class AppModule {}
