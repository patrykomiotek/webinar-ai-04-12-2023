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

  async createEmbeddings() {
    const data = fs.readFileSync(
      path.join(process.cwd(), './backend/src/app/langchain/scimba.txt'),
      {
        encoding: 'utf8',
        flag: 'r',
      }
    );
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      separators: ['\n\n', '\n', ' ', ''],
      chunkOverlap: 50, // 10%
    });
    const output = await splitter.createDocuments([data]);

    const password = this.configService.get<string>('DATABASE_PASSWORD');
    const sbUrl = this.configService.get<string>('SUPABASE_URL');
    const sbApiKey = this.configService.get<string>('SUPABASE_API_KEY');
    const openAIApiKey = this.configService.get<string>('OPEN_AI_API_KEY');

    const sbClient = createClient(sbUrl, sbApiKey);

    await SupabaseVectorStore.fromDocuments(
      output,
      new OpenAIEmbeddings({ openAIApiKey }),
      {
        client: sbClient,
        tableName: 'documents',
      }
    );
  }

  async prepareTweet() {
    const openAIApiKey = this.configService.get<string>('OPEN_AI_API_KEY');

    const llm = new ChatOpenAI({ openAIApiKey, temperature: 0.5 });
    const tweetTemplate =
      'Generate a promotional tweet for a online course, this product contains description: {description}';
    const tweetPrompt = PromptTemplate.fromTemplate(tweetTemplate);

    const tweetChain = tweetPrompt.pipe(llm);

    const response = await tweetChain.invoke({
      description: 'React.js course',
    });

    return { message: response.content };
  }

  buildStandaloneQuestionPrompt() {
    const standaloneQuestionText =
      'Given a question, convert it to standalone question. Question: {question} standalone question:';

    const standaloneQuestionPrompt = PromptTemplate.fromTemplate(
      standaloneQuestionText
    );

    return standaloneQuestionPrompt;
  }

  async standaloneQuestion() {
    const standaloneQuestionPrompt = this.buildStandaloneQuestionPrompt();

    const openAIApiKey = this.configService.get<string>('OPEN_AI_API_KEY');
    const llm = new ChatOpenAI({ openAIApiKey });
    const standaloneQuestionChain = standaloneQuestionPrompt.pipe(llm);

    // new method
    const response = await standaloneQuestionChain.invoke({
      question:
        'What are technical requirements from running Scrimba? I only have a very old laptop which is not that powerful.',
    });

    return { message: response.content };
  }

  private combineDocuments(docs) {
    return docs.map((doc) => doc.pageContent).join('\n\n');
  }

  buildRetriever() {
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

    const retriever = vectorStore.asRetriever();

    return retriever;
  }

  async embeddingsForStandaloneQuestion() {
    const retriever = this.buildRetriever();

    const response = await retriever.invoke(
      'Will Scrimba work on an old laptop'
    );

    return { message: this.combineDocuments(response) };
  }

  async retrieveWithParser() {
    const retriever = this.buildRetriever();
    const standaloneQuestionPrompt = this.buildStandaloneQuestionPrompt();

    const openAIApiKey = this.configService.get<string>('OPEN_AI_API_KEY');
    const llm = new ChatOpenAI({ openAIApiKey });
    const standaloneQuestionChain = standaloneQuestionPrompt.pipe(llm);

    const chain = standaloneQuestionChain
      .pipe(new StringOutputParser())
      .pipe(retriever)
      .pipe(this.combineDocuments);

    const response = await chain.invoke({
      question:
        'What are technical requirements for running Scrimba? I only have a very old laptop which is not that powerful',
    });

    return { message: response };
  }
}
