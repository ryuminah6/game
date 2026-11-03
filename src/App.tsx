import React, { useState, useEffect, useCallback } from 'react';
import { GameStatus } from './types';
import { GameCanvas } from './components/GameCanvas';
import { HamsterSVG } from './components/HamsterSVG';
import { initAudio, getIsMuted, setIsMuted, loadMutePreference } from './audio';
import { Volume2, VolumeX, Trophy, Sparkles, RotateCcw, Play, Pause } from 'lucide-react';

export default function App() {
  const [status, setStatus] = useState<GameStatus>('IDLE');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [highScore, setHighScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [muted, setMutedState] = useState(false);

  // Load high score and audio preferences
  useEffect(() => {
    const savedHighScore = localStorage.getItem('hamster_game_highscore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10) || 0);
    }
    const initialMuted = loadMutePreference();
    setMutedState(initialMuted);
  }, []);

  const toggleSound = () => {
    const nextMuted = !muted;
    setMutedState(nextMuted);
    setIsMuted(nextMuted);
    if (!nextMuted) {
      initAudio();
    }
  };

  const handleStartGame = () => {
    initAudio();
    setScore(0);
    setTimeLeft(60);
    setIsNewRecord(false);
    setStatus('PLAYING');
  };

  const handlePauseToggle = () => {
    if (status === 'PLAYING') {
      setStatus('PAUSED');
    } else if (status === 'PAUSED') {
      setStatus('PLAYING');
    }
  };

  const handleGameOver = useCallback((finalScore: number) => {
    setStatus('GAMEOVER');
    if (finalScore > highScore) {
      setHighScore(finalScore);
      setIsNewRecord(true);
      localStorage.setItem('hamster_game_highscore', finalScore.toString());
    }
  }, [highScore]);

  const handleVictory = useCallback((finalScore: number) => {
    setStatus('VICTORY');
    if (finalScore > highScore) {
      setHighScore(finalScore);
      setIsNewRecord(true);
      localStorage.setItem('hamster_game_highscore', finalScore.toString());
    }
  }, [highScore]);

  // Cheek fullness percentage calculation (max fullness at 15 donuts)
  const cheekLevel = Math.min(100, Math.round((score / 15) * 100));

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 flex flex-col items-center justify-between p-3 sm:p-6 font-game">
      {/* Top Banner & Title Bar */}
      <header className="w-full max-w-md flex items-center justify-between py-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐹</span>
          <h1 className="text-2xl font-black text-amber-950 tracking-tight">라따뚜이</h1>
          <span className="text-xs text-amber-700 bg-amber-200/80 px-2 py-0.5 rounded-full font-bold">
            도넛 먹기 게임
          </span>
        </div>

        <div className="flex items-center gap-2">
          {highScore > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-800 font-bold bg-amber-100/90 px-2.5 py-1 rounded-full border border-amber-300">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>최고: {highScore}</span>
            </div>
          )}
          <button
            type="button"
            onClick={toggleSound}
            aria-label={muted ? '소리 켜기' : '소리 끄기'}
            className="p-2 bg-white/90 hover:bg-amber-100 border border-amber-200 rounded-full text-amber-900 transition-colors shadow-sm"
          >
            {muted ? <VolumeX className="w-4 h-4 text-amber-500" /> : <Volume2 className="w-4 h-4 text-amber-800" />}
          </button>
        </div>
      </header>

      {/* Main Arcade Frame Container */}
      <main className="relative w-full max-w-[420px] bg-white rounded-3xl overflow-hidden border-4 border-amber-300 shadow-2xl flex flex-col my-auto">
        {/* Game Canvas Top In-Game Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-3 sm:p-4 bg-gradient-to-b from-amber-950/40 via-amber-950/20 to-transparent text-white drop-shadow">
          {/* Timer Display */}
          <div className="flex items-center gap-1.5 bg-amber-900/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-200/40 text-amber-50">
            <span className="text-lg">⏱️</span>
            <span className={`text-xl font-bold tracking-wide ${timeLeft <= 10 && status === 'PLAYING' ? 'text-red-400 animate-pulse' : ''}`}>
              {timeLeft}
            </span>
            <span className="text-xs opacity-90">초</span>
          </div>

          {/* Cheek Puff Progress pill & Score */}
          <div className="flex items-center gap-2">
            {(status === 'PLAYING' || status === 'PAUSED') && (
              <button
                type="button"
                onClick={handlePauseToggle}
                aria-label={status === 'PAUSED' ? '계속하기' : '일시정지'}
                className="p-1.5 bg-amber-900/60 hover:bg-amber-900/80 backdrop-blur-md text-white rounded-full border border-amber-200/30 transition-transform active:scale-95"
              >
                {status === 'PAUSED' ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
              </button>
            )}

            <div className="flex items-center gap-1.5 bg-amber-900/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-200/40 text-amber-50">
              <span className="text-lg">🍩</span>
              <span className="text-xl font-bold tracking-wide">{score}</span>
            </div>
          </div>
        </div>

        {/* Cheek Fullness Indicator Bar */}
        {status === 'PLAYING' && (
          <div className="absolute top-16 left-4 right-4 z-10 flex items-center gap-2 pointer-events-none">
            <span className="text-[11px] font-bold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300">
              볼 빵빵 {cheekLevel}%
            </span>
            <div className="flex-1 h-2 bg-amber-200/60 backdrop-blur-sm rounded-full overflow-hidden border border-amber-300/40">
              <div
                className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full transition-all duration-300"
                style={{ width: `${cheekLevel}%` }}
              />
            </div>
          </div>
        )}

        {/* Canvas Game Layer */}
        <GameCanvas
          status={status}
          score={score}
          timeLeft={timeLeft}
          onScoreChange={setScore}
          onTimeChange={setTimeLeft}
          onGameOver={handleGameOver}
          onVictory={handleVictory}
        />

        {/* START SCREEN OVERLAY */}
        {status === 'IDLE' && (
          <div className="absolute inset-0 z-20 bg-amber-50/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <div className="w-28 h-28 mb-3 hover:scale-105 transition-transform duration-200">
              <HamsterSVG mood="normal" />
            </div>

            <h2 className="text-4xl font-black text-amber-900 tracking-tight mb-2">라따뚜이</h2>
            <p className="text-amber-800 text-sm mb-4 leading-relaxed font-sans">
              도넛을 먹어 <strong>60초간</strong> 오래 버텨보세요!<br />
              도넛을 먹을수록 햄스터의 볼이 점점 빵빵해집니다.
            </p>

            <div className="bg-amber-100/80 border border-amber-300 rounded-2xl p-3 w-full max-w-xs mb-6 text-xs text-left space-y-1.5 font-sans">
              <div className="flex items-center gap-2 text-pink-700 font-bold">
                <span className="text-base">🍩</span>
                <span>핑크 도넛 (+1점 & 볼 빵빵)</span>
              </div>
              <div className="flex items-center gap-2 text-amber-700 font-bold">
                <span className="text-base">✨</span>
                <span>황금 도넛 (+3점 보너스!)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <span className="text-base">🤢</span>
                <span>상한 초록 도넛 (먹으면 게임 오버!)</span>
              </div>
            </div>

            {highScore > 0 && (
              <div className="text-xs text-amber-700 font-bold mb-3 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                <span>현재 최고 점수: {highScore}점</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleStartGame}
              className="btn-start w-full max-w-xs py-4 text-white text-2xl font-black rounded-2xl active:scale-95 cursor-pointer shadow-lg"
            >
              게임 시작! 🚀
            </button>
          </div>
        )}

        {/* PAUSE OVERLAY */}
        {status === 'PAUSED' && (
          <div className="absolute inset-0 z-20 bg-amber-950/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="w-24 h-24 mb-3">
              <HamsterSVG mood="normal" />
            </div>
            <h2 className="text-3xl font-black mb-2">잠시 멈춤 ⏸️</h2>
            <p className="text-amber-100 text-sm mb-6">잠깐 숨을 고르고 계속 이어가세요!</p>
            <button
              type="button"
              onClick={handlePauseToggle}
              className="btn-start w-full max-w-xs py-3.5 text-white text-xl font-black rounded-2xl cursor-pointer"
            >
              계속하기 ▶
            </button>
          </div>
        )}

        {/* VICTORY SCREEN OVERLAY */}
        {status === 'VICTORY' && (
          <div className="absolute inset-0 z-20 bg-amber-50/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <div className="w-28 h-28 mb-3 animate-bounce">
              <HamsterSVG mood="victory" />
            </div>

            <div className="flex items-center justify-center gap-1 mb-1">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-3xl font-black text-amber-600">성공! 축하해요 🎉</h2>
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-amber-800 text-sm mb-4">60초 동안 도넛을 먹고 무사히 완주했어요!</p>

            {isNewRecord && (
              <div className="bg-amber-400/30 text-amber-900 border border-amber-400 font-bold text-xs px-3 py-1 rounded-full mb-3 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                <span>새로운 최고 기록 달성!</span>
              </div>
            )}

            <div className="bg-amber-100 px-6 py-3.5 rounded-2xl mb-6 border border-amber-300 w-full max-w-xs shadow-inner">
              <span className="text-amber-800 text-xs block font-bold mb-0.5">최종 획득 점수</span>
              <span className="text-4xl font-black text-amber-900">
                {score} <span className="text-2xl">🍩</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleStartGame}
              className="btn-start w-full max-w-xs py-4 text-white text-2xl font-black rounded-2xl cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-2 mx-auto"
            >
              <RotateCcw className="w-6 h-6" />
              <span>다시 하기!</span>
            </button>
          </div>
        )}

        {/* GAME OVER SCREEN OVERLAY */}
        {status === 'GAMEOVER' && (
          <div className="absolute inset-0 z-20 bg-amber-50/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <div className="w-28 h-28 mb-3">
              <HamsterSVG mood="sick" />
            </div>

            <h2 className="text-3xl font-black text-emerald-700 mb-1">게임 오버! 🤢</h2>
            <p className="text-amber-800 text-sm mb-4 font-sans">
              상한 초록 도넛을 먹고 배탈이 났습니다!
            </p>

            {isNewRecord && (
              <div className="bg-amber-400/30 text-amber-900 border border-amber-400 font-bold text-xs px-3 py-1 rounded-full mb-3 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                <span>새로운 최고 기록 달성!</span>
              </div>
            )}

            <div className="bg-amber-100 px-6 py-3.5 rounded-2xl mb-6 border border-amber-300 w-full max-w-xs shadow-inner">
              <span className="text-amber-800 text-xs block font-bold mb-0.5">최종 점수</span>
              <span className="text-4xl font-black text-amber-900">
                {score} <span className="text-2xl">🍩</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleStartGame}
              className="btn-start w-full max-w-xs py-4 text-white text-2xl font-black rounded-2xl cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-2 mx-auto"
            >
              <RotateCcw className="w-6 h-6" />
              <span>다시 도전 🔄</span>
            </button>
          </div>
        )}
      </main>

      {/* Footer Controls & Instructions */}
      <footer className="w-full max-w-md mt-3 flex flex-col items-center gap-2 text-center text-xs text-amber-800/80">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="bg-amber-100/90 border border-amber-300/80 px-2.5 py-1 rounded-lg">
            키보드: <kbd className="font-mono font-bold bg-white px-1 py-0.5 rounded border border-amber-200">◀</kbd> <kbd className="font-mono font-bold bg-white px-1 py-0.5 rounded border border-amber-200">▶</kbd> 또는 <kbd className="font-mono font-bold bg-white px-1 py-0.5 rounded border border-amber-200">A</kbd> <kbd className="font-mono font-bold bg-white px-1 py-0.5 rounded border border-amber-200">D</kbd>
          </span>
          <span className="bg-amber-100/90 border border-amber-300/80 px-2.5 py-1 rounded-lg">
            모바일: 터치 버튼 또는 화면 드래그
          </span>
        </div>
        <p className="text-[11px] text-amber-700/70 font-sans">
          귀여운 햄스터와 함께 도넛을 마음껏 즐겨보세요! 🐹🍩
        </p>
      </footer>
    </div>
  );
}
