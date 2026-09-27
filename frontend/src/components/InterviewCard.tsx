import { Link } from "react-router-dom";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { DisplayTechIcons } from "./DisplayTechIcons";
import type { Interview } from "@/types";

dayjs.extend(advancedFormat);

interface InterviewCardProps {
  interview: Interview;
}

export function InterviewCard({ interview }: InterviewCardProps) {
  const { id, role, type, techstack, createdAt, coverImage } = interview;

  return (
    <Link
      to={`/interview/${id}`}
      className="card-interview block rounded-2xl border border-zinc-200 bg-white p-0 shadow-sm transition hover:shadow-md overflow-hidden"
    >
      <div className="relative h-32 bg-gradient-to-br from-indigo-500 to-purple-600">
        {coverImage && (
          <img
            src={coverImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-30"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        <span className="absolute bottom-3 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-indigo-700">
          {type}
        </span>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-zinc-900">{role}</h3>
        <DisplayTechIcons techStack={techstack} />
        <p className="mt-3 text-sm text-zinc-500">
          {createdAt
            ? dayjs(createdAt).format("MMM Do, YYYY")
            : "Recently created"}
        </p>
      </div>
    </Link>
  );
}
