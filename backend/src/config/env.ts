import "dotenv/config";

function required(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is not set`);
    }
    return value;
}

export const env = {
    port: Number(process.env.PORT ?? 5001),
    mongodbUri: required("MONGODB_URI"),
    openaiApiKey: required("OPENAI_API_KEY"),
    openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
}

