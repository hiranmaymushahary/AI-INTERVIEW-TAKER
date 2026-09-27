import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Mic, PhoneOff, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getVapi } from "@/lib/vapi";
import { createFeedback } from "@/lib/api";
import { detectCurrentQuestion } from "@/lib/questionProgress";
import { interviewer } from "@/constants";
import type { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import type { TranscriptEntry } from "@/types";

interface AgentProps {
  interviewId: string;
  questions: string[];
  feedbackId?: string;
}

type CallStatus = "INACTIVE" | "CONNECTING" | "ACTIVE" | "FINISHED";
type Speaker = "none" | "assistant" | "user";

const BAR_COUNT = 5;

function VoiceVisualizer({
  volume,
  active,
  color,
}: {
  volume: number;
  active: boolean;
  color: "indigo" | "green";
}) {
  const activeColor = color === "indigo" ? "bg-indigo-500" : "bg-green-500";
  const idleColor = color === "indigo" ? "bg-indigo-200" : "bg-green-200";

  return (
    <div className="flex h-16 items-end justify-center gap-1.5">
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        const center = (BAR_COUNT - 1) / 2;
        const distance = Math.abs(i - center) / center;
        const height = active
          ? Math.max(20, (1 - distance * 0.4) * volume * 100)
          : 12;

        return (
          <div
            key={i}
            className={`w-2 rounded-full transition-all duration-150 ${
              active ? activeColor : idleColor
            }`}
            style={{ height: `${height}%` }}
          />
        );
      })}
    </div>
  );
}

export function Agent({ interviewId, questions, feedbackId }: AgentProps) {
  const navigate = useNavigate();
  const [callStatus, setCallStatus] = useState<CallStatus>("INACTIVE");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [speaker, setSpeaker] = useState<Speaker>("none");
  const [volume, setVolume] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const speakerRef = useRef<Speaker>("none");
  const currentQuestionRef = useRef(1);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    speakerRef.current = speaker;
  }, [speaker]);

  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);

  useEffect(() => {
    const vapi = getVapi();

    const onCallStart = () => {
      setCallStatus("ACTIVE");
      setSpeaker("assistant");
      setCurrentQuestion(1);
      currentQuestionRef.current = 1;
    };

    const onCallEnd = () => {
      setCallStatus("FINISHED");
      setSpeaker("none");
      setVolume(0);
    };

    const onMessage = (message: {
      type?: string;
      role?: string;
      status?: string;
      transcript?: string;
      transcriptType?: string;
    }) => {
      if (message.type === "speech-update") {
        if (message.status === "started") {
          setSpeaker(message.role === "assistant" ? "assistant" : "user");
        } else if (message.status === "stopped") {
          setSpeaker((prev) =>
            prev === (message.role === "assistant" ? "assistant" : "user")
              ? "none"
              : prev
          );
        }
      }

      if (
        message.type === "transcript" &&
        message.transcriptType === "final" &&
        message.transcript
      ) {
        if (message.role === "assistant") {
          const detected = detectCurrentQuestion(
            message.transcript,
            questions,
            currentQuestionRef.current
          );
          setCurrentQuestion(detected);
          currentQuestionRef.current = detected;
        }

        setTranscript((prev) => [
          ...prev,
          { role: message.role ?? "user", content: message.transcript! },
        ]);
      }
    };

    const onVolumeLevel = (level: number) => setVolume(level);

    const onSpeechStart = () => {
      if (speakerRef.current !== "assistant") setSpeaker("user");
    };

    const onSpeechEnd = () => {
      setSpeaker((prev) => (prev === "user" ? "none" : prev));
    };

    const onError = (err: unknown) => {
      console.error("Vapi error:", err);
      toast.error("Voice call error. Check your Vapi token.");
      setCallStatus("INACTIVE");
      setSpeaker("none");
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("volume-level", onVolumeLevel);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.removeListener("call-start", onCallStart);
      vapi.removeListener("call-end", onCallEnd);
      vapi.removeListener("message", onMessage);
      vapi.removeListener("volume-level", onVolumeLevel);
      vapi.removeListener("speech-start", onSpeechStart);
      vapi.removeListener("speech-end", onSpeechEnd);
      vapi.removeListener("error", onError);
    };
  }, [questions]);

  useEffect(() => {
    if (callStatus !== "FINISHED" || isSubmitting) return;

    if (transcriptRef.current.length === 0) {
      toast.error("No conversation recorded. Please try the interview again.");
      setCallStatus("INACTIVE");
      return;
    }

    void handleGenerateFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callStatus]);

  const handleCall = async () => {
    if (callStatus === "ACTIVE") {
      getVapi().stop();
      return;
    }

    try {
      setCallStatus("CONNECTING");
      setTranscript([]);
      setSpeaker("none");
      setVolume(0);
      setCurrentQuestion(1);
      currentQuestionRef.current = 1;

      const systemMessage = interviewer.model?.messages?.[0];
      const questionsList = questions.map((q, i) => `${i + 1}. ${q}`).join("\n");
      const assistant: CreateAssistantDTO = {
        ...interviewer,
        model: {
          ...interviewer.model!,
          messages: [
            {
              role: "system",
              content: (systemMessage?.content as string)?.replace(
                "{{questions}}",
                questionsList
              ),
            },
          ],
        },
      };
      await getVapi().start(assistant);
    } catch (err) {
      console.error(err);
      toast.error("Could not start call. Is VITE_VAPI_WEB_TOKEN set?");
      setCallStatus("INACTIVE");
    }
  };

  const handleGenerateFeedback = async () => {
    setIsSubmitting(true);
    try {
      const result = await createFeedback({
        interviewId,
        transcript: transcriptRef.current,
        feedbackId,
      });
      navigate(`/interview/${interviewId}/feedback`, {
        state: { feedbackId: result.feedbackId },
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to generate feedback";
      toast.error(message);
      setCallStatus("INACTIVE");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCallActive = callStatus === "ACTIVE" || callStatus === "CONNECTING";
  const isAssistantSpeaking = speaker === "assistant";
  const isUserSpeaking = speaker === "user";

  const statusMessage = (() => {
    if (callStatus === "INACTIVE") {
      return "Tap the button below to begin your voice interview";
    }
    if (callStatus === "CONNECTING") return "Connecting to your AI interviewer...";
    if (callStatus === "ACTIVE") {
      if (isAssistantSpeaking) return "Interviewer is speaking — listen carefully";
      if (isUserSpeaking) return "You're speaking — the interviewer is listening";
      return "Your turn — speak your answer out loud";
    }
    return isSubmitting ? "Generating AI feedback..." : "Call ended";
  })();

  const totalQuestions = questions.length;
  const progressPercent = Math.round((currentQuestion / totalQuestions) * 100);

  return (
    <div className="flex flex-col items-center gap-8">
      {isCallActive && totalQuestions > 0 && (
        <div className="w-full max-w-lg rounded-xl border border-indigo-100 bg-indigo-50/50 p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-indigo-700">
              Question {currentQuestion} of {totalQuestions}
            </span>
            <span className="text-indigo-500">{progressPercent}% complete</span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-indigo-100">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-4 flex gap-1.5">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i + 1 < currentQuestion
                    ? "bg-indigo-500"
                    : i + 1 === currentQuestion
                      ? "bg-indigo-400"
                      : "bg-indigo-200"
                }`}
              />
            ))}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-zinc-700">
            <span className="font-medium text-zinc-500">Current question: </span>
            {questions[currentQuestion - 1]}
          </p>
        </div>
      )}

      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <div className="flex w-full items-center justify-around gap-4">
          <div className="flex flex-col items-center gap-2">
            <div
              className={`flex size-20 items-center justify-center rounded-full border-4 transition-all duration-300 ${
                isAssistantSpeaking
                  ? "border-indigo-400 bg-indigo-50 scale-105 shadow-lg shadow-indigo-100"
                  : isCallActive
                    ? "border-indigo-200 bg-indigo-50"
                    : "border-zinc-200 bg-zinc-50"
              }`}
            >
              <Volume2
                className={`size-8 transition-colors ${
                  isAssistantSpeaking
                    ? "text-indigo-600"
                    : isCallActive
                      ? "text-indigo-400"
                      : "text-zinc-400"
                }`}
              />
            </div>
            <span className="text-xs font-medium text-zinc-500">Interviewer</span>
            <VoiceVisualizer
              volume={isAssistantSpeaking ? 0.7 + volume * 0.3 : 0}
              active={isAssistantSpeaking}
              color="indigo"
            />
          </div>

          <div className="flex flex-col items-center gap-2">
            <div
              className={`flex size-20 items-center justify-center rounded-full border-4 transition-all duration-300 ${
                isUserSpeaking
                  ? "border-green-400 bg-green-50 scale-105 shadow-lg shadow-green-100"
                  : isCallActive
                    ? "border-green-200 bg-green-50"
                    : "border-zinc-200 bg-zinc-50"
              }`}
            >
              <Mic
                className={`size-8 transition-colors ${
                  isUserSpeaking
                    ? "text-green-600"
                    : isCallActive
                      ? "text-green-400"
                      : "text-zinc-400"
                }`}
              />
            </div>
            <span className="text-xs font-medium text-zinc-500">You</span>
            <VoiceVisualizer
              volume={volume}
              active={isUserSpeaking}
              color="green"
            />
          </div>
        </div>

        <p className="text-center text-sm text-zinc-500">{statusMessage}</p>
      </div>

      {callStatus !== "FINISHED" && (
        <Button
          onClick={handleCall}
          variant={isCallActive ? "destructive" : "default"}
          size="lg"
          disabled={callStatus === "CONNECTING"}
        >
          {isCallActive ? (
            <>
              <PhoneOff className="size-4" /> End call
            </>
          ) : (
            <>
              <Mic className="size-4" /> Start voice interview
            </>
          )}
        </Button>
      )}

      {callStatus === "FINISHED" && isSubmitting && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-zinc-200 bg-white px-8 py-6">
          <Loader2 className="size-8 animate-spin text-indigo-600" />
          <p className="font-medium text-zinc-800">Generating your feedback...</p>
          <p className="max-w-xs text-center text-sm text-zinc-500">
            AI is analyzing your interview transcript. This usually takes 10–30
            seconds.
          </p>
        </div>
      )}

      {callStatus === "INACTIVE" && (
        <p className="max-w-sm text-center text-xs text-zinc-400">
          Questions are asked aloud by the AI interviewer. Use your microphone and
          speakers — no typing required.
        </p>
      )}
    </div>
  );
}
