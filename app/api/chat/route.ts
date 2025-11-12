import OpenAI from "openai";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { DataAPIClient } from "@datastax/astra-db-ts";

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  OPENAI_API_KEY,
} = process.env;

const openAI = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];

    // Extract latest message content
    const latestMessage = messages[messages.length - 1];
    const messageContent = latestMessage?.content || "";

    console.log("Latest message:", messageContent);

    if (!messageContent) {
      return new Response("No message content provided", { status: 400 });
    }

    let docContext = "";

    // Create embedding for query
    const embedding = await openAI.embeddings.create({
      model: "text-embedding-3-small",
      input: messageContent,
      encoding_format: "float",
    });

    try {
      const collection = db.collection(ASTRA_DB_COLLECTION);

      const cursor = collection.find(
        {},
        {
          sort: { $vector: embedding.data[0].embedding },
          limit: 20,
          includeSimilarity: true,
        }
      );

      const documents = await cursor.toArray();

      console.log("Found documents:", documents.length);

      docContext =
        documents && documents.length > 0
          ? documents.map((doc: any) => doc.text).join("\n\n")
          : "No relevant context found.";
    } catch (error) {
      console.error("Error querying Astra DB:", error);
      docContext = "No context available.";
    }

    const systemPrompt = `You are KiranBot, a friendly and knowledgeable AI assistant representing BK Kiran. 

Guidelines:
- Use the provided context to answer questions accurately and conversationally.
- Speak in a warm, professional tone that reflects Kiran's personality.
- If asked about projects, highlight technical details and impact (metrics, tech stack, outcomes).
- If asked about skills, mention both technical and collaborative strengths.
- If the context doesn't contain enough information, say "I don't have that specific information, but you can reach out to Kiran directly at kbalasundara@umass.edu".
- Keep responses concise (2–4 sentences unless more detail is requested).
- Don't make up information.
- Politely redirect if asked personal questions outside professional context.

Context about Kiran:
--Context Start--
${docContext}
--Context End--

Now answer the following question based on the context above.`;

    // Stream the response
    const result = await streamText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages: messages,
    });

    // Return streaming response in format compatible with useChat
    return result.toDataStreamResponse();

  } catch (error) {
    console.error("Error in chat route:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}