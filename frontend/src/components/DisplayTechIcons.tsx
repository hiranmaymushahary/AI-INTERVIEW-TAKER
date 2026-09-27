import { getTechLogo } from "@/lib/utils";

interface DisplayTechIconsProps {
  techStack: string[];
}

export function DisplayTechIcons({ techStack }: DisplayTechIconsProps) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {techStack.slice(0, 5).map((tech) => (
        <div
          key={tech}
          className="flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-700"
          title={tech}
        >
          <img
            src={getTechLogo(tech)}
            alt={tech}
            width={16}
            height={16}
            className="size-4"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          {tech}
        </div>
      ))}
    </div>
  );
}
