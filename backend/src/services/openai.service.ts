import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import {env} from "../config/env.js";
import {feedbackSchema, type FeedbackAI} from "../constants/index.js";

const openai = new OpenAI({
    apiKey: env.openaiApiKey,
});

export interface GenerateQuestionsInput {
    role: string;
    level: string;
    techstack: string;
    type: string;
    amount: number;
}

export async function generateInterviewQuestions(input: GenerateQuestionsInput): Promise<string[]> {

    const {role, level, techstack, type, amount} = input;

    const completion = await openai.chat.completions.create({
        model: env.openaiModel,
        messages: [
            {
                role: "user",
                content: `Prepare questions for a job interview.
                The jobs role is ${role}.
                The job experience level is ${level}.
                The tech stack used in the job is: ${techstack}.
                The focus between behavioural and technical questions should lean towards: ${type}.
                The amount of questions required is ${amount}.
                Please return only the questions, without any additonal text.
                The questions are going to be read by a voice assistant so do not use "/" or "*" 
                or any other special characters which might break the voice assistant.
                Return the questions formatted like this:
                ["Question 1", "Question 2", "Question 3"]`,
            },
        ]
    });

    const raw = completion.choices[0]?.message?.content?.trim();

    if(!raw) throw new Error("OpenAI returned empty questions list");

    const parsed = JSON.parse(raw) as unknown;
    if(!Array.isArray(parsed) || !parsed.every((q) => typeof q === "string")) throw new Error("OpenAI returned invalid questions format");

    return parsed;
}



export async function generateFeedbackFromTranscript(formattedTranscript: string): Promise<FeedbackAI> {

    const completion = await openai.chat.completions.parse({
        model: env.openaiModel,
        messages: [
            {
                role: "system",
                content: "You are a professional interviewer analysing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed. Don't be lenient-point out mistakes and areas for improvement.",
            },
            {
                role: "user",
                content: `You are an AI Interviewer analysing a mock interview. Score the candidates from 0 to 100 in each category. Do not add catrogories other than the one provided 
                Transcript: ${formattedTranscript}

                Categories:
                - Communication Skills: Clarity, articulation, structured responses, etc.
                - Technical Knowledge: Understanding of the key concepts for the role
                - Problem Solving: Ability to break down complex problems and come up with solutions
                - Cultural Fit: How well the candidate fits into the company culture
                - Confidence and Clarity: How confident and clear the candidate is in their answers  `,
            }, 
        ],
        response_format: zodResponseFormat(feedbackSchema, "feedback"),
    });

    const parsed = completion.choices[0]?.message?.parsed;
    if(!parsed) throw new Error("OpenAI returned invalid feedback format");

    return parsed;
}