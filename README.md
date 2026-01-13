# Quiz Bank (React Version)

A modern, interactive, and responsive web-based quiz application rebuilt with **React**, **TypeScript**, **Tailwind CSS**, and **Shadcn UI**.

## Features

-   **Modern Tech Stack:** Built with Vite, React 18, and TypeScript for robust performance.
-   **Shadcn UI:** Beautiful, accessible, and customizable components.
-   **Dark Mode:** Fully supported dark mode with system preference detection and persistence.
-   **Multiple Subjects:** Dynamic support for different question banks (Web Technology, OOP with Java, Data Structures).
-   **Interactive Gameplay:**
    -   Timer mode with pause functionality.
    -   Smooth transitions and animations.
    -   Instant feedback and detailed result analysis.
-   **Responsive Design:** Optimized for all screen sizes.

## Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   npm (v9 or higher)

### Installation

1.  **Navigate to the project directory:**
    ```bash
    cd quiz-bank
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Running the Application

Start the development server:
```bash
npm run dev
```
Open your browser to `http://localhost:5173`.

### Building for Production

To create a production-ready build:
```bash
npm run build
```

## Project Structure

```
quiz-bank/
├── public/                 # Static assets (JSON question banks)
├── scripts/                # Utility scripts
├── src/
│   ├── components/
│   │   ├── ui/             # Shadcn UI reusable components
│   │   ├── views/          # Main application screens (Menu, Game, Result)
│   │   ├── quiz-context.tsx# Global state management
│   │   └── theme-provider.tsx # Dark mode context
│   ├── lib/
│   │   └── utils.ts        # CN utility for Tailwind
│   ├── App.tsx             # Main Layout
│   └── main.tsx            # Entry point
└── index.html              # HTML template
```

## Adding New Quizzes

1.  **Add JSON File:** Place your `my-quiz.json` file in the `public/` directory.
2.  **Update Config:** Open `src/lib/constants.ts` and add an entry to the `QUIZ_CONFIG` array:
    ```typescript
    {
        id: 'my-quiz',
        name: 'My New Subject',
        file: '/my-quiz.json',
        description: 'Description...',
        icon: 'globe' // 'globe' | 'coffee' | 'cpu'
    }
    ```

## License

Open Source.

## Utilities

### PDF to JSON Converter

A Python script is included to help convert PDF question banks into the required JSON format.

Location: `scripts/pdf_to_json_converter.py`

Usage:
1. Install Python.
2. Run the script and follow instructions (or modify it as needed for your specific PDF format).
