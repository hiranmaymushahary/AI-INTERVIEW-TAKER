import mongoose, {Schema, type InferSchemaType} from "mongoose";

const categorySchema = new Schema(
    {
    name: {type: String, required: true},
    score: {type: Number, required: true},
    comment: {type: String, required: true},
    }, 
    {_id: false, timestamps: true}
);

const feedbackSchema = new Schema(
    {
        interviewId: {type: Schema.Types.ObjectId, 
                ref: "Interview", 
                required: true,
                index: true},
        totalScore: {type: Number, required: true},
        categoryScores: {type: [categorySchema], required: true},
        strengths: {type: [String], required: true},
        areasForImprovement: {type: [String], required: true},
        finalAssessment: {type: String, required: true},
    },
    {timestamps: true}
);

export type FeedbackDocument = InferSchemaType<typeof feedbackSchema> & {
    id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
};

export const Feedback = mongoose.model<FeedbackDocument>("Feedback", feedbackSchema);