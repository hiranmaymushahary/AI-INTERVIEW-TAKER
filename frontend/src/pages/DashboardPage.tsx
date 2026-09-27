import { useEffect, useState } from "react";
import { toast } from "sonner";
import { InterviewCard } from "@/components/InterviewCard";
import { getInterviews } from "@/lib/api";
import type { Interview } from "@/types";

export function DashboardPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInterviews()
      .then(setInterviews)
      .catch(() =>
        toast.error(
          "Cannot reach the API. Run npm run dev in the backend folder and check backend/.env (port 5001 on Mac)."
        )
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">Mock interviews</h1>
        <p className="mt-2 text-zinc-600">
          Practice with AI voice interviews and get structured feedback from OpenAI.
        </p>
      </div>

      {loading ? (
        <p className="text-zinc-500">Loading interviews...</p>
      ) : interviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <p className="text-zinc-600">No interviews yet.</p>
          <p className="mt-1 text-sm text-zinc-500">
            Create your first interview to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {interviews.map((interview) => (
            <InterviewCard key={interview.id} interview={interview} />
          ))}
        </div>
      )}
    </section>
  );
}
