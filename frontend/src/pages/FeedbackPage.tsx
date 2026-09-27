import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getFeedbackByInterviewId } from "@/lib/api";
import type { Feedback } from "@/types";

export function FeedbackPage() {
  const { id } = useParams<{ id: string }>();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getFeedbackByInterviewId(id)
      .then(setFeedback)
      .catch(() => toast.error("Failed to load feedback"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="text-zinc-500">Loading feedback...</p>;
  }

  if (!feedback) {
    return (
      <div className="text-center">
        <p className="text-zinc-600">No feedback yet for this interview.</p>
        <Button className="mt-4" asChild>
          <Link to={`/interview/${id}`}>Take interview</Link>
        </Button>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900">Interview feedback</h1>
        <Button variant="outline" asChild>
          <Link to={`/interview/${id}`}>Retake interview</Link>
        </Button>
      </div>

      <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-8 text-center">
        <p className="text-sm font-medium text-indigo-600">Overall score</p>
        <p className="mt-2 text-5xl font-bold text-indigo-700">
          {feedback.totalScore}
          <span className="text-2xl text-indigo-400">/100</span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {feedback.categoryScores.map((cat) => (
          <div
            key={cat.name}
            className="rounded-xl border border-zinc-200 bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-800">{cat.name}</h3>
              <span className="text-lg font-bold text-indigo-600">{cat.score}</span>
            </div>
            <p className="mt-2 text-sm text-zinc-600">{cat.comment}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
          <h3 className="font-semibold text-green-800">Strengths</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-green-900">
            {feedback.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="font-semibold text-amber-800">Areas for improvement</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-900">
            {feedback.areasForImprovement.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h3 className="font-semibold text-zinc-800">Final assessment</h3>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600">
          {feedback.finalAssessment}
        </p>
      </div>
    </section>
  );
}
