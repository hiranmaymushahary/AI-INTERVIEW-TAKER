import { Router } from "express";
import {z} from "zod";
import { createFeedback, getFeedbackByInterview } from "../controllers/Feedback.controller";



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


feedbackRouter.post("/feedback", async(req, res)  => {
    const parsed = createFeedbackSchema.safeParse(req.body);
    if(!parsed.success) {
        res.status(400).json({success: false, error: parsed.error.flatten()});
        return;
    }
    await createFeedback(res, parsed.data);
});

feedbackRouter.get("/feedback/interview/:interviewId", getFeedbackByInterview);
