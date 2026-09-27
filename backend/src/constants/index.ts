import { z } from "zod";


export const feedbackCategoryNames = [
    "Communication Skills",
    "Technical Knowledge",
    "Problem Solving",
    "Cultural Fit",
    "Confidence and Clarity"
] as const;

export const feedbackSchema = z.object({
    totalScore: z.number(),
    categoryScores: z.array(
        z.object({
            name: z.enum(feedbackCategoryNames),
            score: z.number(),
            comment: z.string(),
        })
    ).length(5),
    strengths: z.array(z.string()),
    areasForImprovement: z.array(z.string()),
    finalAssessment: z.string(),
});

export type FeedbackAI = z.infer<typeof feedbackSchema>;


export const interviewCovers = [
    "/covers/adobe.png",
    "/covers/amazon.png",
    "/covers/apple.png",
    "/covers/facebook.png",
    "/covers/google.png",
    "/covers/microsoft.png",
    "/covers/netflix.png",
    "/covers/openai.png",
    "/covers/uber.png",
    "/covers/walmart.png",
    "/covers/youtube.png",
];

export  function getRandomInterviewCover(): string {
    return interviewCovers[Math.floor(Math.random() * interviewCovers.length)];
}

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
    "express": "express",
    "typescript": "typescript",
    ts: "typescript",
    "javascript": "javascript",
    js: "javascript",
    "html": "html",
};