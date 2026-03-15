import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Triangle, Hexagon, Circle, Square, Trophy, User, Clock, CheckCircle2, XCircle, Activity, Flame, Coins, Medal, MonitorPlay, Smartphone, Twitter, Users, Play, Copy, Check, Globe, Plus, ChevronLeft, AlertCircle, Key, LogOut, Loader2, Calendar, Bell, Sparkles, Menu, Sun, Moon, Image as ImageIcon } from 'lucide-react';

// --- DATABASE CONNECTION ---
const SUPABASE_URL = 'https://akpagofwnhzaophvdcba.supabase.co';
const SUPABASE_ANON_KEY = 'PASTE_YOUR_ANON_KEY_HERE'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- GAME CONFIG ---
const QUESTIONS = [
  { text: "What is the block time of the Hive Blockchain?", options: ["10 Minutes", "3 Seconds", "12 Seconds", "1 Minute"], correct: 1 },
  { text: "True or False: Hive transactions have gas fees.", options: ["True", "False"], correct: 1 },
  { text: "Which operation is used to store game data?", options: ["transfer", "vote", "custom_json", "delegate"], correct: 2 }
];

const ICONS = [Triangle, Hexagon, Circle, Square];
const COLORS = ["bg-rose-500", "bg-cyan-500", "bg-amber-500", "bg-emerald-500"];

export default function App() {
  // App State
  const [gameState, setGameState] = useState('dashboard'); 
  const [viewMode, setViewMode] = useState('player'); 
  const [username, setUsername] = useState('');
  const [gameId, setGameId] = useState('');
  const [players, setPlayers] = useState([]);
  
  // Game Logic State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // --- REAL-TIME SYNC ---

  useEffect(() => {
    if (!gameId) return;

    // Listen for Host Actions (Start, Next Question, etc)
    const roomSub = supabase
      .channel('room-logic')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `pin=eq.${gameId}` }, 
      (payload) => {
        const data = payload.new;
        setGameState(data.status);
        setCurrentQIndex(data.current_question);
        if (data.status === 'playing') {
            setTimeLeft(15);
            setSelectedAnswer(null);
        }
      })
      .subscribe();

    // Listen for Players Joining
    const playerSub = supabase
      .channel('player-list')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'players', filter: `game_pin=eq.${gameId}` }, 
      () => fetchPlayers())
      .subscribe();

    return () => {
      supabase.removeChannel(roomSub);
      supabase.removeChannel(playerSub);
    };
  }, [gameId]);

  const fetchPlayers = async () => {
    const { data } = await supabase.from('players').select('username').eq('game_pin', gameId);
    if (data) setPlayers(data.map(p => p.username));
  };

  // --- HANDLERS ---

  const handleHost = async () => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const { error } = await supabase.from('rooms').insert([{ pin, status: 'waitingRoom', current_question: 0 }]);
    if (!error) {
      setGameId(pin);
      setViewMode('host');
      setGameState('waitingRoom');
    }
  };

  const handleJoin = async (pin) => {
    if (!username) return alert("Enter a username first!");
    const { error } = await supabase.from('players').insert([{ username, game_pin: pin, score: 0 }]);
    if (!error) {
      setGameId(pin);
      setViewMode('player');
      setGameState('waitingRoom');
      fetchPlayers();
    } else {
      alert("Room not found!");
    }
  };

  const startTrivia = async () => {
    await supabase.from('rooms').update({ status: 'playing' }).eq('pin', gameId);
  };

  // --- RENDER DASHBOARD ---
  if (gameState === 'dashboard') {
    return (
      <div className={isDarkMode ? "dark" : ""}>
        <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col items-center justify-center p-6 transition-colors">
          <Hexagon size={80} className="text-fuchsia-500 mb-8 animate-pulse" />
          <h1 className="text-6xl font-black mb-10 dark:text-white tracking-tighter">HIVECLASH</h1>
          <div className="w-full max-w-sm space-y-4">
            <input 
              className="w-full p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 dark:text-white font-bold"
              placeholder="Your Hive Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <button onClick={handleHost} className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white p-5 rounded-2xl font-black text-xl shadow-lg transition-all">
              HOST NEW GAME
            </button>
            <div className="flex space-x-2">
              <input id="pin-in" className="flex-1 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 dark:text-white font-bold" placeholder="Room PIN" />
              <button onClick={() => handleJoin(document.getElementById('pin-in').value)} className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 rounded-2xl font-black transition-all">
                JOIN
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER WAITING ROOM ---
  if (gameState === 'waitingRoom') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center p-10 text-white">
        <h2 className="text-cyan-400 font-bold tracking-widest uppercase">Room PIN</h2>
        <h1 className="text-9xl font-black mb-12">{gameId}</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl">
          {players.map((p, i) => (
            <div key={i} className="bg-zinc-800 p-6 rounded-2xl text-center font-bold border border-white/5 animate-bounce">
              @{p}
            </div>
          ))}
        </div>
        {viewMode === 'host' && (
          <button onClick={startTrivia} className="mt-20 bg-emerald-500 hover:bg-emerald-400 px-16 py-6 rounded-full font-black text-3xl shadow-2xl transition-all">
            START TRIVIA
          </button>
        )}
      </div>
    );
  }

  // --- RENDER PLAYING ---
  if (gameState === 'playing' || gameState === 'revealing') {
    const q = QUESTIONS[currentQIndex];
    return (
      <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
        <div className="absolute top-10 flex items-center space-x-4">
           <Clock size={40} className={timeLeft < 5 ? "text-red-500 animate-ping" : "text-cyan-400"} />
           <span className="text-5xl font-black">{timeLeft}</span>
        </div>
        
        <div className="mb-16 text-center max-w-4xl">
          <h2 className="text-4xl sm:text-6xl font-black leading-tight">
            {viewMode === 'host' ? q.text : "Check the Host Screen!"}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-6 w-full max-w-5xl">
          {q.options.map((opt, i) => {
            const Icon = ICONS[i];
            return (
              <button 
                key={i}
                onClick={() => setSelectedAnswer(i)}
                className={`${COLORS[i]} p-10 sm:p-20 rounded-3xl flex flex-col items-center justify-center transition-all ${selectedAnswer === i ? 'ring-8 ring-white scale-105' : 'opacity-80'}`}
              >
                <Icon size={viewMode === 'host' ? 40 : 80} fill="currentColor" className="mb-4" />
                {viewMode === 'host' && <span className="text-2xl font-bold">{opt}</span>}
              </button>
            )
          })}
        </div>
      </div>
    );
  }

  return <div className="p-20 text-white bg-black h-screen">Loading Game...</div>;
}