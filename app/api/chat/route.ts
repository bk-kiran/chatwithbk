import OpenAI from "openai";
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { DataAPIClient } from "@datastax/astra-db-ts";

const {ASTRA_DB_NAMESPACE, ASTRA_DB_COLLECTION, ASTRA_DB_API_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN, OPENAI_API_KEY} = process.env;

const openAI = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, {namespace: ASTRA_DB_NAMESPACE});


export async function POST(req: Request) {
    try {
        const {messages} = await req.json()
        
        const latestMessage = messages[messages?.length - 1]?.parts?.[0]?.text || 
                             messages[messages?.length - 1]?.content || 
                             "";

        if (!latestMessage) {
            return new Response('No message content provided', { status: 400 });
        }

        let docContext = ""

        const embedding = await openAI.embeddings.create({
            model: "text-embedding-3-small",
            input: latestMessage,
            encoding_format: "float"
        })

        try {
            const collection = db.collection(ASTRA_DB_COLLECTION)
            
            // Use findOne with vector search - correct Astra DB syntax
            const documents = await collection.find(
                {},
                {
                    sort: { $vector: embedding.data[0].embedding },
                    limit: 10,
                    includeSimilarity: true
                }
            ).toArray();

            docContext = documents.map(doc => doc.text).join('\n\n');
        } catch (error) {
            console.error("Error querying Astra DB:", error);
            docContext = "No context available.";
        }

        const systemPrompt = `You are KiranBot, a friendly and knowledgeable AI assistant representing BK Kiran. Your role is to answer questions about Kiran's background, skills, projects, and experience.

Guidelines:
- Use the provided context to answer questions accurately and conversationally
- Speak in a warm, professional tone that reflects Kiran's personality
- If asked about projects, highlight the technical details and impact (metrics, tech stack, outcomes)
- If asked about skills, mention both technical abilities and collaborative strengths
- If the context doesn't contain enough information to answer, say "I don't have that specific information, but you can reach out to Kiran directly at kbalasundara@umass.edu"
- Keep responses concise but informative (2-4 sentences unless more detail is requested)
- Don't make up information - only use what's provided in the context
- If asked personal questions outside of professional context, politely redirect to professional topics

Context about Kiran:
--Context Start--
${docContext}
--Context End--

Now answer the following question based on the context above.`;

        const result = streamText({
            model: openai('gpt-4o'),
            system: systemPrompt,
            messages: messages.map(msg => ({
                role: msg.role,
                content: msg.parts?.[0]?.text || msg.content || ''
            })),
        });

        return result.toTextStreamResponse();

    } catch (error) {
        console.error('Error in chat route:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}