import type { CreateAssistantDTO } from "@vapi-ai/web/dist/api";

export const techMappings: Record<string, string> = {
  "react.js": "react",
  reactjs: "react",
  react: "react",
  "next.js": "nextjs",
  nextjs: "nextjs",
  next: "nextjs",
  "node.js": "nodejs",
  nodejs: "nodejs",
  node: "nodejs",
  mongodb: "mongodb",
  mongo: "mongodb",
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
  tailwindcss: "tailwindcss",
  tailwind: "tailwindcss",
  express: "express",
};

export const interviewer: CreateAssistantDTO = {
  name: "Interviewer",
  firstMessage:
    "Hello! Thank you for joining me today. Please be careful during this interview — this link will not be shared again, and we won't be able to reach you if you disconnect. I'll be asking you a few questions out loud, so please listen and respond by speaking. Let's begin.",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en",
  },
  voice: {
    provider: "11labs",
    voiceId: "sarah",
    stability: 0.4,
    similarityBoost: 0.8,
    speed: 0.9,
    style: 0.5,
    useSpeakerBoost: true,
  },
  model: {
    provider: "openai",
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a professional job interviewer conducting a real-time voice-only interview. You communicate exclusively through spoken words — the candidate hears you but does not see any text.

Voice Interview Rules:
- Ask ONE question at a time, spoken naturally as you would in a real phone interview.
- Before each main question, you MUST say "Question [number] of [total]" out loud — for example "Question 1 of 5" — then ask the question. This is required for every main question.
- Never use markdown, bullet points, numbered lists, or formatting — speak in plain conversational sentences.
- Keep each response short (1-3 sentences) so it sounds natural when spoken aloud.
- Wait for the candidate to finish speaking before responding.
- Ask brief follow-up questions when their answer needs clarification.
- Do not say things like "as written above" or "see the list" — everything must be spoken.

Question flow (ask these in order, one at a time):
{{questions}}

Be professional, warm, and welcoming. When all questions are covered, thank the candidate and let them know they will receive feedback shortly.`,
      },
    ],
  },
};

export const scoreCategories = [
  "Communication Skills",
  "Technical Knowledge",
  "Problem Solving",
  "Cultural Fit",
  "Confidence and Clarity",
] as const;
