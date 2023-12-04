import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LangchainModule } from './langchain/langchain.module';

@Module({
  imports: [ConfigModule.forRoot(), LangchainModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
