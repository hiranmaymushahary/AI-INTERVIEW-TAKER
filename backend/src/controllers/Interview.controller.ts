import { Request, Response } from "express";
import { Interview } from "../models/Interview";
import { getRandomInterviewCover } from "../constants/index";
import { generateInterviewQuestions } from "../services/openai.service";

export type CreateInterviewInput = {
    role: string;
    level: string;
    techstack: string;
    type: string;
    amount: number;
}

function toInterviewJSON(doc: {
    _id: {toString: () => string};
    role: string;
    level: string;
    techstack?: string[];
    techStack?: string[];
    type: string;
    finalized?: boolean;
    questions: string[];
    coverImage?: string;
    createdAt?: Date;
}) {
    return {
        id: doc._id.toString(),
        role: doc.role,
        level: doc.level,
        techstack: doc.techstack ?? doc.techStack ?? [],
        type: doc.type,
        finalized: doc.finalized,
        questions: doc.questions,
        coverImage: doc.coverImage,
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    };
}

export async function createInterview(res: Response, body: CreateInterviewInput): Promise<void> {

    try{
        const {role, level, techstack, type, amount} = body;
        const questions = await generateInterviewQuestions({role, level, techstack, type, amount});
        const interview = await Interview.create({
            role,
            level,
            techstack: techstack.split(',').map(tech => tech.trim()),
            type,
            finalized: true,
            questions,
            coverImage: getRandomInterviewCover(),
        });
       
        res.status(201).json({ success: true, data: toInterviewJSON(interview) });
    }catch(error: unknown){
        console.error(error);
        const err = error as {code?: string; status?:number; message?:string};
        const invalidKey = err.code === "invalid_api_key" || err.status === 401 || err.message?.includes("Invalid API key");

        const message = invalidKey ? "Invalid API key" : "Failed to generate interview questions";
        res.status(500).json({ success: false, error: message });
    }
};

export async function getInterview(req: Request, res: Response): Promise<void>{ 

    try{
        const interview = await Interview.findById(req.params.id).lean();
        if(!interview) {
            res.status(404).json({success: false, error: "Interview not found"});
            return;
        }

        res.json({success: true, data: toInterviewJSON(interview)});

    }catch(error){
        console.error(error);
        res.status(500).json({success: false, error: "Failed to get interview"});
    }
};

export async function listInterviews(req: Request, res: Response): Promise<void> {
    try{
        const interviews = await Interview.find({finalized: true})
        .sort({createdAt: -1})
        .lean();

        res.json({success: true, data: interviews.map((doc) => toInterviewJSON(doc))
    });
    }
    catch(error){
        console.error(error);
        res.status(500).json({success: false, error: "Failed to list interviews"});
    }
};