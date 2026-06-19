import React, { useState } from 'react';
import { CountryTrivia, TriviaQuestion } from '../types';
import { HelpCircle, CheckCircle2, XCircle, Trophy, Sparkles, Loader } from 'lucide-react';

interface TriviaModuleProps {
  country: string;
  flag: string;
  level: number;
  onSuccess: () => void;
  onBack: () => void;
}

export default function TriviaModule({ country, flag, level, onSuccess, onBack }: TriviaModuleProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [trivia, setTrivia] = useState<CountryTrivia | null>(null);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [showResults, setShowResults] = useState<boolean>(false);

  // Fetch trivia dynamically from the custom server
  const loadTriviaFromServer = async () => {
    setLoading(true);
    setError(null);
    setTrivia(null);
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setCorrectAnswersCount(0);
    setShowResults(false);

    try {
      const response = await fetch('/api/trivia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country, level }),
      });

      if (!response.ok) {
        throw new Error('No se pudo establecer conexión con el servidor de Trivia.');
      }

      const data = await response.json();
      if (!data || !data.preguntas || data.preguntas.length === 0) {
        throw new Error('Formato de trivia inválido');
      }

      setTrivia(data);
    } catch (err: any) {
      console.error(err);
      setError('Error al conectar con Gemini. Comprueba tu conexión o reintenta en unos instantes.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadTriviaFromServer();
  }, [country, level]);

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
  };

  const handleVerifyAnswer = () => {
    if (!selectedOption || !trivia) return;
    
    const currentQuestion = trivia.preguntas[currentIdx];
    const isCorrect = selectedOption.trim() === currentQuestion.correcta.trim();
    
    if (isCorrect) {
      setCorrectAnswersCount(prev => prev + 1);
    }

    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    if (!trivia) return;
    if (currentIdx + 1 < trivia.preguntas.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const getDifficultyTitle = (lvl: number) => {
    if (lvl === 1) return 'Nivel 1: Fácil (Cromos del Bloque A - Suplentes)';
    if (lvl === 2) return 'Nivel 2: Medio (Cromos del Bloque B - Jugadores Clave)';
    return 'Nivel 3: Difícil (Cromos del Bloque C - Estrellas Franquicia)';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-[#050E0A] border-[4px] border-black rounded-3xl p-8 max-w-2xl mx-auto shadow-[8px_8px_0px_#000]" id="trivia-loading">
        <Loader className="w-12 h-12 text-[#10B981] animate-spin mb-4" />
        <h4 className="text-xl font-bangers text-[#FDDF2B] mb-2 tracking-widest uppercase">CONECTANDO CON SERVIDOR INTERNACIONAL</h4>
        <p className="text-slate-300 text-xs font-comic font-bold max-w-sm">
          Diseñando preguntas tácticas de Nivel {level} personalizadas para {country} en tiempo real con Gemini...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border-[4px] border-black rounded-3xl p-8 text-center shadow-[8px_8px_0px_#000] max-w-md mx-auto" id="trivia-error">
        <XCircle className="w-14 h-14 text-[#EF4444] mx-auto mb-3" />
        <h3 className="text-2xl font-bangers text-black mb-2 uppercase tracking-wider">¡ERROR DE CONEXIÓN!</h3>
        <p className="text-slate-700 font-comic font-semibold text-xs mb-6">{error}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={loadTriviaFromServer}
            className="px-5 py-2.5 bg-[#EF4444] hover:bg-neutral-800 hover:text-white text-white font-bangers text-xs tracking-wider uppercase border-2 border-black rounded-lg cursor-pointer shadow-[2px_2px_0px_#000] active:scale-95 transition-all"
          >
            Reintentar Generar
          </button>
          <button
            onClick={onBack}
            className="px-5 py-2.5 bg-white text-slate-800 font-bangers text-xs tracking-wider uppercase border-2 border-black rounded-lg cursor-pointer shadow-[2px_2px_0px_#000] active:scale-95 transition-all"
          >
            Regresar al Álbum
          </button>
        </div>
      </div>
    );
  }

  if (showResults && trivia) {
    const isSuccess = correctAnswersCount >= 2; // Pass with at least 2 correct answers out of 3

    return (
      <div className="bg-white border-[4px] border-black rounded-3xl p-8 max-w-lg mx-auto text-center shadow-[10px_10px_0px_#000]" id="trivia-results">
        <div className="inline-flex p-4 rounded-full bg-slate-100 text-[#10B981] mb-4 border-2 border-black shadow-[3px_3px_0px_#000] animate-bounce">
          {isSuccess ? <Trophy className="w-12 h-12 text-[#FDDF2B] filter drop-shadow-[2px_2px_0px_#000]" /> : <HelpCircle className="w-12 h-12 text-slate-500" />}
        </div>
        
        <h3 className="text-3xl font-bangers text-black mb-2 uppercase tracking-wider">
          {isSuccess ? '¡EXAMEN COMPLETADO CON EXCELENCIA!' : 'TRIVIA NO SUPERADA'}
        </h3>
        
        <p className="text-slate-700 font-comic font-semibold text-xs mb-6 max-w-sm mx-auto leading-relaxed">
          {isSuccess 
            ? `Has respondido correctamente ${correctAnswersCount}/3 preguntas del examen táctico oficial para ${country}. ¡Nuevo bloque de cromos listo para ser abierto!`
            : `Acertaste ${correctAnswersCount}/3 preguntas. Un Director Técnico profesional requiere al menos obtener 2 aciertos para desbloquear los cromos de este nivel.`
          }
        </p>

        <div className="bg-slate-50 rounded-xl p-5 border-[3px] border-black shadow-[3px_3px_0px_#000] mb-6">
          <span className="text-slate-500 block text-xs uppercase tracking-widest font-mono font-bold">Resultado Obtenido</span>
          <span className="text-3xl font-bangers text-[#EF4444] tracking-widest font-bold">
            {correctAnswersCount * 10} / 30 PUNTOS
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {isSuccess ? (
            <button
               onClick={onSuccess}
              className="w-full py-3 bg-[#10B981] hover:bg-neutral-800 hover:text-white text-black font-bangers text-sm tracking-wider uppercase border-[3px] border-black rounded-xl cursor-pointer shadow-[3px_3px_0px_#000] active:scale-95 transition-all text-center flex items-center justify-center gap-2 bg-halftone-dots"
            >
              <Sparkles className="w-5 h-5 shrink-0" /> IR A LA COLECTA / REVELAR CROMOS DESBLOQUEADOS 💥
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={loadTriviaFromServer}
                className="flex-1 py-3 bg-[#EF4444] hover:bg-neutral-800 hover:text-white text-white font-bangers text-xs tracking-wider uppercase border-2 border-black rounded-lg cursor-pointer shadow-[2px_2px_0px_#000] active:scale-95 transition-all"
              >
                Volver a Intentar
              </button>
              <button
                onClick={onBack}
                className="flex-1 py-3 bg-white text-slate-800 font-bangers text-xs tracking-wider uppercase border-2 border-black rounded-lg cursor-pointer shadow-[2px_2px_0px_#000] active:scale-95 transition-all"
              >
                Atrás
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (trivia) {
    const currentQuestion: TriviaQuestion = trivia.preguntas[currentIdx];

    return (
      <div className="bg-white border-[4px] border-black rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto shadow-[8px_8px_0px_#000]" id="trivia-container">
        {/* Upper HUD */}
        <div className="flex items-center justify-between border-b-[3px] border-black pb-4 mb-6">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#EF4444] tracking-widest font-extrabold block">Examen de Scouting</span>
            <h3 className="text-2xl font-bangers text-black flex items-center gap-2 mt-0.5 uppercase">
              <span>{flag}</span>
              <span>Trivia de {country}</span>
            </h3>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-650 font-mono uppercase font-bold block">Pregunta</span>
            <span className="block text-2xl font-bangers text-slate-900 leading-none">{currentIdx + 1} de 3</span>
          </div>
        </div>

        <div className="inline-block bg-slate-950 text-white rounded-lg px-3 py-1 font-comic font-black uppercase text-xs shadow-[2.5px_2.5px_0px_#EF4444] mb-3">
          {getDifficultyTitle(level)}
        </div>

        {/* Question Text */}
        <div className="my-5">
          <h4 className="text-lg sm:text-xl font-comic font-black text-slate-950 leading-relaxed text-justify">
            {currentQuestion.pregunta}
          </h4>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 gap-3.5 mb-8">
          {currentQuestion.opciones.map((option, index) => {
            const letter = String.fromCharCode(65 + index); // A, B, C, D
            const isSelected = selectedOption === option;
            const isCorrectAnswer = option.trim() === currentQuestion.correcta.trim();
            
            // Classes for options based on state
            let optionStyles = "flex items-center p-3.5 rounded-xl border-[2.5px] border-black transition-all text-left cursor-pointer text-xs font-comic font-black shadow-[2px_2px_0px_#000] active:scale-[0.99] ";
            
            if (isAnswered) {
              if (isCorrectAnswer) {
                optionStyles += "bg-emerald-100 text-emerald-950 border-emerald-500 shadow-[3px_3px_0px_#059669]";
              } else if (isSelected) {
                optionStyles += "bg-rose-100 text-rose-950 border-rose-500 shadow-[3px_3px_0px_#DC2626]";
              } else {
                optionStyles += "bg-slate-100/50 text-slate-400 border-slate-350 shadow-none cursor-default";
              }
            } else {
              if (isSelected) {
                optionStyles += "bg-[#EF4444] hover:bg-[#E11D48] text-white border-black scale-[1.01] shadow-[3.5px_3.5px_0px_#000]";
              } else {
                optionStyles += "bg-white text-slate-900 border-black hover:bg-slate-50";
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleSelectOption(option)}
                disabled={isAnswered}
                className={optionStyles}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center mr-3 font-mono text-xs font-black border-2 border-black shrink-0 ${
                  isSelected && !isAnswered
                    ? 'bg-black text-[#FDDF2B]' 
                    : isAnswered && isCorrectAnswer 
                      ? 'bg-[#10B981] text-black' 
                      : isAnswered && isSelected
                        ? 'bg-[#EF4444] text-white'
                        : 'bg-[#FFFDEC] text-black'
                }`}>
                  {letter}
                </span>

                <span className="flex-1 text-[13px]">{option}</span>
                {isAnswered && (
                  isCorrectAnswer ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />
                  ) : isSelected ? (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 ml-2" />
                  ) : null
                )}
              </button>
            );
          })}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between border-t-[2.5px] border-black pt-5">
          <button
            onClick={onBack}
            className="px-5 py-3 bg-white text-slate-800 border-[2.5px] border-black font-bangers text-xs tracking-wider uppercase rounded-xl shadow-[3px_3px_0px_#000] cursor-pointer hover:bg-slate-50 transition-all active:scale-95"
          >
            Regresar al Álbum
          </button>

          {!isAnswered ? (
            <button
              onClick={handleVerifyAnswer}
              disabled={!selectedOption}
              className={`px-6 py-3 border-[2.5px] border-black rounded-xl font-bangers text-sm uppercase tracking-widest transition-all ${
                selectedOption 
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black cursor-pointer shadow-[3px_3px_0px_#000] active:scale-95' 
                  : 'bg-slate-100 text-slate-400 border-slate-300 cursor-not-allowed shadow-none'
              }`}
            >
              Validar Respuesta ⚡
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-3 border-[2.5px] border-black rounded-xl font-bangers text-sm uppercase tracking-widest bg-[#EF4444] text-white hover:bg-[#D946EF] cursor-pointer shadow-[3px_3px_0px_#000] active:scale-95 transition-all flex items-center gap-2"
            >
              {currentIdx + 1 < trivia.preguntas.length ? 'Siguiente Pregunta' : 'Finalizar Examen'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
