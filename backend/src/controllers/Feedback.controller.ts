import type { Request, Response } from "express";
import mongoose from "mongoose";
import {Feedback} from "../models/Feedback.js";
import {generateFeedbackFromTranscript} from "../services/openai.service";


export type CreateFeedbackInput = {
    interviewId: string;
    transcript: Array<{role: string; content: string}>;
    feedbackId?: string;
}


export async function createFeedback(res: Response, body: CreateFeedbackInput): Promise<void> {

    try{
        const {interviewId, transcript, feedbackId} = body;

        if(!mongoose.Types.ObjectId.isValid(interviewId)) {
            res.status(400).json({success: false, error: "Invalid interview ID"});
            return;
        }

        const formattedTranscript = transcript
        .map((s) => `${s.role}: ${s.content}`)
        .join("\n");

        const aiFeedback = await generateFeedbackFromTranscript(formattedTranscript);

        const payload = {
            interviewId: new mongoose.Types.ObjectId(interviewId),
            totalScore: aiFeedback.totalScore,
            categoryScores:aiFeedback.categoryScores,
            strengths: aiFeedback.strengths,
            areasForImprovement: aiFeedback.areasForImprovement,
            finalAssessment: aiFeedback.finalAssessment,
        };

        let doc;

        if(feedbackId && mongoose.Types.ObjectId.isValid(feedbackId)) {
            doc = await Feedback.findByIdAndUpdate(feedbackId, payload, {new: true, upsert: false});
            if(!doc) {
                doc = await Feedback.create(payload);
            }
        }else{
            const existing = await Feedback.findOne({interviewId: payload.interviewId});
            if(existing) {
                doc = await Feedback.findByIdAndUpdate(existing._id, payload, {new: true});
            }else{
                doc = await Feedback.create(payload);
            }
        }

        res.json({success: true, feedbackId: doc!._id.toString()});

    }catch(error){
        console.error(error);
        res.status(500).json({succes: false, error: "Failed to create feedback"});
    }
}

export async function getFeedbackByInterview(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const interviewId = String(req.params.interviewId);
      if (!mongoose.Types.ObjectId.isValid(interviewId)) {
        res.status(400).json({ success: false, error: "Invalid interview id" });
        return;
      }
  
      const feedback = await Feedback.findOne({
        interviewId: new mongoose.Types.ObjectId(interviewId),
      }).lean();
  
      if (!feedback) {
        res.json({ success: true, data: null });
        return;
      }
  
      res.json({
        success: true,
        data: {
          id: feedback._id.toString(),
          interviewId: feedback.interviewId.toString(),
          totalScore: feedback.totalScore,
          categoryScores: feedback.categoryScores,
          strengths: feedback.strengths,
          areasForImprovement: feedback.areasForImprovement,
          finalAssessment:
            feedback.finalAssessment ??
            (feedback as { finalAssesment?: string }).finalAssesment,
          createdAt: feedback.createdAt.toISOString(),
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Failed to fetch feedback" });
    }
  }