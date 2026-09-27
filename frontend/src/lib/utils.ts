import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { techMappings } from "@/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTechLogo(tech: string): string {
  const normalized = techMappings[tech.toLowerCase()] ?? tech.toLowerCase();
  return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${normalized}/${normalized}-original.svg`;
}
