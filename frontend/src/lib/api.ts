import type { Feedback, Interview, TranscriptEntry } from "@/types";

const API_URL = import.meta.env.VITE_API_URL ?? "/api";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  let json: { success?: boolean; error?: unknown; message?: string };
  try {
    json = await res.json();
  } catch {
    throw new Error(
      "API returned a non-JSON response. Is the backend running on the correct port?"
    );
  }
  if (!res.ok || json.success === false) {
    const err =
      typeof json.error === "string"
        ? json.error
        : (json.message ?? "Request failed");
    throw new Error(err);
  }
  return json as T;
}

export async function getInterviews(): Promise<Interview[]> {
  const json = await request<{ data: Interview[] }>("/interviews");
  return json.data;
}

export async function getInterviewById(id: string): Promise<Interview> {
  const json = await request<{ data: Interview }>(`/interviews/${id}`);
  return json.data;
}

export async function createInterview(body: {
  role: string;
  level: string;
  techstack: string;
  type: string;
  amount: number;
}): Promise<Interview> {
  const json = await request<{ data: Interview }>("/interviews", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return json.data;
}

export async function createFeedback(body: {
  interviewId: string;
  transcript: TranscriptEntry[];
  feedbackId?: string;
}): Promise<{ feedbackId: string }> {
  return request("/feedback", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getFeedbackByInterviewId(
  interviewId: string
): Promise<Feedback | null> {
  const json = await request<{ data: Feedback | null }>(
    `/feedback/interview/${interviewId}`
  );
  return json.data;
}
