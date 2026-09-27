import { Link, Outlet } from "react-router-dom";
import { Brain } from "lucide-react";

export function Layout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-indigo-600">
            <Brain className="size-7" />
            InterviewPrep
          </Link>
          <nav className="flex gap-4 text-sm font-medium">
            <Link to="/" className="text-zinc-600 hover:text-indigo-600">
              Dashboard
            </Link>
            <Link
              to="/create"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              Create interview
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
