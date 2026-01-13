import { useQuiz } from "@/components/quiz-context";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Pause,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function GameScreen() {
  const {
    currentSession,
    currentIndex,
    answers,
    timer,
    isTimerRunning,
    settings,
    answerQuestion,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    toggleTimer,
    finishGame,
  } = useQuiz();

  const question = currentSession[currentIndex];
  const progress = ((currentIndex + 1) / currentSession.length) * 100;
  const isPaused = settings.timerEnabled && !isTimerRunning;

  // Key navigation
  // Note: Add global listener in useEffect if desired, simplified here.

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4 min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="px-3 py-1 text-primary border-primary/20 bg-primary/5"
          >
            {question.topic}
          </Badge>
          <span className="text-sm font-medium text-muted-foreground">
            Question {currentIndex + 1} / {currentSession.length}
          </span>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <Button variant="destructive" size="sm" onClick={finishGame}>
            End Quiz
          </Button>

          {settings.timerEnabled && (
            <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-md border">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-mono font-medium min-w-[3rem] text-center">
                {formatTime(timer)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 ml-1"
                onClick={toggleTimer}
              >
                {isTimerRunning ? (
                  <Pause className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <Progress value={progress} className="h-2" />
      </div>

      <div className="grid md:grid-cols-[1fr_280px] gap-6 flex-1 items-start relative">
        {/* Main Question Area */}
        <div className="flex flex-col gap-6 relative">
          {/* Pause Overlay */}
          {isPaused && (
            <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-2xl border">
              <div className="text-center p-8 bg-card rounded-xl shadow-2xl border max-w-sm mx-auto">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Pause className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Quiz Paused</h3>
                <p className="text-muted-foreground mb-6">
                  Take a break and resume when ready.
                </p>
                <Button onClick={toggleTimer} className="w-full">
                  Resume Quiz
                </Button>
              </div>
            </div>
          )}

          {/* Question Card */}
          <div
            className={cn(
              "bg-card border rounded-2xl p-6 md:p-10 shadow-sm transition-opacity duration-300",
              isPaused && "opacity-20",
            )}
          >
            <h2 className="text-xl md:text-2xl font-semibold leading-relaxed mb-8">
              {question.question}
            </h2>

            <div className="space-y-3">
              {question.options.map((opt, idx) => {
                const isSelected = answers[question.id] === opt;
                const letter = String.fromCharCode(65 + idx);

                return (
                  <button
                    key={idx}
                    disabled={isPaused}
                    onClick={() => answerQuestion(opt)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 group hover:bg-accent/50",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-transparent bg-secondary/30 hover:border-primary/20",
                      isPaused && "cursor-not-allowed",
                    )}
                  >
                    <span
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-lg font-semibold text-sm transition-colors",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-background text-muted-foreground border",
                      )}
                    >
                      {letter}
                    </span>
                    <span className="flex-1 font-medium text-foreground/90">
                      {opt}
                    </span>
                    {isSelected && (
                      <CheckCircle className="h-5 w-5 text-primary animate-in zoom-in duration-200" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={prevQuestion}
              disabled={currentIndex === 0 || isPaused}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button
              onClick={nextQuestion}
              disabled={currentIndex === currentSession.length - 1 || isPaused}
              className="gap-2"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Sidebar / Navigator */}
        <div className="hidden md:block space-y-4">
          <div className="bg-card border rounded-xl p-4 shadow-sm sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Navigator
              </h3>
              <Button
                variant="default"
                size="sm"
                className="h-8 text-xs"
                onClick={finishGame}
              >
                Submit All
              </Button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {currentSession.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = !!answers[q.id];

                return (
                  <button
                    key={idx}
                    onClick={() => goToQuestion(idx)}
                    disabled={isPaused}
                    className={cn(
                      "h-9 rounded-md text-sm font-medium transition-all border-2",
                      isCurrent
                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20 ring-offset-1"
                        : isAnswered
                          ? "border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400"
                          : "border-transparent bg-secondary text-muted-foreground hover:bg-secondary/80",
                      isPaused && "opacity-50 pointer-events-none",
                    )}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary/10 border border-primary"></div>{" "}
                Current
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500/10 border border-green-500/50"></div>{" "}
                Answered
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary border border-transparent"></div>{" "}
                Not Answered
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
