import { useQuiz } from "@/components/quiz-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Trophy,
  Clock,
  Target,
  RotateCcw,
  Home,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function ResultScreen() {
  const { currentSession, answers, timer, restartGame, backToSubjects } =
    useQuiz();

  const calculateScore = () => {
    let score = 0;
    currentSession.forEach((q) => {
      if (answers[q.id] === q.answer) score++;
    });
    return score;
  };

  const score = calculateScore();
  const total = currentSession.length;
  const percentage = Math.round((score / total) * 100);

  let message = "Good Effort!";
  if (percentage >= 90) message = "Outstanding!";
  else if (percentage >= 70) message = "Great Job!";
  else if (percentage >= 50) message = "Well Done!";
  else if (percentage >= 30) message = "Keep Learning!";

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 animate-in slide-in-from-bottom-8 duration-700">
      {/* Hero Summary */}
      <div className="bg-card rounded-3xl shadow-xl overflow-hidden border mb-8 text-center">
        <div className="bg-gradient-to-r from-primary to-purple-600 p-10 text-primary-foreground relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(#fff 2px, transparent 2px)",
              backgroundSize: "30px 30px",
            }}
          ></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="inline-flex p-4 bg-white/20 rounded-full mb-4 backdrop-blur-md shadow-lg">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2 tracking-tight">
              {message}
            </h1>
            <p className="text-primary-foreground/90 text-lg">
              You completed the quiz!
            </p>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-secondary/50 rounded-2xl border flex flex-col items-center justify-center gap-2">
              <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                Score
              </p>
              <p className="text-3xl font-black text-foreground">
                {score}{" "}
                <span className="text-lg text-muted-foreground font-medium">
                  / {total}
                </span>
              </p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-2xl border flex flex-col items-center justify-center gap-2">
              <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                Accuracy
              </p>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <p
                  className={cn(
                    "text-3xl font-black",
                    percentage >= 70 ? "text-green-600" : "text-primary",
                  )}
                >
                  {percentage}%
                </p>
              </div>
            </div>
            <div className="p-4 bg-secondary/50 rounded-2xl border flex flex-col items-center justify-center gap-2">
              <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                Time Taken
              </p>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <p className="text-3xl font-black text-foreground">
                  {formatTime(timer)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            <Button
              variant="outline"
              className="flex-1 h-12 gap-2"
              onClick={backToSubjects}
            >
              <Home className="w-4 h-4" /> Change Subject
            </Button>
            <Button className="flex-1 h-12 gap-2" onClick={restartGame}>
              <RotateCcw className="w-4 h-4" /> Try Again
            </Button>
          </div>
        </div>
      </div>

      {/* Detailed Review */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight px-2">
          Detailed Review
        </h2>
        <div className="space-y-4">
          {currentSession.map((q, idx) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.answer;
            const isSkipped = userAnswer === undefined;

            return (
              <Card
                key={q.id}
                className={cn(
                  "overflow-hidden transition-all hover:shadow-md",
                  !isSkipped && isCorrect
                    ? "border-green-200 dark:border-green-900 bg-green-50/30 dark:bg-green-900/10"
                    : !isSkipped && !isCorrect
                      ? "border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-900/10"
                      : "bg-card",
                )}
              >
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="mt-1 flex-shrink-0">
                      {isSkipped ? (
                        <AlertCircle className="w-6 h-6 text-muted-foreground" />
                      ) : isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-500" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-background border px-2 py-0.5 rounded-md">
                          Q{idx + 1}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                          {q.topic}
                        </span>
                      </div>

                      <p className="font-medium text-lg leading-snug">
                        {q.question}
                      </p>

                      <div className="grid md:grid-cols-2 gap-4 text-sm pt-2">
                        <div
                          className={cn(
                            "p-3 rounded-lg border",
                            isCorrect
                              ? "bg-green-100/50 border-green-200 dark:bg-green-900/20 dark:border-green-900"
                              : "bg-red-100/50 border-red-200 dark:bg-red-900/20 dark:border-red-900",
                          )}
                        >
                          <span className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
                            Your Answer
                          </span>
                          <span className="font-medium">
                            {userAnswer || "Skipped"}
                          </span>
                        </div>

                        {!isCorrect && (
                          <div className="p-3 rounded-lg border bg-primary/5 border-primary/20">
                            <span className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70 text-primary">
                              Correct Answer
                            </span>
                            <span className="font-medium">{q.answer}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
