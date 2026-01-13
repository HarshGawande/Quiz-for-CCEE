import { useQuiz } from "@/components/quiz-context";
import { QUIZ_CONFIG } from "@/lib/constants";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Coffee, Cpu, BookOpen } from "lucide-react";

export function SubjectSelection() {
  const { selectQuiz } = useQuiz();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "globe": return <Globe className="h-8 w-8" />;
      case "coffee": return <Coffee className="h-8 w-8" />;
      case "cpu": return <Cpu className="h-8 w-8" />;
      default: return <BookOpen className="h-8 w-8" />;
    }
  };

  return (
    <div className="container max-w-5xl mx-auto py-12 px-4 animate-in fade-in duration-500">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
          Select a Subject
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose a topic bank to start your quiz session. Prepare for your exams with our curated questions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {QUIZ_CONFIG.map((quiz) => (
          <Card
            key={quiz.id}
            onClick={() => selectQuiz(quiz.id)}
            className="group cursor-pointer border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                {getIcon(quiz.icon)}
              </div>
              <div className="space-y-1 flex-1">
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {quiz.name}
                </CardTitle>
                <Badge variant="secondary" className="text-xs font-normal">
                  Available Now
                </Badge>
              </div>
            </CardHeader>
            <div className="px-6 pb-6 pt-2">
               <CardDescription className="text-base leading-relaxed">
                  {quiz.description}
               </CardDescription>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
