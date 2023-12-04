import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { LangchainController } from './langchain.controller';
import { LangchainService } from './langchain.service';
import { RetrieverService } from './retriever.service';

@Module({
  imports: [ConfigModule],
  controllers: [LangchainController],
  providers: [LangchainService, RetrieverService],
})
export class LangchainModule {}
