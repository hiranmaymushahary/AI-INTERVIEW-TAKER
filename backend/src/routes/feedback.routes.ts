import { Router } from "express";
import {z} from "zod";


export const feedbackRouter = Router();

const transcriptEntrySchema = z.object({
    role: z.string(),
    content: z.string(),
});

const createFeedbackSchema = z.object({
    interviewId: z.string(),
    transcript: z.array(transcriptEntrySchema).min(1),
    feedbackId: z.string().optional()
});

