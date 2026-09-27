const WORD_TO_NUM: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

function parseNumber(value: string): number | null {
  const digit = parseInt(value, 10);
  if (!Number.isNaN(digit)) return digit;
  return WORD_TO_NUM[value.toLowerCase()] ?? null;
}

export function parseQuestionAnnouncement(
  text: string,
  total: number
): number | null {
  const lower = text.toLowerCase();

  const match = lower.match(
    /question\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+of\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)/
  );
  if (!match) return null;

  const num = parseNumber(match[1]);
  if (num !== null && num >= 1 && num <= total) return num;
  return null;
}

export function matchQuestionInTranscript(
  text: string,
  questions: string[]
): number | null {
  const lower = text.toLowerCase();
  let bestIndex = -1;
  let bestScore = 0;

  for (let i = 0; i < questions.length; i++) {
    const words = questions[i]
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3);
    if (words.length === 0) continue;

    const matched = words.filter((w) => lower.includes(w)).length;
    const score = matched / words.length;
    if (score > bestScore && score >= 0.35) {
      bestScore = score;
      bestIndex = i;
    }
  }

  return bestIndex >= 0 ? bestIndex + 1 : null;
}

export function detectCurrentQuestion(
  assistantText: string,
  questions: string[],
  current: number
): number {
  const announced = parseQuestionAnnouncement(assistantText, questions.length);
  if (announced !== null) return announced;

  const matched = matchQuestionInTranscript(assistantText, questions);
  if (matched !== null && matched >= current) return matched;

  return current;
}
