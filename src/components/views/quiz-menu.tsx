import { useQuiz } from "@/components/quiz-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Play, Settings, BookOpen, Clock } from "lucide-react";

export function QuizMenu() {
  const {
    selectedQuiz,
    topics,
    settings,
    updateSettings,
    startGame,
    backToSubjects,
  } = useQuiz();

  if (!selectedQuiz) return null;

  return (
    <div className="container max-w-md mx-auto min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full shadow-xl border-border overflow-hidden animate-in slide-in-from-bottom-4 duration-500 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 z-10 text-white hover:bg-white/20 hover:text-white"
          onClick={backToSubjects}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="bg-gradient-to-r from-primary to-violet-600 p-8 pt-12 text-center text-white relative">
          <div
            className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"
            style={{ backgroundSize: "20px 20px" }}
          ></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 shadow-inner">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              {selectedQuiz.name}
            </h2>
            <p className="text-primary-foreground/80 text-sm mt-1">
              Configure your session
            </p>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Topic Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Settings className="h-4 w-4" /> Select Topic
            </label>
            <Select
              value={settings.topic}
              onValueChange={(val) => updateSettings({ topic: val })}
            >
              <SelectTrigger className="w-full h-12">
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Question Count */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">
              Number of Questions
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[5, 10, 15, 20].map((num) => (
                <Button
                  key={num}
                  variant={
                    settings.questionCount === num ? "default" : "outline"
                  }
                  className="h-10"
                  onClick={() => updateSettings({ questionCount: num })}
                >
                  {num}
                </Button>
              ))}
              <Button
                variant={
                  settings.questionCount === "full" ? "default" : "outline"
                }
                className="h-10"
                onClick={() => updateSettings({ questionCount: "full" })}
              >
                ALL
              </Button>
            </div>
          </div>

          {/* Timer Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background rounded-full text-primary">
                <Clock className="h-4 w-4" />
              </div>
              <span className="font-medium text-sm">Enable Timer</span>
            </div>
            <Switch
              checked={settings.timerEnabled}
              onCheckedChange={(checked) =>
                updateSettings({ timerEnabled: checked })
              }
            />
          </div>

          <Button
            size="lg"
            className="w-full h-14 text-lg gap-2 mt-4"
            onClick={startGame}
          >
            <Play className="h-5 w-5 fill-current" /> Start Quiz
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
