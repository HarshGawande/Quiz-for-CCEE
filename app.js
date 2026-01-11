// State Management
const state = {
    gameState: "loading", // loading, menu, playing, result, error
    settings: {
        topic: "All",
        questionCount: 10,
        timerEnabled: true
    },
    questions: [],      // All loaded questions
    currentSession: [], // Questions for the current game
    currentIndex: 0,
    answers: {},        // { questionId: selectedOption }
    timer: 0,
    isTimerRunning: false,
    intervalId: null
};

// Icon Configuration
const ICONS = {
    bookOpen: `<i data-lucide="book-open"></i>`,
    settings: `<i data-lucide="settings"></i>`,
    play: `<i data-lucide="play"></i>`,
    playCircle: `<i data-lucide="play-circle"></i>`,
    pause: `<i data-lucide="pause"></i>`,
    clock: `<i data-lucide="clock"></i>`,
    checkCircle: `<i data-lucide="check-circle"></i>`,
    chevronRight: `<i data-lucide="chevron-right"></i>`,
    chevronLeft: `<i data-lucide="chevron-left"></i>`,
    rotateCcw: `<i data-lucide="rotate-ccw"></i>`,
    award: `<i data-lucide="award"></i>`,
    alertCircle: `<i data-lucide="alert-circle"></i>`,
    list: `<i data-lucide="list"></i>`,
    x: `<i data-lucide="x"></i>`
};

// --- Initialization ---

async function init() {
    try {
        const response = await fetch('./extracted_questions-wbt.json');

        if (!response.ok) {
            throw new Error(`Failed to load questions: ${response.statusText}`);
        }

        const data = await response.json();
        state.questions = data;

        // Extract topics
        const topics = new Set(data.map(q => q.topic));
        state.topics = ["All", ...Array.from(topics)];

        state.gameState = "menu";
        render();
    } catch (error) {
        console.error(error);
        state.error = error.message;
        state.gameState = "error";
        render();
    }
}

// --- Logic ---

function startGame() {
    // If FULL is selected, use all questions regardless of topic
    const isFullQuiz = state.settings.questionCount === "full";
    
    let filtered = state.questions;
    if (!isFullQuiz && state.settings.topic !== "All") {
        filtered = state.questions.filter(q => q.topic === state.settings.topic);
    }

    // Check if there are enough questions (only if not FULL)
    const availableCount = filtered.length;
    const requestedCount = isFullQuiz ? availableCount : state.settings.questionCount;
    state.insufficientQuestionsWarning = null;
    
    if (!isFullQuiz && availableCount < requestedCount) {
        state.insufficientQuestionsWarning = {
            requested: requestedCount,
            available: availableCount
        };
    }

    // Shuffle and use all questions if FULL, otherwise use requested count
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    state.currentSession = isFullQuiz ? shuffled : shuffled.slice(0, Math.min(requestedCount, shuffled.length));

    state.currentIndex = 0;
    state.answers = {};
    state.timer = 0;
    state.isTimerRunning = state.settings.timerEnabled;
    state.gameState = "playing";

    if (state.isTimerRunning) startTimer();
    render();
}

function startTimer() {
    if (state.intervalId) clearInterval(state.intervalId);
    state.intervalId = setInterval(() => {
        state.timer++;
        updateTimerDisplay(); // Optimized update
    }, 1000);
}

function stopTimer() {
    if (state.intervalId) clearInterval(state.intervalId);
    state.intervalId = null;
}

function toggleTimer() {
    state.isTimerRunning = !state.isTimerRunning;
    if (state.isTimerRunning) {
        startTimer();
    } else {
        stopTimer();
    }
    updateTimerStateUI();
}

function handleAnswer(option) {
    const currentQ = state.currentSession[state.currentIndex];
    state.answers[currentQ.id] = option;
    updateOptionsUI();
}

function previousQuestion() {
    if (state.currentIndex > 0) {
        state.currentIndex--;
        updateQuestionDisplay();
        updateQuestionNavPanel();
    }
}

function nextQuestion() {
    if (state.currentIndex < state.currentSession.length - 1) {
        state.currentIndex++;
        // Use smooth transition instead of full re-render
        updateQuestionDisplay();
        updateQuestionNavPanel();
    }
}

function goToQuestion(index) {
    if (index >= 0 && index < state.currentSession.length) {
        state.currentIndex = index;
        updateQuestionDisplay();
        updateQuestionNavPanel();
    }
}

function updateQuestionNavPanel() {
    const navPanel = document.getElementById('question-nav-panel');
    if (!navPanel) return;
    
    const questionNavList = state.currentSession.map((q, idx) => {
        const isAnswered = !!state.answers[q.id];
        const isCurrent = idx === state.currentIndex;
        let statusClass = 'bg-slate-100 text-slate-600 border-slate-200';
        if (isCurrent) {
            statusClass = 'bg-indigo-600 text-white border-indigo-600 shadow-md';
        } else if (isAnswered) {
            statusClass = 'bg-green-100 text-green-700 border-green-300';
        }
        return `
            <button 
                data-action="goto-question" 
                data-index="${idx}"
                class="w-10 h-10 rounded-lg border-2 font-bold text-sm transition-all hover:scale-110 ${statusClass} ${isCurrent ? 'ring-2 ring-indigo-300' : ''}"
                title="${isAnswered ? 'Answered' : 'Not answered'}"
            >
                ${idx + 1}
            </button>
        `;
    }).join('');
    
    const buttonsContainer = navPanel.querySelector('.flex.flex-wrap');
    if (buttonsContainer) {
        buttonsContainer.innerHTML = questionNavList;
    }
}

function updateQuestionDisplay() {
    const question = state.currentSession[state.currentIndex];
    if (!question) return;
    
    // Update question number immediately (no transition needed)
    const questionNumEl = document.querySelector('[data-question-num]');
    if (questionNumEl) {
        questionNumEl.innerHTML = `Q ${state.currentIndex + 1} <span class="text-slate-400">/</span> ${state.currentSession.length}`;
    }
    
    // Update topic badge immediately
    const topicBadge = document.querySelector('[data-topic-badge]');
    if (topicBadge) {
        topicBadge.textContent = question.topic;
    }
    
    // Update progress bar smoothly
    const progressBar = document.querySelector('[data-progress-bar]');
    if (progressBar) {
        const progress = state.currentSession.length > 0 ? ((state.currentIndex + 1) / state.currentSession.length) * 100 : 0;
        progressBar.style.width = `${progress}%`;
    }
    
    // Update question text and options with cross-fade transition
    const questionText = document.querySelector('[data-question-text]');
    const optionsContainer = document.getElementById('options-list');
    
    if (questionText && optionsContainer) {
        // Fade out both simultaneously
        questionText.style.transition = 'opacity 0.15s ease-out';
        optionsContainer.style.transition = 'opacity 0.15s ease-out';
        questionText.style.opacity = '0';
        optionsContainer.style.opacity = '0';
        
        // Update content and fade in after a brief delay
        requestAnimationFrame(() => {
            setTimeout(() => {
                questionText.textContent = question.question;
                optionsContainer.innerHTML = getOptionsHTML(question);
                lucide.createIcons();
                
                // Fade in
                requestAnimationFrame(() => {
                    questionText.style.opacity = '1';
                    optionsContainer.style.opacity = '1';
                });
            }, 150);
        });
    }
    
        // Update navigation buttons state
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        if (prevBtn) {
            const canGoPrevious = state.currentIndex > 0;
            prevBtn.disabled = !canGoPrevious;
            prevBtn.className = `px-4 py-3 rounded-xl font-medium flex items-center gap-2 transition-all transform ${
                !canGoPrevious
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 active:scale-95'
            }`;
        }
        
        if (nextBtn) {
            const canGoNext = state.currentIndex < state.currentSession.length - 1;
            nextBtn.disabled = !canGoNext;
            nextBtn.className = `px-4 py-3 rounded-xl font-medium flex items-center gap-2 transition-all transform ${
                !canGoNext
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 active:scale-95'
            }`;
        }
        
        // Update question navigation panel if visible
        updateQuestionNavPanel();
}

function finishGame() {
    stopTimer();
    state.gameState = "result";
    render();
}

function restartGame() {
    state.gameState = "menu";
    state.timer = 0;
    state.answers = {};
    state.insufficientQuestionsWarning = null;
    render();
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function calculateScore() {
    let score = 0;
    state.currentSession.forEach(q => {
        if (state.answers[q.id] === q.answer) score++;
    });
    return score;
}

// --- Specific UI Updates ---

function updateOptionsUI() {
    const question = state.currentSession[state.currentIndex];
    const container = document.getElementById('options-list');
    if (container) {
        // Update only the option buttons that changed - no full re-render
        const options = container.querySelectorAll('[data-action="answer"]');
        const isPausedButEnabled = state.settings.timerEnabled && !state.isTimerRunning;
        const selectedAnswer = state.answers[question.id];
        
        options.forEach((btn) => {
            const optionValue = btn.dataset.value;
            const isSelected = selectedAnswer === optionValue;
            
            // Update classes smoothly without re-rendering
            btn.className = `w-full text-left p-5 rounded-xl border-2 transition-all flex items-center justify-between group 
                ${isSelected
                ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-md transform scale-[1.01]'
                : 'border-slate-100 bg-white text-slate-600 hover:border-indigo-200 hover:bg-slate-50 hover:shadow-sm'}
                ${isPausedButEnabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`;
            
            // Update checkmark icon only if needed
            const iconContainer = btn.querySelector('div:last-child');
            if (iconContainer) {
                const currentIcon = iconContainer.querySelector('i[data-lucide]');
                const hasCheckIcon = currentIcon && currentIcon.getAttribute('data-lucide') === 'check-circle';
                
                if (isSelected && !hasCheckIcon) {
                    iconContainer.innerHTML = `<div class="text-indigo-600 w-6 h-6">${ICONS.checkCircle}</div>`;
                    lucide.createIcons();
                } else if (!isSelected && hasCheckIcon) {
                    iconContainer.innerHTML = `<div class="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-indigo-300 transition-colors"></div>`;
                }
            }
        });
    }
    
    // Update question navigation panel to reflect answer status
    updateQuestionNavPanel();
}

function updateTimerStateUI() {
    const overlay = document.getElementById('pause-overlay');
    const playBtnIcon = document.querySelector('#timer-toggle-play div');
    const isPaused = !state.isTimerRunning;

    // Toggle Overlay
    if (overlay) {
        if (isPaused) {
            overlay.classList.remove('hidden');
            // Re-render overlay content to ensure binding if needed (though static is fine)
        } else {
            overlay.classList.add('hidden');
        }
    }

    // Update Play/Pause Icon
    if (playBtnIcon) {
        playBtnIcon.innerHTML = state.isTimerRunning ? ICONS.pause : ICONS.playCircle;
        lucide.createIcons();
    }

    // Update Options Visual State (Grayscale/Disabled look)
    updateOptionsUI(); // Re-renders options to apply the "disabled/opacity" logic
}

// --- DOM Rendering ---

const app = document.getElementById('app');

function render() {
    app.innerHTML = '';

    switch (state.gameState) {
        case 'loading':
            app.innerHTML = renderLoading();
            break;
        case 'error':
            app.innerHTML = renderError();
            break;
        case 'menu':
            app.innerHTML = renderMenu();
            break;
        case 'playing':
            app.innerHTML = renderPlaying();
            break;
        case 'result':
            app.innerHTML = renderResult();
            break;
    }

    // Refresh Icons
    lucide.createIcons();

    // Attach Event Listeners
    attachListeners();
}

// --- View Components (Template Strings) ---

function renderLoading() {
    return `
        <div class="flex-1 flex items-center justify-center">
             <div class="animate-pulse flex flex-col items-center gap-4">
                <div class="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-indigo-900 font-medium">Loading Learning Experience...</p>
            </div>
        </div>
    `;
}

function renderError() {
    return `
        <div class="flex-1 flex items-center justify-center p-4">
            <div class="bg-white max-w-md w-full rounded-2xl shadow-xl border-l-4 border-red-500 p-8">
                <div class="flex items-center gap-4 mb-4 text-red-600">
                    ${ICONS.alertCircle}
                    <h2 class="text-xl font-bold">Unable to Load Quiz Data</h2>
                </div>
                <p class="text-slate-600 mb-6">
                    We couldn't fetch the questions (<b>${state.error}</b>). 
                    <br><br>
                    Make sure you are running this via a local server (e.g. <code>python -m http.server</code>) to avoid CORS issues with JSON files.
                </p>
                <button onclick="location.reload()" class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-lg transition-colors">
                    Try Again
                </button>
            </div>
        </div>
    `;
}

function renderMenu() {
    const topicOptions = state.topics.map(t =>
        `<option value="${t}" ${state.settings.topic === t ? 'selected' : ''}>${t}</option>`
    ).join('');

    const counts = [5, 10, 15, 20].map(num => `
        <button 
            data-action="set-count" 
            data-value="${num}"
            class="flex-1 py-2 rounded-lg text-sm font-medium transition-all ${state.settings.questionCount === num ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
        >
            ${num}
        </button>
    `).join('');

    return `
      <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
        <div class="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-slide-up">
          <div class="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-center text-white relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-full bg-white opacity-5" style="background-image: radial-gradient(circle, #fff 2px, transparent 2px); background-size: 20px 20px;"></div>
            <div class="relative z-10">
                <div class="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <div class="w-8 h-8 text-white">${ICONS.bookOpen}</div>
                </div>
                <h1 class="text-3xl font-bold mb-2 tracking-tight">Web Tech Quiz</h1>
                <p class="text-indigo-100 opacity-90 font-light">Test your knowledge with WBT Question Bank</p>
            </div>
          </div>

          <div class="p-8 space-y-6">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <div class="w-4 h-4 text-indigo-500">${ICONS.settings}</div> Select Topic
              </label>
              <select id="topic-select" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700">
                ${topicOptions}
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Number of Questions</label>
              <div class="flex gap-2 flex-wrap">
                ${counts}
                <button 
                    data-action="set-count" 
                    data-value="full"
                    class="flex-1 py-2 rounded-lg text-sm font-medium transition-all ${state.settings.questionCount === 'full' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
                >
                    FULL
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span class="text-sm font-medium text-slate-700">Enable Timer</span>
              <button id="toggle-timer-setting" class="w-12 h-6 rounded-full transition-colors relative ${state.settings.timerEnabled ? 'bg-indigo-600' : 'bg-slate-300'}">
                <div class="absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${state.settings.timerEnabled ? 'left-7' : 'left-1'}"></div>
              </button>
            </div>

            <button id="start-btn" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all transform active:scale-95 flex items-center justify-center gap-2 hover:shadow-xl">
              <div class="w-5 h-5 fill-current">${ICONS.play}</div> Start Quiz
            </button>
          </div>
        </div>
      </div>
    `;
}

// --- Helpers ---

function escapeHtml(text) {
    if (!text) return text;
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function renderPlaying() {
    const question = state.currentSession[state.currentIndex];
    const isPausedButEnabled = state.settings.timerEnabled && !state.isTimerRunning;
    const progress = state.currentSession.length > 0 ? ((state.currentIndex + 1) / state.currentSession.length) * 100 : 0;
    const canGoPrevious = state.currentIndex > 0;
    const canGoNext = state.currentIndex < state.currentSession.length - 1;
    
    // Generate question navigation list
    const questionNavList = state.currentSession.map((q, idx) => {
        const isAnswered = !!state.answers[q.id];
        const isCurrent = idx === state.currentIndex;
        let statusClass = 'bg-slate-100 text-slate-600 border-slate-200';
        if (isCurrent) {
            statusClass = 'bg-indigo-600 text-white border-indigo-600 shadow-md';
        } else if (isAnswered) {
            statusClass = 'bg-green-100 text-green-700 border-green-300';
        }
        return `
            <button 
                data-action="goto-question" 
                data-index="${idx}"
                class="w-10 h-10 rounded-lg border-2 font-bold text-sm transition-all hover:scale-110 ${statusClass} ${isCurrent ? 'ring-2 ring-indigo-300' : ''}"
                title="${isAnswered ? 'Answered' : 'Not answered'}"
            >
                ${idx + 1}
            </button>
        `;
    }).join('');

    return `
      <div class="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:p-8 font-sans">
        
        <!-- Header -->
        <div class="w-full max-w-3xl flex justify-between items-center mb-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100 animate-fade-in">
          <div class="flex items-center gap-2 text-slate-600 font-medium">
            <span class="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide" data-topic-badge>
              ${escapeHtml(question.topic)}
            </span>
            <span class="text-slate-400">|</span>
            <span data-question-num>Q ${state.currentIndex + 1} <span class="text-slate-400">/</span> ${state.currentSession.length}</span>
          </div>
          
          <div class="flex items-center gap-4">
            <button 
                id="end-btn"
                class="px-4 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
                title="End Quiz Early"
            >
                End Quiz
            </button>
            ${state.settings.timerEnabled ? `
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-2 text-indigo-600 font-bold bg-indigo-50 px-4 py-2 rounded-lg tabular-nums">
                  <div class="w-4 h-4 flex items-center justify-center">${ICONS.clock}</div>
                  <span id="timer-text">${formatTime(state.timer)}</span>
                </div>
                <button id="timer-toggle-play" class="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-indigo-600 transition-colors">
                  <div class="w-5 h-5 flex items-center justify-center">${state.isTimerRunning ? ICONS.pause : ICONS.playCircle}</div>
                </button>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Warning Message -->
        ${state.insufficientQuestionsWarning ? `
          <div class="w-full max-w-3xl mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 w-5 h-5 text-red-600 mt-0.5">${ICONS.alertCircle}</div>
              <div class="flex-1">
                <p class="text-sm font-medium text-red-800">
                  <strong>Warning:</strong> Not enough questions available for this topic. 
                  You requested <strong>${state.insufficientQuestionsWarning.requested}</strong> questions, 
                  but only <strong>${state.insufficientQuestionsWarning.available}</strong> are available. 
                  Proceeding with <strong>${state.insufficientQuestionsWarning.available}</strong> questions.
                </p>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Question Navigator Panel -->
        <div id="question-nav-panel" class="w-full max-w-3xl mb-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wide">Question Navigator</h3>
            <button 
                id="submit-btn"
                class="px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all transform bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 active:scale-95"
                title="Submit Quiz"
            >
                Submit Quiz
                <div class="w-4 h-4 flex items-center justify-center">${ICONS.checkCircle}</div>
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            ${questionNavList}
          </div>
          <div class="mt-3 flex items-center gap-4 text-xs text-slate-500">
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded-lg bg-indigo-600 border-2 border-indigo-600"></div>
              <span>Current</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded-lg bg-green-100 border-2 border-green-300"></div>
              <span>Answered</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded-lg bg-slate-100 border-2 border-slate-200"></div>
              <span>Not Answered</span>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="w-full max-w-3xl h-2 bg-slate-200 rounded-full mb-8 overflow-hidden">
          <div class="h-full bg-indigo-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" data-progress-bar style="width: ${progress}%"></div>
        </div>

        <!-- Question Card -->
        <div class="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex-1 flex flex-col relative animate-slide-up">
          
           <!-- Pause Overlay -->
           <div id="pause-overlay" class="absolute inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center z-20 animate-fade-in ${isPausedButEnabled ? '' : 'hidden'}">
                <div class="bg-white p-8 rounded-2xl shadow-2xl border border-indigo-100 flex flex-col items-center text-center max-w-xs transform scale-110">
                  <div class="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                    <div class="w-8 h-8">${ICONS.pause}</div>
                  </div>
                  <h3 class="font-bold text-xl text-slate-800 mb-1">Quiz Paused</h3>
                  <p class="text-slate-500 mb-6">Take a breather.</p>
                  <button id="resume-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-200">
                    Resume
                  </button>
                </div>
           </div>

          <div class="p-8 md:p-12 border-b border-slate-100 bg-gradient-to-br from-white to-slate-50">
            <h2 class="text-2xl md:text-3xl font-bold text-slate-800 leading-tight" data-question-text>
              ${escapeHtml(question.question)}
            </h2>
          </div>

          <div id="options-list" class="p-8 space-y-4 flex-1">
            ${getOptionsHTML(question)}
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-100 flex justify-end items-center gap-2">
            <button 
                id="prev-btn"
                ${!canGoPrevious ? 'disabled' : ''}
                class="px-4 py-3 rounded-xl font-medium flex items-center gap-2 transition-all transform
                ${!canGoPrevious
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 active:scale-95'}"
                title="Previous Question"
            >
              <div class="w-5 h-5 flex items-center justify-center">${ICONS.chevronLeft}</div>
              Previous
            </button>
            
            <button 
                id="next-btn"
                ${!canGoNext ? 'disabled' : ''}
                class="px-4 py-3 rounded-xl font-medium flex items-center gap-2 transition-all transform
                ${!canGoNext
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 active:scale-95'}"
                title="Next Question"
            >
              Next
              <div class="w-5 h-5 flex items-center justify-center">${ICONS.chevronRight}</div>
            </button>
          </div>
        </div>
      </div>
    `;
}

function getOptionsHTML(question) {
    const isPausedButEnabled = state.settings.timerEnabled && !state.isTimerRunning;

    return question.options.map((opt, idx) => {
        const isSelected = state.answers[question.id] === opt;
        return `
            <button 
                data-action="answer" 
                data-value="${escapeHtml(opt)}"
                class="w-full text-left p-5 rounded-xl border-2 transition-all flex items-center justify-between group 
                ${isSelected
                ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-md transform scale-[1.01]'
                : 'border-slate-100 bg-white text-slate-600 hover:border-indigo-200 hover:bg-slate-50 hover:shadow-sm'}
                ${isPausedButEnabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
                "
            >
                <div class="flex items-center gap-4">
                    <span class="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 font-semibold text-sm group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        ${String.fromCharCode(65 + idx)}
                    </span>
                    <span class="font-medium text-lg">${escapeHtml(opt)}</span>
                </div>
                ${isSelected ? `<div class="text-indigo-600 w-6 h-6 animate-fade-in">${ICONS.checkCircle}</div>` : `<div class="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-indigo-300 transition-colors"></div>`}
            </button>
        `;
    }).join('');
}

function renderResult() {
    const score = calculateScore();
    const total = state.currentSession.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const timeSpent = formatTime(state.timer);

    let message = "Good Effort!";
    if (percentage >= 90) message = "Outstanding!";
    else if (percentage >= 70) message = "Great Job!";
    else if (percentage >= 50) message = "Well Done!";
    else if (percentage >= 30) message = "Keep Learning!";

    // Generate Review HTML
    const reviewHtml = state.currentSession.map((q, index) => {
        const userAnswer = state.answers[q.id];
        const isCorrect = userAnswer === q.answer;
        const isSkipped = userAnswer === undefined;

        // Define styles based on status
        let statusClass = 'border-slate-200 bg-slate-50';
        let icon = ICONS.alertCircle;
        let iconClass = 'text-slate-400';

        if (!isSkipped) {
            if (isCorrect) {
                statusClass = 'border-green-200 bg-green-50/50';
                icon = ICONS.checkCircle;
                iconClass = 'text-green-600';
            } else {
                statusClass = 'border-red-200 bg-red-50/50';
                icon = ICONS.alertCircle;
                iconClass = 'text-red-500';
            }
        }

        return `
            <div class="rounded-xl border ${statusClass} p-5 transition-all hover:bg-white hover:shadow-md">
                <div class="flex items-start gap-4">
                    <div class="mt-1 w-6 h-6 flex-shrink-0 ${iconClass} flex items-center justify-center">
                        ${icon}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">Q${index + 1}</span>
                            <span class="text-xs font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">${escapeHtml(q.topic)}</span>
                        </div>
                        <p class="font-medium text-slate-800 mb-3 text-lg leading-snug">
                            ${escapeHtml(q.question)}
                        </p>
                        
                        <div class="space-y-2 text-sm">
                            ${!isSkipped ? `
                                <div class="flex items-start gap-2">
                                    <span class="font-semibold ${isCorrect ? 'text-green-700' : 'text-red-600'} w-24 flex-shrink-0">Your Answer:</span>
                                    <span class="${isCorrect ? 'text-green-800' : 'text-red-700'} break-words">${escapeHtml(userAnswer)}</span>
                                </div>
                            ` : `
                                <div class="flex items-start gap-2">
                                    <span class="font-semibold text-slate-500 w-24 flex-shrink-0">Status:</span>
                                    <span class="text-slate-500 italic">Skipped</span>
                                </div>
                            `}
                            
                            ${(!isCorrect) ? `
                                <div class="flex items-start gap-2">
                                    <span class="font-semibold text-indigo-600 w-24 flex-shrink-0">Correct:</span>
                                    <span class="text-indigo-800 break-words">${escapeHtml(q.answer)}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    return `
      <div class="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
        <div class="max-w-4xl mx-auto space-y-6 animate-slide-up">
          
          <!-- Summary Card -->
          <div class="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 text-center relative">
            <div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 md:p-10 text-white relative overflow-hidden">
               <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(#fff 2px, transparent 2px); background-size: 30px 30px;"></div>
               
              <div class="inline-flex p-4 bg-white/20 rounded-full mb-4 backdrop-blur-md border border-white/30 shadow-xl">
                <div class="w-12 h-12 text-white flex items-center justify-center">${ICONS.award}</div>
              </div>
              <h1 class="text-3xl md:text-4xl font-bold mb-2 text-white drop-shadow-sm">${message}</h1>
              <p class="text-indigo-100 text-lg opacity-90">You completed the quiz!</p>
            </div>

            <div class="p-6 md:p-8">
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p class="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Score</p>
                  <p class="text-2xl md:text-3xl font-black text-slate-800">${score} <span class="text-lg text-slate-400 font-medium">/ ${total}</span></p>
                </div>
                <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p class="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Accuracy</p>
                    <p class="text-2xl md:text-3xl font-black ${percentage >= 70 ? 'text-green-600' : 'text-indigo-600'}">${percentage}%</p>
                </div>
                <div class="hidden md:block p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p class="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Time</p>
                    <p class="text-2xl md:text-3xl font-black text-slate-800">${timeSpent}</p>
                </div>
              </div>
              
              <!-- Mobile Time -->
              <div class="md:hidden flex items-center justify-center gap-2 text-slate-500 mb-8 bg-slate-50 inline-block px-4 py-2 rounded-full">
                <div class="w-4 h-4 flex items-center justify-center">${ICONS.clock}</div> <span class="font-bold text-slate-700">${timeSpent}</span>
              </div>

              <div class="flex flex-col sm:flex-row gap-4 justify-center">
                 <button id="menu-btn" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-6 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                    <div class="w-5 h-5 flex items-center justify-center">${ICONS.settings}</div> Menu
                </button>
                <button id="restart-btn" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-transform active:scale-95 flex items-center justify-center gap-2">
                   <div class="w-5 h-5 flex items-center justify-center">${ICONS.rotateCcw}</div> Try Again
                </button>
              </div>
            </div>
          </div>

          <!-- Question Review Dashboard -->
          <div class="space-y-4">
             <div class="flex items-center gap-2 px-2">
                 <div class="w-5 h-5 text-indigo-600 flex items-center justify-center">${ICONS.bookOpen}</div>
                 <h2 class="text-xl font-bold text-slate-800">Detailed Review</h2>
             </div>
             <div class="grid gap-4">
                ${reviewHtml}
             </div>
          </div>

        </div>
      </div>
    `;
}

// --- Event Delegation ---

function attachListeners() {
    // Only attach global listeners if not already attached? 
    // Actually, since we wipe app.innerHTML, elements are new.
    // We can use event delegation on 'app' or simple binding after render.

    // Using delegation for cleaner re-renders
}

// Global click handler for efficiency
app.addEventListener('click', (e) => {
    // Action Buttons
    const btn = e.target.closest('button');
    if (!btn) return;

    if (btn.id === 'start-btn') startGame();
    if (btn.id === 'prev-btn') previousQuestion();
    if (btn.id === 'next-btn') nextQuestion();
    if (btn.id === 'end-btn') finishGame();
    if (btn.id === 'submit-btn') finishGame();
    if (btn.id === 'timer-toggle-play') toggleTimer();
    if (btn.id === 'resume-btn') toggleTimer();
    if (btn.id === 'restart-btn') restartGame();
    if (btn.id === 'menu-btn') restartGame(); // Reuse start/reload logic to go back to menu
    if (btn.id === 'toggle-timer-setting') {
        state.settings.timerEnabled = !state.settings.timerEnabled;
        updateTimerToggleButton();
    }

    // Dataset Actions
    if (btn.dataset.action === 'set-count') {
        const value = btn.dataset.value;
        state.settings.questionCount = value === 'full' ? 'full' : parseInt(value);
        updateQuestionCountButtons();
    }
    if (btn.dataset.action === 'answer') {
        handleAnswer(btn.dataset.value); // Value in button text is risky if complex, but here options are strings
    }
    if (btn.dataset.action === 'goto-question') {
        const index = parseInt(btn.dataset.index);
        goToQuestion(index);
    }
});

app.addEventListener('change', (e) => {
    if (e.target.id === 'topic-select') {
        state.settings.topic = e.target.value;
        // State updated, no need to re-render immediately for select unless we want to show count
    }
});

function updateTimerDisplay() {
    // Direct DOM manipulation for timer to avoid full re-render flickering
    const display = document.getElementById('timer-text');
    if (display) {
        display.textContent = formatTime(state.timer);
    }
}

function updateQuestionCountButtons() {
    // Update only the question count buttons without re-rendering the entire menu
    const buttons = document.querySelectorAll('[data-action="set-count"]');
    buttons.forEach(btn => {
        const value = btn.dataset.value;
        const btnValue = value === 'full' ? 'full' : parseInt(value);
        const isSelected = state.settings.questionCount === btnValue;
        btn.className = `flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            isSelected 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`;
    });
}

function updateTimerToggleButton() {
    // Update only the timer toggle button without re-rendering the entire menu
    const toggleBtn = document.getElementById('toggle-timer-setting');
    if (toggleBtn) {
        const isEnabled = state.settings.timerEnabled;
        toggleBtn.className = `w-12 h-6 rounded-full transition-colors relative ${
            isEnabled ? 'bg-indigo-600' : 'bg-slate-300'
        }`;
        
        const toggleCircle = toggleBtn.querySelector('div');
        if (toggleCircle) {
            toggleCircle.className = `absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                isEnabled ? 'left-7' : 'left-1'
            }`;
        }
    }
}

// Start
init();
