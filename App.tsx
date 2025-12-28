import React, { useState, useCallback, useMemo } from 'react';
import { QUESTIONS, RESULTS, TOTAL_QUESTIONS, MAX_SCORE } from './constants';
import { QuizState, Question } from './types';

// --- Assets / Icons ---

const AitekkaTextLogo = () => (
  <div className="mb-6 animate-fade-in-down">
    <span className="text-5xl md:text-6xl font-black tracking-tighter text-[#1F4E68] lowercase font-sans select-none">
      aitekka
    </span>
  </div>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);

const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-[#F59E0B] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

// --- Subcomponents ---

const ProgressBar: React.FC<{ current: number; total: number }> = ({ current, total }) => {
  const percentage = Math.round(((current + 1) / total) * 100);
  return (
    <div className="w-full bg-slate-100 rounded-full h-3 mb-8 overflow-hidden">
      <div
        className="bg-gradient-to-r from-[#0E7490] to-[#06B6D4] h-3 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(14,116,144,0.3)]"
        style={{ width: `${percentage}%` }}
      ></div>
      <div className="text-right text-xs font-semibold text-[#0E7490] mt-2 tracking-wide uppercase">
        Прашање {current + 1} / {total}
      </div>
    </div>
  );
};

const OptionButton: React.FC<{
  text: string;
  selected: boolean;
  onClick: () => void;
  disabled: boolean;
  state: 'default' | 'correct' | 'wrong' | 'dimmed';
}> = ({ text, onClick, disabled, state }) => {
  let baseClasses = "w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between group relative overflow-hidden ";
  
  // Using logo colors for interaction states
  if (state === 'default') {
    baseClasses += "border-slate-100 bg-white hover:border-[#0E7490] hover:bg-[#ECFEFF] hover:shadow-md text-[#1F4E68] hover:scale-[1.01]";
  } else if (state === 'correct') {
    baseClasses += "border-green-400 bg-green-50 text-green-800 shadow-sm";
  } else if (state === 'wrong') {
    baseClasses += "border-red-300 bg-red-50 text-red-800 opacity-90";
  } else if (state === 'dimmed') {
    baseClasses += "border-slate-50 bg-slate-50 text-slate-400 opacity-50 grayscale";
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
    >
      <span className="text-base md:text-lg font-medium relative z-10 leading-snug">{text}</span>
      {state === 'correct' && (
        <span className="bg-green-200 text-green-700 p-1.5 rounded-full animate-bounce">
          <CheckIcon />
        </span>
      )}
    </button>
  );
};

const QuizCard: React.FC<{
  question: Question;
  onAnswer: (points: number, isCorrect: boolean) => void;
  questionIndex: number;
  totalQuestions: number;
}> = ({ question, onAnswer, questionIndex, totalQuestions }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Difficulty badges - kept largely semantic but styled to match cleanliness
  const difficultyBadge = 
    question.points === 1 ? 'bg-[#ECFEFF] text-[#0E7490] border-[#CFFAFE]' : // Easy -> Cyan (matches logo)
    question.points === 2 ? 'bg-[#FFFBEB] text-[#B45309] border-[#FEF3C7]' : // Medium -> Amber (matches logo envelope)
    'bg-rose-50 text-rose-700 border-rose-100'; // Hard -> Keep red for danger/hard
  
  const difficultyText = 
    question.points === 1 ? '🌱 Лесно' :
    question.points === 2 ? '🚀 Средно' :
    '🔥 Тешко';

  const handleSelect = (id: string) => {
    if (isAnswered) return;
    
    setSelectedId(id);
    setIsAnswered(true);

    const isCorrect = id === question.correctAnswerId;
    const pointsAwarded = isCorrect ? question.points : 0;

    // Small delay before moving to next question
    setTimeout(() => {
      onAnswer(pointsAwarded, isCorrect);
      setSelectedId(null);
      setIsAnswered(false);
    }, 1400);
  };

  return (
    <div className="w-full max-w-2xl bg-white/90 backdrop-blur-sm rounded-[2rem] shadow-2xl shadow-[#0E7490]/10 p-6 md:p-10 mx-auto border border-white">
      <ProgressBar current={questionIndex} total={totalQuestions} />
      
      <div className="flex justify-center mb-6">
        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${difficultyBadge}`}>
          {difficultyText} • {question.points} {question.points === 1 ? 'Поен' : 'Поени'}
        </span>
      </div>

      <h2 className="text-2xl md:text-3xl font-extrabold text-[#1F4E68] mb-10 text-center leading-tight">
        {question.text}
      </h2>

      <div className="space-y-4">
        {question.options.map((opt) => {
          let state: 'default' | 'correct' | 'wrong' | 'dimmed' = 'default';
          
          if (isAnswered) {
            if (opt.id === question.correctAnswerId) {
              state = 'correct'; 
            } else if (opt.id === selectedId && selectedId !== question.correctAnswerId) {
              state = 'wrong'; 
            } else {
              state = 'dimmed';
            }
          }

          return (
            <OptionButton
              key={opt.id}
              text={opt.text}
              selected={selectedId === opt.id}
              disabled={isAnswered}
              onClick={() => handleSelect(opt.id)}
              state={state}
            />
          );
        })}
      </div>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [gameState, setGameState] = useState<QuizState>(QuizState.WELCOME);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);

  const handleStart = () => {
    setGameState(QuizState.PLAYING);
    setCurrentQIndex(0);
    setScore(0);
  };

  const handleAnswer = useCallback((points: number, _isCorrect: boolean) => {
    setScore((prev) => prev + points);
    
    if (currentQIndex < TOTAL_QUESTIONS - 1) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      setGameState(QuizState.FINISHED);
    }
  }, [currentQIndex]);

  const restartQuiz = () => {
    setGameState(QuizState.WELCOME);
    setCurrentQIndex(0);
    setScore(0);
  };

  const finalResult = useMemo(() => {
    if (gameState !== QuizState.FINISHED) return null;
    return RESULTS.find(r => score >= r.minScore && score <= r.maxScore) || RESULTS[0];
  }, [score, gameState]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#CFFAFE] via-[#F8FAFC] to-white flex flex-col items-center justify-center p-4 font-sans text-[#1F4E68]">
      
      {gameState === QuizState.WELCOME && (
        <div className="w-full max-w-xl bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-2xl shadow-[#0E7490]/10 p-8 md:p-14 text-center animate-fade-in-up border border-white">
          <AitekkaTextLogo />
          
          <div className="my-8 space-y-4">
            <h1 className="text-3xl md:text-5xl font-black text-[#1F4E68] tracking-tight leading-tight">
              Колку научи за AI во <span className="text-[#0E7490]">2025</span>?
            </h1>
            <p className="text-[#1F4E68]/80 text-lg md:text-xl font-medium leading-relaxed max-w-sm mx-auto">
              Дали си почетник или стратег? Ајде да провериме!
            </p>
          </div>

          <div className="bg-[#ECFEFF] rounded-2xl p-6 mb-10 border border-[#CFFAFE]">
             <div className="flex justify-center space-x-8 text-sm font-bold text-[#0E7490] uppercase tracking-widest">
                <div className="flex flex-col">
                  <span className="text-2xl mb-1">🚀</span>
                  <span>{TOTAL_QUESTIONS} Прашања</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-2xl mb-1">🎯</span>
                   <span>{MAX_SCORE} Поени</span>
                </div>
             </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full bg-[#0E7490] hover:bg-[#155E75] text-white font-bold py-5 px-8 rounded-2xl transition-all transform hover:scale-[1.03] active:scale-[0.98] shadow-lg shadow-[#0E7490]/30 text-xl tracking-wide"
          >
            Започни Квиз
          </button>
        </div>
      )}

      {gameState === QuizState.PLAYING && (
        <QuizCard
          key={currentQIndex}
          question={QUESTIONS[currentQIndex]}
          questionIndex={currentQIndex}
          totalQuestions={TOTAL_QUESTIONS}
          onAnswer={handleAnswer}
        />
      )}

      {gameState === QuizState.FINISHED && finalResult && (
        <div className="w-full max-w-xl bg-white/90 backdrop-blur rounded-[2.5rem] shadow-2xl shadow-[#0E7490]/10 p-8 md:p-14 text-center border border-white animate-fade-in-up">
          <AitekkaTextLogo />
          
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-[#FCD34D] rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-[#FEF3C7] p-6 rounded-full shadow-inner border border-[#FDE68A]">
              <TrophyIcon />
            </div>
          </div>
          
          <div className="mb-2 text-[#0E7490] font-extrabold uppercase tracking-widest text-sm">
            Твојот Резултат
          </div>
          <div className="text-6xl font-black text-[#1F4E68] mb-6 tracking-tighter">
            {score}<span className="text-3xl text-[#0E7490]/50 font-bold ml-1">/{MAX_SCORE}</span>
          </div>
          
          <div className="bg-gradient-to-br from-[#ECFEFF] to-white rounded-3xl p-8 mb-8 border border-[#CFFAFE]">
            <h3 className="text-2xl font-black text-[#0E7490] mb-3">
              {finalResult.title}
            </h3>
            <p className="text-[#1F4E68]/80 leading-relaxed font-medium">
              {finalResult.description}
            </p>
          </div>

          <button
            onClick={restartQuiz}
            className="text-[#0E7490] font-bold hover:text-[#155E75] transition-colors px-6 py-3 rounded-xl hover:bg-[#ECFEFF]"
          >
            ↺ Обиди се повторно
          </button>
        </div>
      )}

    </div>
  );
};

export default App;