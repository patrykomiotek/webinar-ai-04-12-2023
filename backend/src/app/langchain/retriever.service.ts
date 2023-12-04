import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

@Injectable()
export class RetrieverService {
  constructor(private configService: ConfigService) {}

  getRetriever() {
    const openAIApiKey = this.configService.get<string>('OPEN_AI_API_KEY');

    const embeddings = new OpenAIEmbeddings({ openAIApiKey });
    const sbUrl = this.configService.get<string>('SUPABASE_URL');
    const sbApiKey = this.configService.get<string>('SUPABASE_API_KEY');

    const sbClient = createClient(sbUrl, sbApiKey);

    const vectorStore = new SupabaseVectorStore(embeddings, {
      client: sbClient,
      tableName: 'documents',
      queryName: 'match_documents',
    });

    return vectorStore.asRetriever(); // knows to go to vector store
  }
}
