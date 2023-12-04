import { Body, Controller, Get, Post } from '@nestjs/common';

import { LangchainService } from './langchain.service';

@Controller('langchain')
export class LangchainController {
  constructor(private readonly langchainService: LangchainService) {}
}
