import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createInterview } from "@/lib/api";

const schema = z.object({
  role: z.string().min(2, "Role is required"),
  level: z.string().min(1),
  techstack: z.string().min(2, "Tech stack is required"),
  type: z.string().min(1),
  amount: z.coerce.number().min(3).max(10),
});

type FormValues = z.infer<typeof schema>;

export function CreateInterviewPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: "",
      level: "Junior",
      techstack: "React, Node.js, TypeScript, MongoDB",
      type: "Mixed",
      amount: 5,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      await createInterview(data);
      toast.success("Interview created with AI-generated questions");
      navigate("/");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to create interview. Check API and OpenAI key."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-zinc-900">Create interview</h1>
      <p className="mt-2 text-sm text-zinc-600">
        The backend calls OpenAI to generate tailored questions and saves them in MongoDB.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div>
          <Label htmlFor="role">Job role</Label>
          <Input id="role" className="mt-1.5" placeholder="e.g. Backend Developer" {...register("role")} />
          {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>}
        </div>

        <div>
          <Label>Experience level</Label>
          <Select
            value={watch("level")}
            onValueChange={(v) => setValue("level", v)}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Junior", "Mid", "Senior", "Lead"].map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="techstack">Tech stack (comma-separated)</Label>
          <Input
            id="techstack"
            className="mt-1.5"
            {...register("techstack")}
          />
        </div>

        <div>
          <Label>Interview focus</Label>
          <Select value={watch("type")} onValueChange={(v) => setValue("type", v)}>
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Technical", "Behavioural", "Mixed"].map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="amount">Number of questions</Label>
          <Input
            id="amount"
            type="number"
            min={3}
            max={10}
            className="mt-1.5"
            {...register("amount")}
          />
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Generating questions..." : "Generate & save interview"}
        </Button>
      </form>
    </section>
  );
}
