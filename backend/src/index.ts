import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import { healthRoutes } from "./routes/health.routes";


async function main() {
    await connectDB();
    const app = express();
    app.use(cors({origin: env.corsOrigin}));
    app.use(express.json());

    
    app.use("/api/health", healthRoutes);
  


    app.listen(env.port, () => {
        console.log(`Server is running on port ${env.port}`);
    });
}

main().catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1)
});