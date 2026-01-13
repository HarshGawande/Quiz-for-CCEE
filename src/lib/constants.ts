import { QuizConfig } from './types';

export const QUIZ_CONFIG: QuizConfig[] = [
    {
        id: 'wbt',
        name: 'Web Technology',
        file: '/extracted_questions-wbt.json',
        description: 'HTTP, HTML5, Web Security, and modern web concepts.',
        icon: 'globe'
    },
    {
        id: 'oops',
        name: 'OOP with Java',
        file: '/extracted_questions-oops.json',
        description: 'Object-Oriented Programming concepts, Java syntax, and patterns.',
        icon: 'coffee'
    },
    {
        id: 'dsa',
        name: 'Data Structures & Algorithms',
        file: '/extracted_questions-4DSA-MCQ-BANK.json',
        description: 'Algorithms, data structures, and problem-solving in Java.',
        icon: 'cpu'
    }
];
