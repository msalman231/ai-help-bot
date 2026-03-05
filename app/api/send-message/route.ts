import { INSERT_MESSAGE } from "@/graphql/mutations/mutations";
import {
  GET_CHATBOT_BY_ID,
  GET_MESSAGES_BY_CHAT_SESSION_ID,
} from "@/graphql/queries/queries";
import { serverClient } from "@/lib/server/serverClient";
import {
  GetChatbotByIdResponse,
  MessageByChatSessionIdResponse,
} from "@/types/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { chat_session_id, chatbot_id, content, name, image } =
    await req.json();

  console.log(
    `Received message from chat session ${chat_session_id}: ${content} (chatbot: ${chatbot_id})`,
  );

  try {
    /**
     * Get chatbot info
     */
    const { data: chatbotQuery } =
      await serverClient.query<GetChatbotByIdResponse>({
        query: GET_CHATBOT_BY_ID,
        variables: { id: chatbot_id },
      });

    const chatbot = chatbotQuery?.chatbots;

    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    /**
     * Get previous messages
     */
    const { data: messagesQuery } =
      await serverClient.query<MessageByChatSessionIdResponse>({
        query: GET_MESSAGES_BY_CHAT_SESSION_ID,
        variables: { id: chat_session_id },
        fetchPolicy: "no-cache",
      });

    const prevMessages = messagesQuery?.chat_sessions?.messages ?? [];

    /**
     * Build conversation history
     */
    const history = prevMessages
      .slice(-6)
      .map((m) => `${m.sender === "ai" ? "Assistant" : "User"}: ${m.content}`)
      .join("\n");
    /**
     * Build system prompt
     */
    const systemPrompt = chatbot.chatbot_characteristics
      ?.map((c) => c.content)
      .join("\n");

    /**
     * Final prompt for Ollama
     */
    const prompt = `
You are a helpful AI assistant for selling Apple Watches.

User name: ${name}

If the user uploads an image:
- analyze the image
- identify the Apple Watch model, color, or features

You must follow these rules strictly:
${systemPrompt}

Conversation history:
${history}

User question:
${content}

Answer clearly and politely.
`;

    /**
     *Call Ollama
     */
    const ollamaResponse = await fetch("http://localhost:9786/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llava",
        prompt: prompt,
        images: image ? [image] : [],
        stream: false,
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error("Ollama request failed");
    }

    const ollamaData = await ollamaResponse.json();
    const aiResponse = ollamaData?.response?.trim();

    if (!aiResponse) {
      return NextResponse.json(
        { error: "Failed to generate AI response" },
        { status: 500 },
      );
    }

    /**
     *Save user message
     */
    await serverClient.mutate({
      mutation: INSERT_MESSAGE,
      variables: {
        chat_session_id,
        content,
        sender: "user",
        created_at: new Date().toISOString(),
      },
    });

    /**
     * Save AI message
     */
    const aiMessageResult = await serverClient.mutate({
      mutation: INSERT_MESSAGE,
      variables: {
        chat_session_id,
        content: aiResponse,
        sender: "ai",
        created_at: new Date().toISOString(),
      },
    });

    /**
     * Return response to frontend
     */
    return NextResponse.json({
      id: aiMessageResult.data.insertMessages.id,
      content: aiResponse,
    });
  } catch (error: any) {
    console.error("AI ERROR:", error);

    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
