import {DataAPIClient} from '@datastax/astra-db-ts';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import fs from 'fs';
import pdf from 'pdf-parse';
import OpenAI from 'openai';

import "dotenv/config";

type SimilarityMetric = "dot_product" | "cosine" | "euclidean";

const {ASTRA_DB_NAMESPACE, ASTRA_DB_COLLECTION, ASTRA_DB_API_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN, OPENAI_API_KEY} = process.env;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const bkdata = [
    { type: 'url', source: 'https://kiranbk.com/' },
    { type: 'url', source: 'https://github.com/bk-kiran' },
    { type: 'pdf', source: './resume.pdf' },
    { type: 'text', source: './about-me.md' }
];

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, {namespace: ASTRA_DB_NAMESPACE});

const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 512, chunkOverlap: 100 });

const createCollection = async (similarityMetric: SimilarityMetric = "cosine") => {
    try {
        // Try to drop existing collection first
        await db.dropCollection(ASTRA_DB_COLLECTION);
        console.log('Dropped existing collection');
    } catch (e) {
        console.log('No existing collection to drop');
    }

    const res = await db.createCollection(ASTRA_DB_COLLECTION, {
        vector: {
            dimension: 1536,
            metric: similarityMetric
        }
    });

    console.log('✓ Collection created:', res);
}

async function extractPdfText(pdfPath: string): Promise<string> {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    return data.text;
}

const scrapeWebsite = async (url: string) => {
    const loader = new PuppeteerWebBaseLoader(url, {
        launchOptions: { 
            headless: true 
        },
        gotoOptions: {
            waitUntil: 'domcontentloaded',
        },
        evaluate: async (page, browser) => {
            const res = await page.evaluate(() => document.body.innerHTML)
            await browser.close();
            return res;
        }
    });

    return (await loader.scrape())?.replace(/<[^>]*>?/gm, ' ')
}

const loadSampleData = async () => {
    // First, ensure collection exists with proper config
    await createCollection("cosine");
    
    const collection = db.collection(ASTRA_DB_COLLECTION);
    let totalChunks = 0;

    for await (const item of bkdata) {
        let content: string;
        
        console.log(`Processing ${item.type}: ${item.source}...`);
        
        if (item.type === 'text') {
            content = fs.readFileSync(item.source, 'utf-8');
        } else if (item.type === 'pdf') {
            content = await extractPdfText(item.source);
        } else if (item.type === 'url') {
            content = await scrapeWebsite(item.source);
        } else {
            console.warn(`Unknown type: ${item.type}, skipping...`);
            continue;
        }

        const chunks = await splitter.splitText(content);
        console.log(`  Split into ${chunks.length} chunks`);
        
        for (const chunk of chunks) {
            const embedding = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: chunk,
                encoding_format: 'float'
            });

            const vector = embedding.data[0].embedding;

            const res = await collection.insertOne({
                $vector: vector,
                text: chunk,
                source: item.source,
                type: item.type
            });

            totalChunks++;
        }
        
        console.log(`✓ Completed ${item.type}: ${item.source}`);
    }
    
    console.log(`\n✅ Successfully loaded ${totalChunks} chunks into the database!`);
};

loadSampleData().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
});