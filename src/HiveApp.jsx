import React, { useState, useEffect } from 'react';
import { loginWithHiveKeychainPostingKey } from './hiveKeychainLogin';
import { Triangle, Hexagon, Circle, Square, Trophy, User, Clock, CheckCircle2, XCircle, Activity, Flame, Coins, Medal, MonitorPlay, Smartphone, Twitter, Users, Play, Copy, Check, Globe, Plus, ChevronLeft, AlertCircle, Key, LogOut, Loader2, Calendar, Bell, Sparkles, Menu, Sun, Moon, Image as ImageIcon, ExternalLink, Trash2, ListOrdered } from 'lucide-react';

// --- MOCK DATA & CONFIG ---
const DEFAULT_DEMO_QUESTIONS = [
  {
    id: 1,
    text: "What is the block time of the Hive Blockchain?",
    options: ["10 Minutes", "3 Seconds", "12 Seconds", "1 Minute"],
    correct: 1,
    type: "multiple"
  },
  {
    id: 2,
    text: "True or False: Transactions on the Hive network require paying gas fees.",
    options: ["True", "False"],
    correct: 1,
    type: "boolean"
  },
  {
    id: 3,
    text: "Which operation is used to store this game's data for free?",
    options: ["transfer", "vote", "custom_json", "delegate_vesting_shares"],
    correct: 2,
    type: "multiple"
  }
];

const makeDraftQuestion = () => ({
  id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  text: "",
  type: "multiple",
  options: ["", "", "", ""],
  correct: 0
});

const normalizeHostQuiz = (questions) =>
  questions.map((q, i) => ({
    id: i + 1,
    text: q.text.trim(),
    type: q.type,
    correct: q.correct,
    options: q.type === "boolean" ? ["True", "False"] : q.options.map((o) => String(o).trim())
  }));

const validateHostQuiz = (questions) => {
  if (!questions.length) return "Add at least one question.";
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.text?.trim()) return `Question ${i + 1}: enter the question text.`;
    if (q.type === "boolean") {
      if (q.correct !== 0 && q.correct !== 1)
        return `Question ${i + 1}: mark whether True or False is correct.`;
    } else {
      if (!q.options || q.options.some((o) => !String(o).trim()))
        return `Question ${i + 1}: fill in all four answer choices.`;
      if (q.correct < 0 || q.correct > 3)
        return `Question ${i + 1}: select which choice is correct.`;
    }
  }
  return null;
};

// NEON GLOW COLORS
const COLORS = [
  "bg-rose-500 hover:bg-rose-400 border-rose-600 shadow-lg dark:shadow-[0_0_20px_rgba(225,29,72,0.4)] dark:hover:shadow-[0_0_30px_rgba(225,29,72,0.6)]",
  "bg-cyan-500 hover:bg-cyan-400 border-cyan-600 shadow-lg dark:shadow-[0_0_20px_rgba(6,182,212,0.4)] dark:hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]",
  "bg-amber-500 hover:bg-amber-400 border-amber-600 shadow-lg dark:shadow-[0_0_20px_rgba(245,158,11,0.4)] dark:hover:shadow-[0_0_30px_rgba(245,158,11,0.6)]",
  "bg-emerald-500 hover:bg-emerald-400 border-emerald-600 shadow-lg dark:shadow-[0_0_20px_rgba(16,185,129,0.4)] dark:hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]"
];

const BOOL_COLORS = [
  "bg-cyan-500 hover:bg-cyan-400 border-cyan-600 shadow-lg dark:shadow-[0_0_20px_rgba(6,182,212,0.4)] dark:hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]", // True
  "bg-rose-500 hover:bg-rose-400 border-rose-600 shadow-lg dark:shadow-[0_0_20px_rgba(225,29,72,0.4)] dark:hover:shadow-[0_0_30px_rgba(225,29,72,0.6)]"    // False
];

const ICONS = [Triangle, Hexagon, Circle, Square];
const BOOL_ICONS = [Hexagon, Triangle];

const MOCK_USERS = ['hiveking', 'cryptogamer', 'block_master', 'splinterlands_pro', 'web3_ninja', 'crypto_queen', 'hive_dev'];

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80';

const INITIAL_GAMES = [
  { id: '884921', status: 'live', host: 'hiveking', title: 'Crypto Trivia Night', prize: 250, players: 14, maxPlayers: 50, interested: [], image: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?auto=format&fit=crop&w=600&q=80' },
  { id: '112233', status: 'live', host: 'block_master', title: 'Hive Blockchain Basics', prize: 50, players: 5, maxPlayers: 20, interested: [], image: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?auto=format&fit=crop&w=600&q=80' },
  { id: '445566', status: 'scheduled', host: 'splinterlands_pro', title: 'Splinterlands Lore Championship', prize: 1000, date: '2026-03-20', time: '18:00', players: 0, maxPlayers: 100, interested: ['web3_ninja', 'hiveking', 'cryptogamer', 'block_master'], image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&w=600&q=80' },
  { id: '998877', status: 'scheduled', host: 'web3_ninja', title: 'Weekly Dev Quiz', prize: 100, date: '2026-03-22', time: '20:00', players: 0, maxPlayers: 50, interested: ['hiveking'], image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80' }
];

// --- CONFETTI COMPONENT ---
const Confetti = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <div 
          key={i}
          className="absolute w-3 h-3 animate-fall"
          style={{
            left: `${Math.random() * 100}vw`,
            top: `-5vh`,
            backgroundColor: ['#06b6d4', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)],
            boxShadow: '0 0 10px currentColor',
            animationDuration: `${Math.random() * 2 + 2}s`,
            animationDelay: `${Math.random() * 2}s`,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        />
      ))}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        .animate-fall { animation: fall linear forwards infinite; }
      `}} />
    </div>
  );
};

export default function App() {
  const [gameState, setGameState] = useState('dashboard'); // dashboard, hostSetup, waitingRoom, playing, revealing, leaderboard
  const [username, setUsername] = useState('');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [logs, setLogs] = useState([]);
  
  // App & Game State
  const [games, setGames] = useState(INITIAL_GAMES);
  const [viewMode, setViewMode] = useState('player'); // 'host' or 'player'
  const [prizePool, setPrizePool] = useState(0);
  const [players, setPlayers] = useState([]); // Users in the waiting room
  const [copiedLink, setCopiedLink] = useState(false);
  const [gameId, setGameId] = useState(''); // Active game PIN
  const [notification, setNotification] = useState(''); // Global toast notification
  
  // UI Theme State
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Host Setup State
  const [hostFunding, setHostFunding] = useState(50);
  const [hostGameTitle, setHostGameTitle] = useState('');
  const [hostImageUrl, setHostImageUrl] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [hostQuizQuestions, setHostQuizQuestions] = useState(() => [makeDraftQuestion()]);
  const [activeQuiz, setActiveQuiz] = useState([]);

  // Login State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [keychainInstalled, setKeychainInstalled] = useState(null);

  useEffect(() => {
    if (!isLoginModalOpen) return;
    const detect = () => typeof window !== 'undefined' && !!window.hive_keychain;
    setKeychainInstalled(detect());
    const retry = setTimeout(() => setKeychainInstalled(detect()), 500);
    void import('@hiveio/dhive');
    return () => clearTimeout(retry);
  }, [isLoginModalOpen]);

  // --- LOGIC ---
  const addLog = (message) => {
    setLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  const triggerNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const normalizeHiveUsername = (raw) =>
    raw.trim().toLowerCase().replace(/^@+/, '');

  const handleKeychainLogin = () => {
    const user = normalizeHiveUsername(loginInput);
    if (!user) return;

    if (typeof window === 'undefined' || !window.hive_keychain?.requestSignBuffer) {
      triggerNotification('Hive Keychain not found. Install the browser extension from hive-keychain.com');
      return;
    }

    setIsLoggingIn(true);
    // No await before Keychain: Chromium drops user activation after async gaps, which blocks the extension UI.
    loginWithHiveKeychainPostingKey(user, 'HiveClash — Sign in')
      .then(() => {
        setUsername(user);
        setIsLoginModalOpen(false);
        addLog(`@${user} authenticated via Hive Keychain`);
        setLoginInput('');
      })
      .catch((err) => {
        const msg =
          err?.message ||
          err?.error ||
          (typeof err === 'string' ? err : null) ||
          'Login failed or was cancelled in Keychain.';
        triggerNotification(String(msg));
        console.error(err);
      })
      .finally(() => setIsLoggingIn(false));
  };

  const handleLogout = () => {
    setUsername('');
    addLog(`User logged out.`);
  };

  const joinLiveGame = (game) => {
    if (!username.trim()) {
      setIsLoginModalOpen(true);
      return;
    }
    setGameId(game.id);
    setPrizePool(game.prize + 1); // Mock adding buy-in
    setViewMode('player');
    setActiveQuiz(
      (game.questions?.length ? game.questions : DEFAULT_DEMO_QUESTIONS).map((q, i) => ({
        ...q,
        id: q.id ?? i + 1
      }))
    );
    setCurrentQIndex(0);
    setSelectedAnswer(null);
    
    // Simulate other players already in the room
    const mockRoomPlayers = [...MOCK_USERS].sort(() => 0.5 - Math.random()).slice(0, Math.min(game.players, 5));
    setPlayers([username, ...mockRoomPlayers]);
    
    addLog(`@${username} signed transfer of 1 HIVE to join game ${game.id}.`);
    setGameState('waitingRoom');
  };

  const toggleInterest = (gameId) => {
    if (!username.trim()) {
      setIsLoginModalOpen(true);
      return;
    }

    setGames(prevGames => prevGames.map(g => {
      if (g.id === gameId) {
        const isInterested = g.interested.includes(username);
        let updatedInterested = isInterested 
          ? g.interested.filter(u => u !== username) 
          : [...g.interested, username];
        
        if (!isInterested) {
          addLog(`@${username} signed 'custom_json' RSVP for game ${gameId}.`);
        } else {
          addLog(`@${username} removed RSVP for game ${gameId}.`);
        }
        
        return { ...g, interested: updatedInterested };
      }
      return g;
    }));
  };

  const startHosting = () => {
    if (!username.trim() || hostFunding < 0) return;
    if (!hostGameTitle.trim()) {
      triggerNotification("Please give your game a title.");
      return;
    }
    if (isScheduling && (!scheduleDate || !scheduleTime)) {
      triggerNotification("Please select a date and time to schedule the game.");
      return;
    }

    const quizErr = validateHostQuiz(hostQuizQuestions);
    if (quizErr) {
      triggerNotification(quizErr);
      return;
    }

    const normalizedQuiz = normalizeHostQuiz(hostQuizQuestions);
    const newId = Math.floor(100000 + Math.random() * 900000).toString(); // Generate random 6-digit PIN

    if (isScheduling) {
      const newGame = {
        id: newId,
        status: 'scheduled',
        host: username,
        title: hostGameTitle,
        prize: hostFunding,
        date: scheduleDate,
        time: scheduleTime,
        players: 0,
        maxPlayers: 50,
        interested: [],
        image: hostImageUrl || DEFAULT_IMAGE,
        questions: normalizedQuiz
      };
      setGames(prev => [...prev, newGame]);
      triggerNotification("Game scheduled successfully!");
      addLog(`@${username} scheduled game ${newId} for ${scheduleDate} ${scheduleTime}.`);
      setGameState('dashboard');
    } else {
      setGameId(newId);
      setPrizePool(hostFunding);
      setViewMode('host');
      setPlayers([]);
      setActiveQuiz(normalizedQuiz);
      setCurrentQIndex(0);
      setSelectedAnswer(null);
      addLog(`@${username} hosted game ${newId} and funded ${hostFunding} HIVE.`);
      setGameState('waitingRoom');
    }
  };

  const beginTrivia = () => {
    if (!activeQuiz.length) {
      triggerNotification("This room has no questions yet.");
      return;
    }
    setCurrentQIndex(0);
    setSelectedAnswer(null);
    setGameState('playing');
    setTimeLeft(15);
    addLog(`Host started the trivia!`);
  };

  const handleAnswer = (index) => {
    if (selectedAnswer !== null || gameState !== 'playing' || viewMode === 'host') return;
    
    setSelectedAnswer(index);
    addLog(`@${username} broadcasted 'custom_json' (Choice ${index})`);
  };

  const shareOnX = () => {
    const text = `I just scored ${score || 2850} points and secured a spot on the podium in #HiveClash! 🏆\n\nPrize pool won: ${prizePool} $HIVE 🍯\n\nThink you can beat me? #Web3 #HiveBlockchain #CryptoGaming`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const copyToClipboard = () => {
    const url = `https://hiveclash.app/join/${gameId}`;
    const textArea = document.createElement("textarea");
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  // Timer Countdown
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (gameState === 'playing' && timeLeft === 0) {
      // Time's up! Move to reveal phase
      setGameState('revealing');
      addLog(`Host revealed salt. Indexer verifying...`);
      
      const deck = activeQuiz;
      const currentQ = deck[currentQIndex];
      const isCorrect = currentQ && selectedAnswer === currentQ.correct;
      if (isCorrect) {
        const timeBonus = Math.floor((timeLeft / 15) * 500);
        const streakBonus = streak * 100;
        setScore(prev => prev + 500 + timeBonus + streakBonus);
        setStreak(prev => prev + 1);
        addLog(`@${username} scored ${500 + timeBonus + streakBonus} points!`);
      } else {
        setStreak(0);
        addLog(`@${username} was incorrect or out of time. Streak lost!`);
      }

      // Auto-advance
      setTimeout(() => {
        if (currentQIndex < deck.length - 1) {
          setCurrentQIndex(prev => prev + 1);
          setSelectedAnswer(null);
          setTimeLeft(15);
          setGameState('playing');
        } else {
          setGameState('leaderboard');
          addLog(`Game Over! Distributing Prize Pool...`);
        }
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, selectedAnswer, currentQIndex, activeQuiz]);

  // --- RENDERERS ---

  const renderDashboard = () => {
    const liveGames = games.filter(g => g.status === 'live');
    const scheduledGames = games.filter(g => g.status === 'scheduled');

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-zinc-900 dark:via-black dark:to-black text-slate-900 dark:text-gray-100 font-sans flex flex-col pb-20 transition-colors duration-500">
        {/* Header */}
        <header className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 p-4 sticky top-0 z-30 transition-colors">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-fuchsia-500 to-cyan-500 p-2 rounded-xl shadow-md dark:shadow-[0_0_15px_rgba(217,70,239,0.5)]">
                <Hexagon className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-black tracking-widest hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 to-cyan-600 dark:from-white dark:to-gray-400">HIVECLASH</h1>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-6">
              {!username ? (
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold flex items-center transition-all border border-gray-200 dark:border-white/10 dark:hover:border-white/20 text-slate-800 dark:text-white"
                >
                  <Key size={18} className="mr-2 text-fuchsia-500 dark:text-fuchsia-400" /> <span className="hidden sm:inline">Login with Keychain</span><span className="sm:hidden">Login</span>
                </button>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 bg-gray-100 dark:bg-white/5 px-4 py-1.5 rounded-full border border-gray-200 dark:border-white/10">
                    <img src={`https://images.hive.blog/u/${username}/avatar`} alt="avatar" className="w-8 h-8 rounded-full border border-fuchsia-400 dark:border-fuchsia-500/50" onError={(e) => { e.target.onerror = null; e.target.src = "https://images.hive.blog/u/hiveio/avatar"; }}/>
                    <span className="font-bold text-sm hidden sm:inline text-slate-800 dark:text-gray-200">@{username}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              )}

              <div className="w-px h-8 bg-gray-200 dark:bg-white/10 mx-2 hidden sm:block"></div>

              <button 
                onClick={() => {
                  if(!username.trim()) {
                    setIsLoginModalOpen(true);
                    return;
                  }
                  setHostGameTitle('');
                  setHostImageUrl('');
                  setHostFunding(50);
                  setIsScheduling(false);
                  setHostQuizQuestions([makeDraftQuestion()]);
                  setGameState('hostSetup');
                }} 
                className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 px-4 sm:px-6 py-2.5 rounded-full font-bold flex items-center transition-all shadow-md dark:shadow-[0_0_20px_rgba(192,38,211,0.4)] dark:hover:shadow-[0_0_30px_rgba(192,38,211,0.6)] text-white border border-fuchsia-400/30"
              >
                <Plus size={18} className="mr-1 sm:mr-2" /> <span className="hidden sm:inline">Host Game</span>
              </button>

              {/* Theme / Menu Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-full text-slate-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 transition-colors"
                >
                  <Menu size={24} />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 py-2 z-50 animate-fade-in-up">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-white/10 mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Settings</span>
                    </div>
                    <button 
                      onClick={() => { setIsDarkMode(!isDarkMode); setIsMenuOpen(false); }} 
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-slate-800 dark:text-white flex items-center font-bold transition-colors"
                    >
                      {isDarkMode ? <Sun size={18} className="mr-3 text-amber-500"/> : <Moon size={18} className="mr-3 text-indigo-500"/>}
                      {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto p-4 sm:p-6 w-full mt-4 sm:mt-8 space-y-16">
          
          {/* Hero Banner (Always Dark for aesthetic impact) */}
          <div className="relative rounded-3xl p-8 sm:p-12 text-white overflow-hidden border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-[0_0_50px_rgba(6,182,212,0.15)] group transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/90 to-black/90 z-10"></div>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-fuchsia-500/20 blur-[100px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent z-10"></div>
            
            <div className="relative z-20 flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0 max-w-2xl">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-bold mb-6">
                  <Sparkles size={14} className="mr-2" /> Web3 Native Gaming
                </div>
                <h2 className="text-4xl sm:text-6xl font-black mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
                  Prove your knowledge.<br/>Win real HIVE.
                </h2>
                <p className="text-gray-400 text-lg sm:text-xl font-medium max-w-lg">
                  Join active games, answer faster than the competition, and earn instant crypto rewards directly to your wallet.
                </p>
              </div>
              <Trophy size={140} className="text-fuchsia-500 drop-shadow-[0_0_30px_rgba(217,70,239,0.5)] transform rotate-12 transition-transform duration-700 group-hover:rotate-0 group-hover:scale-110" />
            </div>
          </div>

          {/* LIVE GAMES SECTION */}
          <section>
            <div className="flex justify-between items-end mb-8 border-b border-gray-200 dark:border-white/10 pb-4">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white flex items-center">
                <Globe className="mr-3 text-cyan-600 dark:text-cyan-400" size={32} /> Live Now
              </h3>
              <span className="text-cyan-600 dark:text-cyan-500 font-bold hidden sm:inline bg-cyan-50 dark:bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-200 dark:border-cyan-500/20 shadow-sm dark:shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                {liveGames.length} games active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {liveGames.map(game => (
                <div key={game.id} className="bg-white dark:bg-zinc-900/50 backdrop-blur-md rounded-3xl transition-all border border-gray-200 dark:border-white/5 hover:border-cyan-500 dark:hover:border-cyan-500/50 overflow-hidden flex flex-col group shadow-lg dark:shadow-none hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transform hover:-translate-y-1">
                  
                  {/* Featured Image */}
                  <div className="relative h-56 w-full overflow-hidden shrink-0">
                    <img src={game.image || DEFAULT_IMAGE} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    
                    {/* Dark gradient for text visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-10 pointer-events-none"></div>
                    
                    {/* Top Right Badge */}
                    <div className="absolute top-4 right-4 z-20">
                      <span className="bg-rose-500/90 text-white backdrop-blur-md border border-rose-400/50 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center shadow-[0_0_15px_rgba(244,63,94,0.5)]">
                        <Activity size={12} className="mr-1 animate-pulse" /> Live
                      </span>
                    </div>

                    {/* Merged Host Info at the bottom of the image */}
                    <div className="absolute bottom-0 left-0 w-full bg-black/40 backdrop-blur-md border-t border-white/10 px-5 py-3 z-20 flex items-center">
                      <img src={`https://images.hive.blog/u/${game.host}/avatar`} alt="host" className="w-10 h-10 rounded-full border-2 border-white/20 shadow-md mr-3" onError={(e) => { e.target.onerror = null; e.target.src = "https://images.hive.blog/u/hiveio/avatar"; }}/>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest leading-none mb-1">Quiz Created By</span>
                        <span className="font-bold text-white text-sm leading-none drop-shadow-md">@{game.host}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 flex-1 flex flex-col relative z-10">
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4 leading-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2">{game.title}</h3>
                    
                    <div className="flex items-center text-slate-600 dark:text-gray-400 font-medium mb-6 bg-gray-50 dark:bg-black/30 p-3 rounded-xl border border-gray-200 dark:border-white/5 mt-auto">
                      <Users size={20} className="mr-2 text-cyan-600 dark:text-cyan-500" /> {game.players} / {game.maxPlayers} Players Waiting
                    </div>
                    
                    <div className="bg-amber-50 dark:bg-amber-500/10 rounded-2xl p-5 flex justify-between items-center border border-amber-200 dark:border-amber-500/20">
                      <span className="text-amber-700 dark:text-amber-500/70 font-bold uppercase tracking-wider text-sm">Prize Pool</span>
                      <span className="text-2xl font-black text-amber-600 dark:text-amber-400 flex items-center dark:drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                        <Coins size={24} className="mr-2" /> {game.prize} HIVE
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => joinLiveGame(game)}
                    className="w-full bg-gray-50 dark:bg-white/5 text-slate-900 dark:text-white py-5 font-black text-xl hover:text-white hover:bg-cyan-500 dark:hover:bg-cyan-500 transition-all flex justify-center items-center border-t border-gray-200 dark:border-white/5 group-hover:border-transparent"
                  >
                    Join Game <span className="ml-2 font-normal text-slate-400 dark:text-white/50 text-base">(1 HIVE)</span>
                  </button>
                </div>
              ))}
              {liveGames.length === 0 && (
                <div className="col-span-full text-center py-16 bg-gray-100 dark:bg-zinc-900/30 rounded-3xl border border-gray-300 dark:border-white/5 border-dashed">
                  <p className="text-slate-500 dark:text-gray-500 font-bold text-xl mb-4">No live games right now.</p>
                  <button onClick={() => { setHostQuizQuestions([makeDraftQuestion()]); setGameState('hostSetup'); }} className="text-fuchsia-600 dark:text-fuchsia-400 hover:text-fuchsia-700 dark:hover:text-fuchsia-300 font-bold flex items-center justify-center mx-auto transition-colors">
                    <Plus size={18} className="mr-1" /> Host the first one!
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* SCHEDULED GAMES SECTION */}
          <section>
            <div className="flex justify-between items-end mb-8 border-b border-gray-200 dark:border-white/10 pb-4">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white flex items-center">
                <Calendar className="mr-3 text-fuchsia-600 dark:text-fuchsia-500" size={32} /> Upcoming Games
              </h3>
              <span className="text-fuchsia-600 dark:text-fuchsia-500 font-bold hidden sm:inline bg-fuchsia-50 dark:bg-fuchsia-500/10 px-4 py-1.5 rounded-full border border-fuchsia-200 dark:border-fuchsia-500/20 shadow-sm dark:shadow-[0_0_15px_rgba(217,70,239,0.2)]">
                {scheduledGames.length} scheduled
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {scheduledGames.map(game => {
                const isUserInterested = username && game.interested.includes(username);
                const showPlusX = game.interested.length > 5;
                const displayAvatars = game.interested.slice(0, 5);

                return (
                  <div key={game.id} className="bg-white dark:bg-zinc-900/50 backdrop-blur-md rounded-3xl transition-all border border-gray-200 dark:border-white/5 hover:border-fuchsia-500 dark:hover:border-fuchsia-500/50 overflow-hidden flex flex-col group shadow-lg dark:shadow-none hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(217,70,239,0.15)]">
                    
                    {/* Featured Image */}
                    <div className="relative h-56 w-full overflow-hidden shrink-0">
                      <img src={game.image || DEFAULT_IMAGE} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      
                      {/* Dark gradient for text visibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-10 pointer-events-none"></div>
                      
                      {/* Top Right Badge */}
                      <div className="absolute top-4 right-4 z-20">
                        <div className="flex items-center text-white font-bold bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 shadow-lg text-sm">
                          <Calendar size={14} className="mr-2 text-fuchsia-400" />
                          <span>{new Date(game.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {game.time}</span>
                        </div>
                      </div>

                      {/* Merged Host Info at the bottom of the image */}
                      <div className="absolute bottom-0 left-0 w-full bg-black/40 backdrop-blur-md border-t border-white/10 px-5 py-3 z-20 flex items-center">
                        <img src={`https://images.hive.blog/u/${game.host}/avatar`} alt="host" className="w-10 h-10 rounded-full border-2 border-white/20 shadow-md mr-3" onError={(e) => { e.target.onerror = null; e.target.src = "https://images.hive.blog/u/hiveio/avatar"; }}/>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest leading-none mb-1">Quiz Created By</span>
                          <span className="font-bold text-white text-sm leading-none drop-shadow-md">@{game.host}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 flex-1 flex flex-col relative z-10">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3 leading-tight line-clamp-2 group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors">{game.title}</h3>
                      <div className="text-amber-600 dark:text-amber-400 font-bold flex items-center mb-6">
                        <Coins size={18} className="mr-2" /> {game.prize} HIVE Prize Pool
                      </div>
                      
                      {/* Interested List Area */}
                      <div className="mt-auto bg-gray-50 dark:bg-black/40 rounded-2xl p-5 border border-gray-200 dark:border-white/5">
                        <div className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                          {game.interested.length} Players Interested
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex -space-x-3 overflow-hidden p-1">
                            {game.interested.length === 0 ? (
                              <span className="text-sm text-slate-400 dark:text-gray-500 italic">Be the first to RSVP!</span>
                            ) : (
                              displayAvatars.map((u, i) => (
                                <img 
                                  key={i} 
                                  src={`https://images.hive.blog/u/${u}/avatar`} 
                                  title={`@${u}`}
                                  className="w-10 h-10 rounded-full border-2 border-white dark:border-zinc-900 bg-gray-200 dark:bg-zinc-800 shadow-sm relative z-10" 
                                  onError={(e) => { e.target.onerror = null; e.target.src = "https://images.hive.blog/u/hiveio/avatar"; }}
                                />
                              ))
                            )}
                            {showPlusX && (
                              <div className="w-10 h-10 rounded-full bg-fuchsia-100 dark:bg-fuchsia-500/20 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-xs font-black text-fuchsia-700 dark:text-fuchsia-300 relative z-20 shadow-sm">
                                +{game.interested.length - 5}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleInterest(game.id)}
                      className={`w-full py-5 font-black text-lg transition-all flex justify-center items-center border-t border-gray-200 dark:border-white/5 ${
                        isUserInterested 
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30' 
                          : 'bg-gray-50 dark:bg-white/5 text-slate-900 dark:text-white hover:text-white hover:bg-fuchsia-600 dark:hover:bg-fuchsia-600'
                      }`}
                    >
                      {isUserInterested ? (
                        <><Check size={20} className="mr-2" /> RSVP'd ✅</>
                      ) : (
                        <><Bell size={20} className="mr-2" /> Count Me In!</>
                      )}
                    </button>
                  </div>
                );
              })}
              {scheduledGames.length === 0 && (
                <div className="col-span-full text-center py-16 bg-gray-100 dark:bg-zinc-900/30 rounded-3xl border border-gray-300 dark:border-white/5 border-dashed">
                  <p className="text-slate-500 dark:text-gray-500 font-bold text-xl mb-4">No upcoming games scheduled.</p>
                </div>
              )}
            </div>
          </section>

        </main>
      </div>
    );
  };

  const renderHostSetup = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-zinc-900 dark:via-black dark:to-black p-4 relative transition-colors duration-500">
      <button 
        onClick={() => setGameState('dashboard')} 
        className="absolute top-6 left-6 flex items-center text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white font-bold transition-colors bg-white dark:bg-white/5 px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 shadow-sm dark:shadow-none"
      >
        <ChevronLeft className="mr-1" /> Back to Dashboard
      </button>

      <div className="bg-white/90 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl dark:shadow-[0_0_50px_rgba(192,38,211,0.15)] w-full max-w-2xl text-center border border-gray-200 dark:border-white/10 relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Decorative elements (visible mainly in dark mode) */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-fuchsia-500/20 blur-[50px] rounded-full hidden dark:block"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/20 blur-[50px] rounded-full hidden dark:block"></div>

        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="bg-fuchsia-50 dark:bg-gradient-to-br dark:from-fuchsia-500/20 dark:to-purple-500/20 p-4 rounded-2xl shadow-inner border border-fuchsia-100 dark:border-fuchsia-500/30">
              <MonitorPlay size={40} className="text-fuchsia-500 dark:text-fuchsia-400 dark:drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Host a Game</h1>
          <p className="text-slate-500 dark:text-gray-400 mb-8 font-medium">Set up your trivia room and fund the prize pool.</p>
          
          <div className="space-y-6 text-left">
            
            {/* Game Title */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest pl-1">Game Title</label>
              <input 
                type="text" 
                placeholder="e.g. Splinterlands Lore Night"
                value={hostGameTitle}
                onChange={(e) => setHostGameTitle(e.target.value)}
                className="w-full px-5 py-4 rounded-xl bg-white dark:bg-black/50 border border-gray-300 dark:border-white/10 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20 focus:outline-none text-xl font-bold text-slate-900 dark:text-white transition-all placeholder-gray-400 dark:placeholder-gray-600 shadow-sm dark:shadow-none"
              />
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest pl-1">Featured Image URL (Optional)</label>
              <div className="relative">
                <ImageIcon className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                <input 
                  type="text" 
                  placeholder="https://..."
                  value={hostImageUrl}
                  onChange={(e) => setHostImageUrl(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 rounded-xl bg-white dark:bg-black/50 border border-gray-300 dark:border-white/10 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20 focus:outline-none text-lg font-bold text-slate-900 dark:text-white transition-all placeholder-gray-400 dark:placeholder-gray-600 shadow-sm dark:shadow-none"
                />
              </div>
            </div>

            {/* Prize Pool */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest pl-1">Initial Prize Pool</label>
              <div className="relative">
                <Coins size={24} className="absolute left-5 top-1/2 transform -translate-y-1/2 text-amber-500 dark:drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                <input 
                  type="number" 
                  min="0"
                  value={hostFunding}
                  onChange={(e) => setHostFunding(Number(e.target.value))}
                  className="w-full pl-14 pr-20 py-4 rounded-xl bg-white dark:bg-black/50 border border-gray-300 dark:border-white/10 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none text-2xl font-black text-slate-900 dark:text-white transition-all shadow-sm dark:shadow-none"
                />
                <span className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-sm">HIVE</span>
              </div>
            </div>

            {/* Custom quiz */}
            <div className="pt-4 border-t border-gray-200 dark:border-white/10 text-left">
              <label className="flex items-center text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest pl-1">
                <ListOrdered size={16} className="mr-2 text-fuchsia-500 shrink-0" />
                Questions and answers
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 pl-1">
                Build your trivia. Mark the correct answer for each question.
              </p>
              <div className="space-y-5 max-h-[min(420px,50vh)] overflow-y-auto pr-1">
                {hostQuizQuestions.map((hq, qi) => (
                  <div
                    key={hq.id}
                    className="rounded-2xl border border-gray-200 dark:border-white/10 p-4 sm:p-5 bg-gray-50/80 dark:bg-black/30 space-y-3"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-black text-slate-800 dark:text-white">Question {qi + 1}</span>
                      {hostQuizQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setHostQuizQuestions((prev) => prev.filter((_, i) => i !== qi))
                          }
                          className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Remove question"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                    <textarea
                      value={hq.text}
                      onChange={(e) =>
                        setHostQuizQuestions((prev) =>
                          prev.map((q, i) => (i === qi ? { ...q, text: e.target.value } : q))
                        )
                      }
                      placeholder="Ask something players should answer…"
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black/50 border border-gray-300 dark:border-white/10 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20 focus:outline-none font-bold text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 resize-y min-h-[72px]"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setHostQuizQuestions((prev) =>
                            prev.map((q, i) =>
                              i === qi
                                ? {
                                    ...q,
                                    type: "multiple",
                                    options: ["", "", "", ""],
                                    correct: 0
                                  }
                                : q
                            )
                          )
                        }
                        className={`px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${
                          hq.type === "multiple"
                            ? "bg-cyan-500 text-white shadow-md"
                            : "bg-gray-200 dark:bg-white/10 text-slate-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/15"
                        }`}
                      >
                        4 choices
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setHostQuizQuestions((prev) =>
                            prev.map((q, i) =>
                              i === qi
                                ? {
                                    ...q,
                                    type: "boolean",
                                    options: ["True", "False"],
                                    correct: 0
                                  }
                                : q
                            )
                          )
                        }
                        className={`px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${
                          hq.type === "boolean"
                            ? "bg-fuchsia-600 text-white shadow-md"
                            : "bg-gray-200 dark:bg-white/10 text-slate-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/15"
                        }`}
                      >
                        True / False
                      </button>
                    </div>
                    {hq.type === "multiple" ? (
                      <div className="space-y-2">
                        {hq.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${hq.id}`}
                              checked={hq.correct === oi}
                              onChange={() =>
                                setHostQuizQuestions((prev) =>
                                  prev.map((q, i) => (i === qi ? { ...q, correct: oi } : q))
                                )
                              }
                              className="w-4 h-4 accent-cyan-600 shrink-0"
                              title="Mark as correct"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) =>
                                setHostQuizQuestions((prev) =>
                                  prev.map((q, i) =>
                                    i === qi
                                      ? {
                                          ...q,
                                          options: q.options.map((o, j) =>
                                            j === oi ? e.target.value : o
                                          )
                                        }
                                      : q
                                  )
                                )
                              }
                              placeholder={`Answer choice ${oi + 1}`}
                              className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-white dark:bg-black/50 border border-gray-300 dark:border-white/10 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none font-bold text-slate-900 dark:text-white text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                        {[
                          { label: "True is correct", idx: 0 },
                          { label: "False is correct", idx: 1 }
                        ].map(({ label, idx }) => (
                          <label
                            key={idx}
                            className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-gray-200 text-sm"
                          >
                            <input
                              type="radio"
                              name={`bool-correct-${hq.id}`}
                              checked={hq.correct === idx}
                              onChange={() =>
                                setHostQuizQuestions((prev) =>
                                  prev.map((q, i) => (i === qi ? { ...q, correct: idx } : q))
                                )
                              }
                              className="w-4 h-4 accent-fuchsia-600"
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setHostQuizQuestions((prev) => [...prev, makeDraftQuestion()])}
                className="mt-4 w-full py-3 rounded-xl border-2 border-dashed border-fuchsia-300 dark:border-fuchsia-500/40 text-fuchsia-600 dark:text-fuchsia-400 font-bold hover:bg-fuchsia-50 dark:hover:bg-fuchsia-500/10 transition-colors flex items-center justify-center"
              >
                <Plus size={18} className="mr-2" /> Add question
              </button>
            </div>

            {/* Timing Toggle */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest pl-1">When are you playing?</label>
              <div className="flex bg-gray-100 dark:bg-black/40 p-1.5 rounded-xl border border-gray-200 dark:border-white/5">
                <button 
                  onClick={() => setIsScheduling(false)}
                  className={`flex-1 py-3 rounded-lg font-black text-sm flex justify-center items-center transition-all ${!isScheduling ? 'bg-cyan-500 text-white shadow-md dark:shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'}`}
                >
                  <Activity size={18} className="mr-2" /> Play Now
                </button>
                <button 
                  onClick={() => setIsScheduling(true)}
                  className={`flex-1 py-3 rounded-lg font-black text-sm flex justify-center items-center transition-all ${isScheduling ? 'bg-fuchsia-600 text-white shadow-md dark:shadow-[0_0_15px_rgba(217,70,239,0.4)]' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'}`}
                >
                  <Calendar size={18} className="mr-2" /> Schedule
                </button>
              </div>
            </div>

            {/* Scheduling Inputs */}
            {isScheduling && (
              <div className="flex space-x-4 animate-fade-in-up pt-2">
                <div className="flex-1">
                  <input 
                    type="date" 
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full px-4 py-4 rounded-xl bg-white dark:bg-black/50 border border-gray-300 dark:border-white/10 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20 focus:outline-none font-bold text-slate-900 dark:text-white transition-all shadow-sm dark:shadow-none dark:[color-scheme:dark]"
                  />
                </div>
                <div className="flex-1">
                  <input 
                    type="time" 
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-4 py-4 rounded-xl bg-white dark:bg-black/50 border border-gray-300 dark:border-white/10 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20 focus:outline-none font-bold text-slate-900 dark:text-white transition-all shadow-sm dark:shadow-none dark:[color-scheme:dark]"
                  />
                </div>
              </div>
            )}
            
            <button 
              onClick={startHosting}
              disabled={!username.trim() || hostFunding < 0}
              className={`w-full text-white py-5 rounded-xl font-black text-2xl disabled:opacity-50 transition-all flex justify-center items-center mt-8 border ${isScheduling ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 border-fuchsia-400/30 shadow-md dark:hover:shadow-[0_0_30px_rgba(217,70,239,0.6)]' : 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400/30 shadow-md dark:hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]'}`}
            >
              {isScheduling ? "Schedule Game" : "Create Room"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWaitingRoom = () => {
    const isHostView = viewMode === 'host';
    const gameUrl = `https://hiveclash.app/join/${gameId}`;
    const formattedId = gameId ? `${gameId.slice(0,3)} ${gameId.slice(3,6)}` : '000 000';

    return (
      <div className="flex flex-col min-h-screen p-4 sm:p-8 transition-colors duration-500 bg-slate-50 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-zinc-900 dark:via-black dark:to-black text-slate-900 dark:text-white relative">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>

        {/* Toggle View Mode Buttons */}
        <div className="absolute top-2 sm:top-6 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-2 bg-white/80 dark:bg-white/5 p-1.5 rounded-full backdrop-blur-md z-20 border border-gray-200 dark:border-white/10 w-max shadow-sm">
          <button onClick={() => setViewMode('host')} className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center transition-all ${isHostView ? 'bg-cyan-500 text-white shadow-md dark:shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}>
            <MonitorPlay size={16} className="mr-2" /> Host TV
          </button>
          <button onClick={() => setViewMode('player')} className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center transition-all ${!isHostView ? 'bg-fuchsia-500 text-white shadow-md dark:shadow-[0_0_10px_rgba(217,70,239,0.5)]' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}>
            <Smartphone size={16} className="mr-2" /> Player Phone
          </button>
        </div>

        {isHostView ? (
          <div className="flex-1 flex flex-col mt-16 max-w-7xl mx-auto w-full z-10">
            <div className="flex flex-col lg:flex-row justify-between items-center bg-white dark:bg-zinc-900/60 backdrop-blur-xl p-6 sm:p-10 rounded-3xl shadow-2xl dark:shadow-[0_0_40px_rgba(6,182,212,0.1)] border border-gray-200 dark:border-cyan-500/20 gap-8 relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 blur-[60px] rounded-full pointer-events-none hidden dark:block"></div>
              
              {/* QR Code & Invite Link Section */}
              <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-10 z-10 w-full lg:w-auto">
                <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-100 dark:border-none dark:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(gameUrl)}`} 
                    alt="Game QR Code" 
                    className="w-32 h-32 sm:w-40 sm:h-40 object-contain"
                  />
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-cyan-400 font-bold uppercase tracking-widest text-sm mb-2 z-10">Join at {window.location.hostname} with PIN:</h2>
                  <div className="text-6xl sm:text-8xl font-black tracking-widest text-slate-900 dark:text-white drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] mb-6">
                    {formattedId}
                  </div>
                  <div className="flex items-center justify-center sm:justify-start space-x-3">
                    <span className="text-slate-700 dark:text-gray-300 font-mono bg-gray-100 dark:bg-black/50 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm sm:text-base">
                      {gameUrl}
                    </span>
                    <button 
                      onClick={copyToClipboard} 
                      className="bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 p-3 rounded-xl transition-all border border-gray-200 dark:border-white/10 hover:border-cyan-400/50 dark:hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                      title="Copy Invite Link"
                    >
                      {copiedLink ? <Check size={20} className="text-emerald-500 dark:text-emerald-400" /> : <Copy size={20} className="text-slate-700 dark:text-white" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Prize Pool Section */}
              <div className="text-center lg:text-right flex flex-col items-center lg:items-end border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-white/10 pt-8 lg:pt-0 lg:pl-10 w-full lg:w-auto z-10">
                <div className="text-amber-600 dark:text-amber-500/70 font-bold uppercase tracking-widest text-sm mb-4">Current Prize Pool</div>
                <div className="text-5xl sm:text-7xl font-black text-amber-500 dark:text-amber-400 flex items-center justify-center lg:justify-end bg-amber-50 dark:bg-black/40 px-8 py-5 rounded-3xl border border-amber-200 dark:border-amber-500/20 shadow-inner dark:shadow-[0_0_30px_rgba(245,158,11,0.15)] w-full">
                  <Coins size={56} className="mr-4 text-amber-500 dark:drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" /> {prizePool} <span className="text-3xl sm:text-4xl text-amber-600 ml-3">HIVE</span>
                </div>
              </div>
            </div>

            <div className="flex-1 mt-10 flex flex-col z-10">
              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end mb-6 gap-6">
                <h3 className="text-3xl font-black flex items-center text-slate-900 dark:text-white">
                  <Users className="mr-3 text-cyan-600 dark:text-cyan-400" size={32} /> Players In Room ({players.length})
                </h3>
                <button 
                  onClick={beginTrivia}
                  disabled={players.length === 0 || !activeQuiz.length}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:from-gray-400 disabled:to-gray-500 dark:disabled:from-zinc-700 dark:disabled:to-zinc-800 disabled:opacity-50 text-white px-12 py-4 rounded-2xl font-black text-2xl shadow-lg dark:shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:shadow-none transition-all flex items-center w-full sm:w-auto justify-center border border-emerald-400/30 disabled:border-transparent"
                >
                  <Play className="mr-3 fill-current" size={28} /> START GAME
                </button>
              </div>
              
              <div className="flex-1 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md rounded-3xl border border-gray-200 dark:border-white/5 p-6 sm:p-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 content-start shadow-lg dark:shadow-none">
                {players.length === 0 ? (
                  <div className="col-span-full h-full min-h-[300px] flex items-center justify-center text-slate-500 dark:text-gray-500 font-bold text-2xl animate-pulse">
                    Waiting for challengers to join...
                  </div>
                ) : (
                  players.map((p, i) => (
                    <div key={i} className="bg-white dark:bg-black/40 p-5 rounded-2xl flex flex-col items-center justify-center animate-fade-in-up text-center border border-gray-200 dark:border-white/5 hover:border-cyan-400 dark:hover:border-cyan-500/30 transition-colors shadow-sm dark:shadow-none">
                      <img 
                        src={`https://images.hive.blog/u/${p}/avatar`} 
                        alt="avatar" 
                        className="w-20 h-20 rounded-full border-2 border-cyan-400 mb-4 bg-gray-100 dark:bg-zinc-800 shadow-md dark:shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://images.hive.blog/u/hiveio/avatar"; }}
                      />
                      <span className="font-bold truncate w-full text-slate-800 dark:text-gray-200 text-lg">@{p}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center z-10 mt-16">
            <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-10 rounded-3xl shadow-2xl dark:shadow-[0_0_50px_rgba(217,70,239,0.15)] max-w-sm w-full transform hover:scale-105 transition-transform duration-500 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-amber-500"></div>
              
              <CheckCircle2 size={80} className="text-emerald-500 dark:text-emerald-400 mx-auto mb-6 drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              <h2 className="text-4xl font-black mb-3 text-slate-900 dark:text-white">You're in!</h2>
              <p className="text-lg font-bold text-gray-500 dark:text-gray-400 mb-8">Look for your nickname on the big screen</p>
              
              <div className="bg-gray-50 dark:bg-black/50 py-4 rounded-xl flex items-center justify-center font-black text-2xl text-fuchsia-600 dark:text-fuchsia-400 border border-gray-200 dark:border-fuchsia-500/30 shadow-inner dark:shadow-[0_0_15px_rgba(217,70,239,0.2)]">
                <User className="mr-2" /> @{username}
              </div>
            </div>
            <div className="mt-16 text-2xl font-bold text-cyan-600 dark:text-cyan-400/80 animate-pulse flex flex-col items-center">
              <Activity className="mb-3" size={32} />
              Awaiting host to start the game...
            </div>
            {/* Fallback button for testing if joined as player */}
            <button onClick={beginTrivia} className="mt-12 text-sm text-gray-500 dark:text-gray-600 hover:text-slate-900 dark:hover:text-white border border-gray-300 dark:border-gray-800 hover:border-gray-400 dark:hover:border-white/20 px-5 py-2.5 rounded-full transition-all">
              (Dev Test) Force Start
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderPlaying = () => {
    const q = activeQuiz[currentQIndex];
    if (!q) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black text-slate-600 dark:text-gray-400 font-bold p-6">
          No questions loaded for this game.
        </div>
      );
    }
    const isHostView = viewMode === 'host';
    const isBoolean = q.type === 'boolean';
    const options = q.options;
    const colors = isBoolean ? BOOL_COLORS : COLORS;
    const icons = isBoolean ? BOOL_ICONS : ICONS;
    const formattedId = gameId ? `${gameId.slice(0,3)} ${gameId.slice(3,6)}` : '000 000';

    return (
      <div className="flex flex-col min-h-screen p-4 sm:p-8 bg-slate-50 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-zinc-900 dark:via-black dark:to-black text-slate-900 dark:text-white relative overflow-hidden transition-colors duration-500">
        
        {/* Toggle View Mode Buttons */}
        <div className="absolute top-2 sm:top-6 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-2 bg-white/80 dark:bg-white/5 p-1.5 rounded-full backdrop-blur-md z-20 border border-gray-200 dark:border-white/10 w-max shadow-sm">
          <button onClick={() => setViewMode('host')} className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold flex items-center transition-all ${isHostView ? 'bg-cyan-500 text-white shadow-md dark:shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}>
            <MonitorPlay size={14} className="mr-1 sm:mr-2" /> Host TV
          </button>
          <button onClick={() => setViewMode('player')} className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold flex items-center transition-all ${!isHostView ? 'bg-fuchsia-500 text-white shadow-md dark:shadow-[0_0_10px_rgba(217,70,239,0.5)]' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}>
            <Smartphone size={14} className="mr-1 sm:mr-2" /> Player Phone
          </button>
        </div>

        {/* Header - Changes based on view */}
        <div className="flex justify-between items-center mt-12 sm:mt-16 mb-6 sm:mb-10 p-3 sm:p-5 rounded-2xl bg-white/90 dark:bg-zinc-900/60 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-lg relative z-10">
          {!isHostView ? (
             <div className="flex items-center space-x-2 sm:space-x-4 font-bold text-lg sm:text-xl">
               <img src={`https://images.hive.blog/u/${username}/avatar`} alt="avatar" className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 border-fuchsia-500 shadow-md dark:shadow-[0_0_10px_rgba(217,70,239,0.5)] bg-gray-100 dark:bg-zinc-800" onError={(e) => { e.target.onerror = null; e.target.src = "https://images.hive.blog/u/hiveio/avatar"; }}/>
               <div className="flex flex-col">
                 <span className="truncate max-w-[100px] sm:max-w-none text-slate-900 dark:text-white">@{username}</span>
                 {streak > 1 && <span className="text-xs sm:text-sm text-amber-600 dark:text-amber-500 flex items-center mt-0.5 sm:mt-1 dark:drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]"><Flame size={14} className="mr-1 fill-amber-500" /> {streak} Streak!</span>}
               </div>
             </div>
          ) : (
            <div className="font-bold text-sm sm:text-xl flex items-center text-slate-700 dark:text-gray-300">
              PIN: <span className="bg-gray-100 dark:bg-black/50 text-slate-900 dark:text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl tracking-widest ml-2 sm:ml-3 font-mono border border-gray-200 dark:border-white/10 shadow-inner">{formattedId}</span>
            </div>
          )}

          <div className="flex items-center space-x-1 sm:space-x-3 font-black text-3xl sm:text-5xl">
            <Clock size={window.innerWidth < 640 ? 28 : 40} className={timeLeft <= 5 ? "text-rose-500 animate-pulse drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]" : "text-cyan-600 dark:text-cyan-400 dark:drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]"} />
            <span className={timeLeft <= 5 ? "text-rose-500 dark:drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]" : "text-slate-900 dark:text-white"}>{timeLeft}</span>
          </div>

          {!isHostView ? (
            <div className="font-bold text-base sm:text-2xl bg-gray-100 dark:bg-black/50 px-4 py-2 sm:px-6 sm:py-3 rounded-xl flex items-center space-x-2 border border-gray-200 dark:border-white/10">
              <span className="text-slate-800 dark:text-gray-200">{score} <span className="text-slate-500 dark:text-gray-500 text-sm sm:text-lg hidden sm:inline">PTS</span></span>
              {streak > 2 && <Flame className="text-amber-500 animate-bounce fill-amber-500 hidden sm:block dark:drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" size={24} />}
            </div>
          ) : (
            <div className="font-bold text-xs sm:text-xl bg-gray-100 dark:bg-black/50 px-4 py-2 sm:px-5 sm:py-3 rounded-xl border border-gray-200 dark:border-white/10 text-slate-700 dark:text-gray-300 tracking-wider">
              Q <span className="text-cyan-600 dark:text-cyan-400 mx-1">{currentQIndex + 1}</span> / {activeQuiz.length}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center z-10 w-full max-w-7xl mx-auto">
          
          {/* Question Text (Host Only) */}
          {isHostView && (
            <div className="w-full text-center mb-8 sm:mb-16 transform hover:scale-105 transition-transform duration-500 px-4">
              <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-tight drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                {q.text}
              </h2>
            </div>
          )}

          {/* Player Instructions (Player Only) */}
          {!isHostView && gameState === 'playing' && selectedAnswer === null && (
             <div className="mb-6 sm:mb-12 text-xl sm:text-4xl font-black text-gray-500 dark:text-gray-400 animate-pulse flex flex-col items-center text-center">
               <MonitorPlay className="mb-3 sm:mb-6 text-gray-400 dark:text-gray-600" size={56} />
               Eyes on the big screen!
             </div>
          )}

          {/* Answers Grid */}
          <div className={`grid gap-4 sm:gap-6 w-full ${isBoolean ? 'grid-cols-1 sm:grid-cols-2 max-w-4xl' : 'grid-cols-2 max-w-6xl'}`}>
            {options.map((opt, idx) => {
              const Icon = icons[idx];
              const isSelected = selectedAnswer === idx;
              const isRevealing = gameState === 'revealing';
              const isCorrect = isRevealing && q.correct === idx;
              const isWrongSelection = isRevealing && isSelected && !isCorrect;

              let btnClass = `${colors[idx]} text-white p-6 sm:p-16 rounded-3xl flex items-center justify-center transition-all cursor-pointer relative overflow-hidden min-h-[140px] sm:min-h-0 `;
              
              if (isRevealing) {
                btnClass += isCorrect ? " ring-4 sm:ring-8 ring-white z-10 scale-105 brightness-125" : " opacity-30 grayscale scale-95";
              } else if (!isHostView && selectedAnswer !== null && !isSelected) {
                btnClass += " opacity-40 grayscale-[50%]";
              } else if (!isHostView && selectedAnswer === null) {
                btnClass += " hover:scale-105 active:scale-95";
              }

              return (
                <button 
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={isHostView || selectedAnswer !== null || isRevealing}
                  className={btnClass}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity"></div>
                  
                  {/* The Shape Icon is huge on Player view, smaller on Host view */}
                  <div className={`flex items-center w-full ${isHostView ? 'justify-start space-x-5 sm:space-x-8' : 'justify-center'} relative z-10`}>
                    <Icon 
                      size={isHostView ? (window.innerWidth < 640 ? 36 : 64) : (window.innerWidth < 640 ? 64 : 120)} 
                      strokeWidth={isHostView ? 3 : 2} 
                      className={isHostView ? "opacity-90 shrink-0" : "opacity-100 drop-shadow-md dark:drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]"} 
                      fill={!isHostView ? "currentColor" : "none"}
                    />
                    
                    {/* Text only shows on Host View */}
                    {isHostView && (
                      <span className="text-2xl sm:text-4xl md:text-5xl font-bold text-left leading-tight drop-shadow-lg">{opt}</span>
                    )}
                  </div>

                  {/* Feedback Overlays for Player */}
                  {!isHostView && isRevealing && isCorrect && <CheckCircle2 size={window.innerWidth < 640 ? 80 : 140} className="absolute text-white drop-shadow-xl dark:drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] z-20 animate-bounce" />}
                  {!isHostView && isRevealing && isWrongSelection && <XCircle size={window.innerWidth < 640 ? 80 : 140} className="absolute text-white drop-shadow-xl dark:drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] z-20" />}
                </button>
              );
            })}
          </div>

          {/* Player Waiting Message */}
          {!isHostView && selectedAnswer !== null && gameState === 'playing' && (
            <div className="mt-12 sm:mt-20 text-center animate-pulse font-black text-cyan-600 dark:text-cyan-500/80 text-2xl sm:text-4xl px-4 dark:drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
              Locked in. Waiting for others...
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLeaderboard = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-zinc-900 dark:via-black dark:to-black text-slate-900 dark:text-white p-4 relative overflow-hidden transition-colors duration-500">
      <Confetti />
      
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-fuchsia-600/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none hidden dark:block"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none hidden dark:block"></div>

      <div className="z-10 flex flex-col items-center text-center w-full">
        <div className="relative mb-6 sm:mb-8 transform hover:scale-110 transition-transform duration-700">
          <Trophy size={100} className="text-amber-400 drop-shadow-xl dark:drop-shadow-[0_0_50px_rgba(251,191,36,0.8)] sm:w-[140px] sm:h-[140px]" />
          <Medal size={40} className="absolute -bottom-2 -right-2 text-cyan-500 dark:text-cyan-400 drop-shadow-lg dark:drop-shadow-[0_0_20px_rgba(6,182,212,0.8)] animate-bounce sm:w-[56px] sm:h-[56px]" />
        </div>
        
        <h1 className="text-5xl sm:text-8xl font-black mb-6 tracking-widest text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-b dark:from-white dark:to-gray-400 drop-shadow-md dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">PODIUM</h1>
        
        <div className="mb-12 sm:mb-16 inline-flex items-center bg-white dark:bg-black/50 px-8 sm:px-10 py-3 sm:py-4 rounded-full border border-amber-300 dark:border-amber-500/30 shadow-lg dark:shadow-[0_0_30px_rgba(245,158,11,0.15)]">
          <span className="text-slate-600 dark:text-gray-400 font-bold text-sm sm:text-lg uppercase tracking-widest mr-4">Total Prize Distributed</span>
          <span className="text-amber-500 dark:text-amber-400 font-black text-2xl sm:text-3xl flex items-center dark:drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
            <Coins size={28} className="mr-2" /> {prizePool} HIVE
          </span>
        </div>
        
        <div className="w-full max-w-2xl space-y-5 px-2">
          {/* 1st Place */}
          <div className="bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-500/20 dark:to-amber-600/20 backdrop-blur-md p-6 sm:p-8 rounded-3xl flex justify-between items-center font-black text-3xl sm:text-5xl shadow-xl dark:shadow-[0_0_40px_rgba(245,158,11,0.3)] transform scale-105 sm:scale-110 z-20 relative border border-amber-300 dark:border-amber-400/50">
            <div className="absolute -top-4 -left-2 sm:-top-5 sm:-left-5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs sm:text-sm px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border border-cyan-300/50 shadow-md dark:shadow-[0_0_15px_rgba(6,182,212,0.6)] transform -rotate-12 flex items-center tracking-widest uppercase">
              <Medal size={14} className="mr-2"/> NFT Awarded
            </div>
            <div className="flex items-center space-x-4 sm:space-x-6">
              <span className="bg-amber-400 text-white dark:text-black w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full text-2xl sm:text-3xl shadow-lg dark:shadow-[0_0_15px_rgba(251,191,36,0.8)] shrink-0">1</span>
              <span className="truncate max-w-[150px] sm:max-w-none text-slate-900 dark:text-white drop-shadow-sm dark:drop-shadow-md">@{username || 'winner'}</span>
            </div>
            <span className="text-amber-600 dark:text-amber-400 dark:drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]">{score || 2850}</span>
          </div>
          
          {/* 2nd Place */}
          <div className="bg-gray-100 dark:bg-zinc-800/50 backdrop-blur-md p-5 sm:p-6 rounded-2xl flex justify-between items-center font-bold text-2xl sm:text-3xl shadow-md dark:shadow-lg mt-8 sm:mt-10 border border-gray-300 dark:border-gray-400/30">
            <div className="flex items-center space-x-4 sm:space-x-5">
              <span className="bg-white dark:bg-gray-300 text-slate-900 dark:text-gray-900 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full text-xl sm:text-2xl shadow-inner shrink-0">2</span>
              <span className="truncate max-w-[150px] sm:max-w-none text-slate-800 dark:text-gray-200">@hiveking</span>
            </div>
            <span className="text-slate-600 dark:text-gray-300">{Math.floor((score || 2850) * 0.85)}</span>
          </div>

          {/* 3rd Place */}
          <div className="bg-orange-50 dark:bg-orange-900/30 backdrop-blur-md p-5 sm:p-6 rounded-2xl flex justify-between items-center font-bold text-xl sm:text-2xl shadow-sm dark:shadow-lg border border-orange-200 dark:border-orange-700/30">
            <div className="flex items-center space-x-4 sm:space-x-5">
              <span className="bg-orange-500 dark:bg-orange-600 text-white w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full text-xl sm:text-2xl shadow-inner shrink-0">3</span>
              <span className="truncate max-w-[150px] sm:max-w-none text-orange-900 dark:text-gray-300">@cryptogamer</span>
            </div>
            <span className="text-orange-600 dark:text-orange-400">{Math.floor((score || 2850) * 0.6)}</span>
          </div>
        </div>

        <div className="mt-16 sm:mt-24 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 z-20 w-full px-4 max-w-2xl">
          <button 
            onClick={shareOnX}
            className="flex items-center justify-center w-full sm:w-auto bg-black text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full font-black text-lg sm:text-xl hover:bg-gray-800 dark:hover:bg-zinc-900 hover:scale-105 transition-all shadow-xl dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-gray-800 dark:border-white/10 dark:hover:border-white/30"
          >
            <Twitter fill="currentColor" size={20} className="mr-3 sm:w-6 sm:h-6" />
            Share on X
          </button>

          <button 
            onClick={() => {
              setGameState('dashboard');
              setScore(0);
              setStreak(0);
              setCurrentQIndex(0);
              setSelectedAnswer(null);
              setLogs([]);
              setPlayers([]);
              setViewMode('player');
              setGameId('');
              setActiveQuiz([]);
            }}
            className="flex items-center justify-center w-full sm:w-auto bg-white dark:bg-white/10 text-slate-900 dark:text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full font-black text-lg sm:text-xl hover:bg-gray-100 dark:hover:bg-white/20 hover:scale-105 transition-all border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  const renderLoginModal = () => (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-3xl p-8 sm:p-10 w-full max-w-md shadow-2xl dark:shadow-[0_0_50px_rgba(225,29,72,0.15)] relative animate-fade-in-up">
        <button 
          onClick={() => setIsLoginModalOpen(false)}
          className="absolute top-5 right-5 text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
        >
          <XCircle size={28} />
        </button>

        <div className="flex justify-center mb-6">
          <div className="bg-rose-50 dark:bg-rose-500/10 p-5 rounded-full border border-rose-200 dark:border-rose-500/20 shadow-inner">
            <Key size={40} className="text-rose-500 dark:drop-shadow-[0_0_10px_rgba(225,29,72,0.8)]" />
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-center text-slate-900 dark:text-white mb-2">Hive Keychain</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-4 font-medium">
          Sign a short message with your posting key. No transaction is broadcast.
        </p>

        {keychainInstalled === false && (
          <div className="mb-6 rounded-2xl border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100 font-medium text-center">
            <p className="mb-2">The Hive Keychain extension is not available in this browser.</p>
            <a
              href="https://hive-keychain.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center font-bold text-amber-700 dark:text-amber-300 hover:underline"
            >
              <ExternalLink size={16} className="mr-1.5 shrink-0" />
              Get Hive Keychain
            </a>
          </div>
        )}
        {keychainInstalled === null && (
          <p className="text-center text-gray-400 dark:text-gray-500 text-sm mb-6">Looking for the Keychain extension…</p>
        )}

        <div className="space-y-6">
          <div className="relative">
            <User className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input 
              type="text" 
              placeholder="username (e.g. hiveio)"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value.toLowerCase())}
              disabled={isLoggingIn}
              className="w-full pl-14 pr-5 py-4 rounded-xl bg-gray-50 dark:bg-black border border-gray-300 dark:border-white/10 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none text-xl font-bold lowercase disabled:opacity-50 transition-all text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
              onKeyDown={(e) => e.key === 'Enter' && !isLoggingIn && handleKeychainLogin()}
            />
          </div>

          <button 
            onClick={handleKeychainLogin}
            disabled={
              !loginInput.trim() ||
              isLoggingIn ||
              keychainInstalled === false
            }
            className="w-full bg-rose-600 text-white py-4 rounded-xl font-black text-xl hover:bg-rose-500 disabled:bg-gray-300 dark:disabled:bg-zinc-800 disabled:text-gray-500 transition-all flex justify-center items-center shadow-lg dark:shadow-[0_0_20px_rgba(225,29,72,0.4)] disabled:shadow-none border border-rose-500/50 disabled:border-transparent"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="animate-spin mr-3" size={24} /> Approve in Keychain…
              </>
            ) : (
              "Sign with Keychain"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="font-sans relative bg-slate-50 dark:bg-black min-h-screen transition-colors duration-500">
        {/* Toast Notification */}
        {notification && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-rose-600 text-white px-5 sm:px-6 py-3 rounded-full shadow-xl dark:shadow-[0_0_30px_rgba(225,29,72,0.6)] z-50 flex items-center font-bold animate-pulse text-center w-max max-w-[90vw] text-sm sm:text-base border border-rose-400">
            <AlertCircle className="mr-2 shrink-0" size={20} />
            {notification}
          </div>
        )}

        {/* Main Game Area */}
        {gameState === 'dashboard' && renderDashboard()}
        {gameState === 'hostSetup' && renderHostSetup()}
        {gameState === 'waitingRoom' && renderWaitingRoom()}
        {(gameState === 'playing' || gameState === 'revealing') && renderPlaying()}
        {gameState === 'leaderboard' && renderLeaderboard()}

        {/* Modals */}
        {isLoginModalOpen && renderLoginModal()}

        {/* Mock Blockchain Activity Sidebar/Overlay (Hidden on Mobile) */}
        <div className="hidden md:block fixed bottom-6 right-6 w-80 bg-white/90 dark:bg-black/80 backdrop-blur-xl text-emerald-600 dark:text-emerald-400 p-5 rounded-2xl border border-gray-200 dark:border-white/10 z-50 pointer-events-none shadow-2xl dark:shadow-[0_0_30px_rgba(0,0,0,0.8)] transition-colors">
          <div className="flex items-center space-x-2 text-slate-800 dark:text-white font-bold mb-3 pb-3 border-b border-gray-200 dark:border-white/10">
            <Activity size={16} className="animate-pulse text-emerald-500" />
            <span className="tracking-widest uppercase text-xs">Hive Indexer Logs</span>
          </div>
          <div className="space-y-1.5 opacity-80 max-h-32 overflow-hidden flex flex-col justify-end text-xs text-slate-600 dark:text-gray-300">
            {logs.length === 0 ? (
              <span className="italic">Listening to network activity...</span>
            ) : (
              logs.map((log, i) => <div key={i} className="truncate">{log}</div>)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}