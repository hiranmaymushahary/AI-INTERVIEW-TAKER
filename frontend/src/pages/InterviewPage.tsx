import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Agent } from "@/components/Agent";
import { DisplayTechIcons } from "@/components/DisplayTechIcons";
import { Button } from "@/components/ui/button";
import { getFeedbackByInterviewId, getInterviewById } from "@/lib/api";
import type { Interview } from "@/types";

export function InterviewPage() {
  const { id } = useParams<{ id: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [feedbackId, setFeedbackId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getInterviewById(id)
      .then((iv) => {
        setInterview(iv);
        return getFeedbackByInterviewId(id)
          .then((fb) => {
            if (fb) setFeedbackId(fb.id);
          })
          .catch(() => undefined);
      })
      .catch(() => toast.error("Interview not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="text-zinc-500">Loading...</p>;
  }

  if (!interview) {
    return <p className="text-zinc-500">Interview not found.</p>;
  }

  return (
    <section>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{interview.role}</h1>
          <p className="text-zinc-600">
            {interview.level} · {interview.type}
          </p>
          <DisplayTechIcons techStack={interview.techstack} />
        </div>
        {feedbackId && (
          <Button variant="outline" asChild>
            <Link to={`/interview/${id}/feedback`}>View previous feedback</Link>
          </Button>
        )}
      </div>

      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
        <p className="font-medium">Important</p>
        <p className="mt-1 leading-relaxed">
          Please be careful while using this link — we will not be able to re-share
          it, and we won&apos;t be able to reach you if you lose access or run into
          issues during the interview.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-8">
        <p className="mb-6 text-center text-sm text-zinc-500">
          This is a voice-only interview. The AI interviewer will ask questions aloud
          — respond by speaking into your microphone.
        </p>
        <Agent
          interviewId={interview.id}
          questions={interview.questions}
          feedbackId={feedbackId}
        />
      </div>
    </section>
  );
}
