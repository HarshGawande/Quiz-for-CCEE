import { ThemeProvider, useTheme } from "@/components/theme-provider"
import { QuizProvider, useQuiz } from "@/components/quiz-context"
import { SubjectSelection } from "@/components/views/subject-selection"
import { QuizMenu } from "@/components/views/quiz-menu"
import { GameScreen } from "@/components/views/game-screen"
import { ResultScreen } from "@/components/views/result-screen"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="rounded-full"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

function QuizApp() {
  const { gameState, error, restartGame } = useQuiz()

  if (gameState === 'error') {
      return (
          <div className="flex items-center justify-center min-h-screen p-4">
              <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold text-destructive">Something went wrong</h2>
                  <p className="text-muted-foreground">{error || "Unknown error occurred"}</p>
                  <Button onClick={restartGame}>Try Again</Button>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground transition-colors duration-300">
      <header className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
         <div className="container flex h-14 max-w-7xl items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                    Q
                </div>
                <span>QuizBank</span>
            </div>
            <ThemeToggle />
         </div>
      </header>

      <main className="pt-20 pb-10 min-h-screen">
        {gameState === 'subject-selection' && <SubjectSelection />}
        {gameState === 'loading' && (
             <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="font-medium text-muted-foreground animate-pulse">Loading Question Bank...</p>
             </div>
        )}
        {gameState === 'menu' && <QuizMenu />}
        {gameState === 'playing' && <GameScreen />}
        {gameState === 'result' && <ResultScreen />}
      </main>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <QuizProvider>
        <QuizApp />
      </QuizProvider>
    </ThemeProvider>
  )
}

export default App
