import { Router } from "express";
import {z} from "zod";


export const interviewRouter = Router();

const createInterviewSchema = z.object({
    role: z.string().min(1),
    level: z.string().min(1),
    techstack: z.string().min(1),
    type: z.string().min(1),
    amount: z.coerce.number().int().min(1).max(20),
});

