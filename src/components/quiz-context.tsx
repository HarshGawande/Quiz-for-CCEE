import React, { createContext, useContext, useEffect, useState } from 'react';
import { QuizQuestion, QuizConfig, GameState, QuizSettings } from '@/lib/types';
import { QUIZ_CONFIG } from '@/lib/constants';

// --- Types ---

type QuizContextType = {
  gameState: GameState;
  selectedQuiz: QuizConfig | null;
  settings: QuizSettings;
  questions: QuizQuestion[];
  currentSession: QuizQuestion[];
  currentIndex: number;
  answers: Record<number, string>;
  timer: number;
  isTimerRunning: boolean;
  error: string | null;
  topics: string[];

  // Actions
  selectQuiz: (quizId: string) => Promise<void>;
  updateSettings: (settings: Partial<QuizSettings>) => void;
  startGame: () => void;
  answerQuestion: (option: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (index: number) => void;
  toggleTimer: () => void;
  finishGame: () => void;
  restartGame: () => void;
  backToSubjects: () => void;
};



// --- Context ---

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>('subject-selection');
  const [selectedQuiz, setSelectedQuiz] = useState<QuizConfig | null>(null);
  const [settings, setSettings] = useState<QuizSettings>({
    topic: 'All',
    questionCount: 10,
    timerEnabled: true,
  });

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentSession, setCurrentSession] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<string[]>([]);

  // Timer Effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else if (!isTimerRunning && timer !== 0) {
      clearInterval(interval!);
    }
    return () => clearInterval(interval!);
  }, [isTimerRunning, timer]);

  const selectQuiz = async (quizId: string) => {
    const config = QUIZ_CONFIG.find((q) => q.id === quizId);
    if (!config) return;

    setSelectedQuiz(config);
    setGameState('loading');
    setError(null);

    try {
      const response = await fetch(config.file);
      if (!response.ok) {
        throw new Error(`Failed to load questions: ${response.statusText}`);
      }

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("The question file is empty or invalid.");
      }

      const questionsData = data as QuizQuestion[];
      setQuestions(questionsData);

      const uniqueTopics = Array.from(new Set(questionsData.map((q) => q.topic).filter((t) => t))).sort() as string[];
      setTopics(["All", ...uniqueTopics]);

      setSettings(prev => ({ ...prev, topic: "All" }));
      setGameState('menu');

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setGameState('error');
    }
  };

  const updateSettings = (newSettings: Partial<QuizSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const startGame = () => {
    const isFullQuiz = settings.questionCount === "full";
    let filtered = questions;

    if (!isFullQuiz && settings.topic !== "All") {
        filtered = questions.filter(q => q.topic === settings.topic);
    }

    if (filtered.length === 0) {
        alert("No questions found for this topic!");
        return;
    }

    const requestedCount = isFullQuiz ? filtered.length : settings.questionCount;

    // Shuffle
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    const sessionQuestions = isFullQuiz ? shuffled : shuffled.slice(0, Math.min(requestedCount as number, shuffled.length));

    setCurrentSession(sessionQuestions);
    setCurrentIndex(0);
    setAnswers({});
    setTimer(0);
    setIsTimerRunning(settings.timerEnabled);
    setGameState('playing');
  };

  const answerQuestion = (option: string) => {
    const currentQ = currentSession[currentIndex];
    setAnswers((prev) => ({ ...prev, [currentQ.id]: option }));
  };

  const nextQuestion = () => {
    if (currentIndex < currentSession.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const goToQuestion = (index: number) => {
      if (index >= 0 && index < currentSession.length) {
          setCurrentIndex(index);
      }
  }

  const toggleTimer = () => {
    setIsTimerRunning((prev) => !prev);
  };

  const finishGame = () => {
    setIsTimerRunning(false);
    setGameState('result');
  };

  const restartGame = () => {
    setGameState('menu');
    setTimer(0);
    setAnswers({});
    setIsTimerRunning(false);
  };

  const backToSubjects = () => {
    setGameState('subject-selection');
    setSelectedQuiz(null);
    setQuestions([]);
    setTopics([]);
  };

  return (
    <QuizContext.Provider
      value={{
        gameState,
        selectedQuiz,
        settings,
        questions,
        currentSession,
        currentIndex,
        answers,
        timer,
        isTimerRunning,
        error,
        topics,
        selectQuiz,
        updateSettings,
        startGame,
        answerQuestion,
        nextQuestion,
        prevQuestion,
        goToQuestion,
        toggleTimer,
        finishGame,
        restartGame,
        backToSubjects,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};
