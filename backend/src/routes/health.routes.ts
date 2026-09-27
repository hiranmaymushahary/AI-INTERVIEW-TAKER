import { Router } from "express";

export const healthRoutes = Router();

healthRoutes.get("/", (_req, res) => {
    res.json({ success: true, message: "AI Interview taker is running"});
});