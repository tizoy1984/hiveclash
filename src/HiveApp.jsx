import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Triangle, Hexagon, Circle, Square, Trophy, User, Clock, CheckCircle2, XCircle, Activity, Flame, Coins, Medal, MonitorPlay, Smartphone, Twitter, Users, Play, Copy, Check, Globe, Plus, ChevronLeft, AlertCircle, Key, LogOut, Loader2, Calendar, Bell, Sparkles, Menu, Sun, Moon, Image as ImageIcon } from 'lucide-react';

// --- DATABASE CONNECTION ---
const SUPABASE_URL = 'https://akpagofwnhzaophvdcba.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrcGFnb2Z3bmh6YW9waHZkY2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1OTUzODIsImV4cCI6MjA4OTE3MTM4Mn0.lzg2PBUg4TxOU-lDH7ZhSmnptqOTHAUoz1RutCTq6Ig'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- YOUR ORIGINAL CONFIG & DATA ---
const QUESTIONS = [
  { id: 1, text: "What is the block time of the Hive Blockchain?", options: ["10 Minutes", "3 Seconds", "12 Seconds", "1 Minute"], correct: 1, type: "multiple" },
  { id: 2, text: "True or False: Transactions on the Hive network require paying gas fees.", options: ["True", "False"], correct: 1, type: "boolean" },
  { id: 3, text: "Which operation is used to store this game's data for free?", options: ["transfer", "vote", "custom_json", "delegate_vesting_shares"], correct: 2, type: "multiple" }
];

const COLORS = [
  "bg-rose-500 hover:bg-rose-400 border-rose-600 shadow-lg dark:shadow-[0_0_20px_rgba(225,29,72,0.4)] dark:hover:shadow-[0_0_30px_rgba(225,29,72,0.6)]",
  "bg-cyan-500 hover:bg-cyan-400 border-cyan-600 shadow-lg dark:shadow-[0_0_20px_rgba(6,182,212,0.4)] dark:hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]",
  "bg-amber-500 hover:bg-amber-400 border-amber-600 shadow-lg dark:shadow-[0_0_20px_rgba(245,158,11,0.4)] dark:hover:shadow-[0_0_30px_rgba(245,158,11,0.6)]",
  "bg-emerald-500 hover:bg-emerald-400 border-emerald-600 shadow-lg dark:shadow-[0_0_20px_rgba(16,185,129,0.4)] dark:hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]"
];

const BOOL_COLORS = [
  "bg-cyan-500 hover:bg-cyan-400 border-cyan-600 shadow-lg dark:shadow-[0_0_20px_rgba(6,182,212,0.4)] dark:hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]",
  "bg-rose-500 hover:bg-rose-400 border-rose-600 shadow-lg dark:shadow-[0_0_20px_rgba(225,29,72,0.4)] dark:hover:shadow-[0_0_30px_rgba(225,29,72,0.6)]"
];

const ICONS = [Triangle, Hexagon, Circle, Square];
const BOOL_ICONS = [Hexagon, Triangle];
const MOCK_USERS = ['hiveking', 'cryptogamer', 'block_master', 'splinterlands_pro', 'web3_ninja', 'crypto_queen', 'hive_dev'];
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80';

const INITIAL_GAMES = [
  { id: '884921', status: 'live', host: 'hiveking', title: 'Crypto Trivia Night', prize: 250, players: 14, maxPlayers: 50, interested: [], image: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?auto=format&fit=crop&w=600&q=80' },
  { id: '112233', status: 'live', host: 'block_master', title: 'Hive Blockchain Basics', prize: 50, players: 5, maxPlayers: 20, interested: [], image: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?auto=format&fit=crop&w=600&q=80' }
];

// --- CONFETTI COMPONENT ---
const Confetti = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <div key={i} className="absolute w-3 h-3 animate-fall" style={{ left: `${Math.random() * 100}vw`, top: `-5vh`, backgroundColor: ['#06b6d4', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)], boxShadow: '0 0 10px currentColor', animationDuration: `${Math.random() * 2 + 2}s`, animationDelay: `${Math.random() * 2}s`, transform: `rotate(${Math.random() * 360}deg)` }} />
      ))}
      <style dangerouslySetInnerHTML={{__html: `@keyframes fall { 0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } } .animate-fall { animation: fall linear forwards infinite; }`}} />
    </div>
  );
};

export default function App() {
  const [gameState, setGameState] = useState('dashboard');
  const [username, setUsername] = useState('');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [logs, setLogs] = useState([]);
  const [games, setGames] = useState(INITIAL_GAMES);
  const [viewMode, setViewMode] = useState('player');
  const [prizePool, setPrizePool] = useState(0);
  const [players, setPlayers] = useState([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [gameId, setGameId] = useState('');
  const [notification, setNotification] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Host Setup State
  const [hostFunding, setHostFunding] = useState(50);
  const [hostGameTitle, setHostGameTitle] = useState('');
  const [hostImageUrl, setHostImageUrl] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  // Login State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // --- REAL-TIME SYNC LOGIC ---
  useEffect(() => {
    if (!gameId) return;

    // Listen for Host Status Changes (START GAME, REVEAL, etc)
    const roomSubscription = supabase.channel('room-sync')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `pin=eq.${gameId}` }, 
      (payload) => {
        const data = payload.new;
        setGameState(data.status);
        setCurrentQIndex(data.current_question);
        if (data.status === 'playing') setTimeLeft(15);
      }).subscribe();

    // Listen for Players Joining
    const playerSubscription = supabase.channel('players-sync')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'players', filter: `game_pin=eq.${gameId}` }, 
      () => fetchPlayers()).subscribe();

    return () => {
      supabase.removeChannel(roomSubscription);
      supabase.removeChannel(playerSubscription);
    };
  }, [gameId]);

  const fetchPlayers = async () => {
    const { data } = await supabase.from('players').select('username').eq('game_pin', gameId);
    if (data) setPlayers(data.map(p => p.username));
  };

  const addLog = (message) => {
    setLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  const triggerNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const handleKeychainLogin = () => {
    if (!loginInput.trim()) return;
    setIsLoggingIn(true);
    setTimeout(() => {
      setUsername(loginInput.toLowerCase());
      setIsLoggingIn(false);
      setIsLoginModalOpen(false);
      addLog(`@${loginInput.toLowerCase()} authenticated via Hive Keychain`);
      setLoginInput('');
    }, 1500);
  };

  const handleLogout = () => { setUsername(''); addLog(`User logged out.`); };

  const joinLiveGame = async (game) => {
    if (!username.trim()) { setIsLoginModalOpen(true); return; }
    
    // ADD TO REAL DATABASE
    const { error } = await supabase.from('players').insert([{ username, game_pin: game.id, score: 0 }]);
    
    if (!error) {
      setGameId(game.id);
      setPrizePool(game.prize + 1);
      setViewMode('player');
      setGameState('waitingRoom');
      fetchPlayers();
      addLog(`@${username} joined room ${game.id}.`);
    } else {
      triggerNotification("Game room not found!");
    }
  };

  const startHosting = async () => {
    if (!username.trim() || hostFunding < 0) return;
    if (!hostGameTitle.trim()) { triggerNotification("Please give your game a title."); return; }

    const newId = Math.floor(100000 + Math.random() * 900000).toString();

    // CREATE ROOM IN REAL DATABASE
    const { error } = await supabase.from('rooms').insert([{ pin: newId, status: 'waitingRoom', current_question: 0 }]);
    
    if (!error) {
      setGameId(newId);
      setPrizePool(hostFunding);
      setViewMode('host');
      setPlayers([]);
      setGameState('waitingRoom');
      addLog(`Room ${newId} hosted by @${username}.`);
    }
  };

  const beginTrivia = async () => {
    // UPDATE REAL DATABASE TO START GAME
    await supabase.from('rooms').update({ status: 'playing' }).eq('pin', gameId);
    setGameState('playing');
    setTimeLeft(15);
    addLog(`Host started the trivia!`);
  };

  const handleAnswer = (index) => {
    if (selectedAnswer !== null || gameState !== 'playing' || viewMode === 'host') return;
    setSelectedAnswer(index);
    addLog(`Choice ${index} locked in by @${username}`);
  };

  const shareOnX = () => {
    const text = `I just scored ${score || 2850} points in #HiveClash! 🏆\n\nPrize pool won: ${prizePool} $HIVE 🍯`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`https://hiveclash.app/join/${gameId}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Timer Countdown
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (gameState === 'playing' && timeLeft === 0) {
      setGameState('revealing');
      setTimeout(() => {
        if (currentQIndex < QUESTIONS.length - 1) {
          setCurrentQIndex(prev => prev + 1);
          setSelectedAnswer(null);
          setTimeLeft(15);
          setGameState('playing');
        } else {
          setGameState('leaderboard');
        }
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  // --- RENDERS (All your original UI code restored) ---

  const renderDashboard = () => {
    const liveGames = games.filter(g => g.status === 'live');
    const scheduledGames = games.filter(g => g.status === 'scheduled');

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-gray-100 flex flex-col transition-colors">
        <header className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border-b dark:border-white/10 p-4 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Hexagon className="text-fuchsia-500" size={24} />
              <h1 className="text-2xl font-black tracking-widest hidden sm:block">HIVECLASH</h1>
            </div>
            <div className="flex items-center space-x-6">
              {!username ? (
                <button onClick={() => setIsLoginModalOpen(true)} className="bg-white/5 px-6 py-2.5 rounded-full font-bold flex items-center border dark:border-white/10 hover:bg-white/10 transition-all">
                  <Key size={18} className="mr-2 text-fuchsia-400" /> Login
                </button>
              ) : (
                <div className="flex items-center space-x-4">
                  <span className="font-bold text-sm hidden sm:inline">@{username}</span>
                  <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors"><LogOut size={20} /></button>
                </div>
              )}
              <button onClick={() => setGameState('hostSetup')} className="bg-fuchsia-600 px-6 py-2.5 rounded-full font-bold text-white shadow-lg">Host Game</button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto p-6 w-full space-y-16">
          <div className="relative rounded-3xl p-12 text-white overflow-hidden border dark:border-white/10 bg-gradient-to-r from-zinc-900 to-black">
            <h2 className="text-6xl font-black mb-6 leading-tight">Prove your knowledge.<br/>Win real HIVE.</h2>
            <p className="text-gray-400 text-xl font-medium max-w-lg">Join active games, answer faster than the competition, and earn crypto rewards.</p>
          </div>

          <section>
            <h3 className="text-3xl font-black mb-8 border-b dark:border-white/10 pb-4">Live Now</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {liveGames.map(game => (
                <div key={game.id} className="bg-zinc-900 rounded-3xl overflow-hidden border border-white/5 group transition-all hover:border-cyan-500">
                  <img src={game.image} className="w-full h-56 object-cover" />
                  <div className="p-8">
                    <h3 className="text-2xl font-black mb-4">{game.title}</h3>
                    <div className="flex justify-between items-center bg-amber-500/10 p-5 rounded-2xl border border-amber-500/20">
                      <span className="text-amber-500 font-bold uppercase text-sm">Prize Pool</span>
                      <span className="text-2xl font-black text-amber-400">{game.prize} HIVE</span>
                    </div>
                    <button onClick={() => joinLiveGame(game)} className="w-full mt-6 bg-cyan-600 py-4 rounded-xl font-black text-lg hover:bg-cyan-500 transition-all">JOIN GAME</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    );
  };

  const renderHostSetup = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <div className="bg-zinc-900 rounded-3xl p-10 w-full max-w-lg border border-white/10">
        <h1 className="text-4xl font-black text-white mb-8 text-center">Host a Game</h1>
        <div className="space-y-6">
          <input className="w-full p-4 rounded-xl bg-black border border-white/10 text-white font-bold" placeholder="Game Title" onChange={e => setHostGameTitle(e.target.value)} />
          <input className="w-full p-4 rounded-xl bg-black border border-white/10 text-white font-bold" placeholder="Prize Funding (HIVE)" type="number" value={hostFunding} onChange={e => setHostFunding(e.target.value)} />
          <button onClick={startHosting} className="w-full bg-fuchsia-600 text-white py-5 rounded-xl font-black text-2xl shadow-lg">Create Room</button>
        </div>
      </div>
    </div>
  );

  const renderWaitingRoom = () => (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-10 text-white">
      <h2 className="text-cyan-400 font-bold tracking-widest uppercase">Room PIN</h2>
      <h1 className="text-9xl font-black mb-12">{gameId}</h1>
      <div className="grid grid-cols-4 gap-6 w-full max-w-4xl">
        {players.map((p, i) => (
          <div key={i} className="bg-zinc-800 p-6 rounded-2xl text-center font-bold border border-white/5 animate-bounce">@{p}</div>
        ))}
      </div>
      {viewMode === 'host' && (
        <button onClick={beginTrivia} className="mt-20 bg-emerald-500 px-16 py-6 rounded-full font-black text-3xl shadow-2xl">START GAME</button>
      )}
    </div>
  );

  const renderPlaying = () => {
    const q = QUESTIONS[currentQIndex];
    const isHost = viewMode === 'host';
    return (
      <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center">
        <div className="absolute top-10 flex items-center space-x-6 text-6xl font-black">
          <Clock size={56} className="text-cyan-400" /> <span>{timeLeft}</span>
        </div>
        <h2 className="text-6xl font-black mb-20 text-center">{isHost ? q.text : "Select your answer!"}</h2>
        <div className="grid grid-cols-2 gap-8 w-full max-w-6xl">
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => handleAnswer(i)} className={`${COLORS[i]} p-16 rounded-3xl flex flex-col items-center transition-all ${selectedAnswer === i ? 'ring-8 ring-white scale-105' : 'opacity-80'}`}>
              {isHost ? <span className="text-4xl font-bold">{opt}</span> : React.createElement(ICONS[i], {size: 100, fill: "currentColor"})}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderLeaderboard = () => (
    <div className="min-h-screen bg-black text-white p-10 flex flex-col items-center justify-center">
      <Confetti />
      <Trophy size={140} className="text-amber-400 mb-8" />
      <h1 className="text-8xl font-black mb-12 tracking-widest">LEADERBOARD</h1>
      <div className="w-full max-w-2xl space-y-6">
        <div className="bg-amber-500/20 p-8 rounded-3xl flex justify-between items-center font-black text-4xl border border-amber-500/30">
          <span>@{username || 'Player'}</span>
          <span className="text-amber-400">{score || 2850} PTS</span>
        </div>
      </div>
      <button onClick={() => setGameState('dashboard')} className="mt-16 bg-white text-black px-12 py-5 rounded-full font-black text-xl">Back to Dashboard</button>
    </div>
  );

  const renderLoginModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-3xl p-10 w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-black text-center text-white mb-8">Hive Keychain</h2>
        <input className="w-full p-4 rounded-xl bg-black border border-white/10 text-white font-bold mb-6" placeholder="Hive Username" onChange={e => setLoginInput(e.target.value)} />
        <button onClick={handleKeychainLogin} className="w-full bg-rose-600 text-white py-4 rounded-xl font-black text-xl">Sign In</button>
      </div>
    </div>
  );

  return (
    <div className={isDarkMode ? "dark" : ""}>
      {gameState === 'dashboard' && renderDashboard()}
      {gameState === 'hostSetup' && renderHostSetup()}
      {gameState === 'waitingRoom' && renderWaitingRoom()}
      {(gameState === 'playing' || gameState === 'revealing') && renderPlaying()}
      {gameState === 'leaderboard' && renderLeaderboard()}
      {isLoginModalOpen && renderLoginModal()}
      
      {notification && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-rose-600 text-white px-6 py-3 rounded-full z-50 animate-bounce">{notification}</div>
      )}
    </div>
  );
}