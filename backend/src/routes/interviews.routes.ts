import { Router } from "express";
import {z} from "zod";
import {
    createInterview,
    getInterview,
    listInterviews,
} from "../controllers/Interview.controller";



export const interviewRouter = Router();

const createInterviewSchema = z.object({
    role: z.string().min(1),
    level: z.string().min(1),
    techstack: z.string().min(1),
    type: z.string().min(1),
    amount: z.coerce.number().int().min(1).max(20),
});



interviewRouter.get("/interviews", listInterviews);
interviewRouter.get("/interviews/:id", getInterview);

interviewRouter.post("/interviews", async (req, res) => {
    const parsed = createInterviewSchema.safeParse(req.body);
    if(!parsed.success){
        res.status(400).json({ success: false, error: parsed.error.format() });
        return;
    }
   await createInterview(res, parsed.data);
});
