import { generateText } from "ai";
import { createOpenAI as createGroq } from "@ai-sdk/openai";

const groq = createGroq({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

const { text } = await generateText({
  model: groq("llama-3.1-70b-versatile"),
  prompt: "What is love?",
});

//to be worked on:
