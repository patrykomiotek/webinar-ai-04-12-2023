import fs from 'fs';
import path from 'path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { createClient } from '@supabase/supabase-js';
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PromptTemplate } from 'langchain/prompts';
import { StringOutputParser } from 'langchain/schema/output_parser';
import { RetrieverService } from './retriever.service';
// import { VectorStoreRetriever } from 'langchain/dist/vectorstores/base';
import {
  RunnableSequence,
  RunnablePassthrough,
} from 'langchain/schema/runnable';

@Injectable()
export class LangchainService {
  constructor(
    private configService: ConfigService,
    private retrieverService: RetrieverService
  ) {}
}
