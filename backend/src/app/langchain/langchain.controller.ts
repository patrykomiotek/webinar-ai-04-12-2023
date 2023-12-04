import { Body, Controller, Get, Post } from '@nestjs/common';

import { LangchainService } from './langchain.service';

@Controller('langchain')
export class LangchainController {
  constructor(private readonly langchainService: LangchainService) {}

  @Get('create-embeddings')
  createEmbeddings() {
    return this.langchainService.createEmbeddings();
  }

  @Get('prepare-tweet')
  prepareTweet() {
    return this.langchainService.prepareTweet();
  }

  @Get('standalone-question')
  standaloneQuestion() {
    return this.langchainService.standaloneQuestion();
  }

  @Get('retrieve')
  retrieve() {
    return this.langchainService.embeddingsForStandaloneQuestion();
  }

  @Get('retrieve-with-parser')
  retrieveWithParser() {
    return this.langchainService.retrieveWithParser();
  }
}
