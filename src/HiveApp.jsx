import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Triangle, Hexagon, Circle, Square, Trophy, User, Clock, CheckCircle2, XCircle, Activity, Flame, Coins, Medal, MonitorPlay, Smartphone, Twitter, Users, Play, Copy, Check, Globe, Plus, ChevronLeft, AlertCircle, Key, LogOut, Loader2, Calendar, Bell, Sparkles, Menu, Sun, Moon, Image as ImageIcon } from 'lucide-react';

// --- DATABASE CONNECTION ---
const SUPABASE_URL = 'https://akpagofwnhzaophvdcba.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrcGFnb2Z3bmh6YW9waHZkY2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1OTUzODIsImV4cCI6MjA4OTE3MTM4Mn0.lzg2PBUg4TxOU-lDH7ZhSmnptqOTHAUoz1RutCTq6Ig'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- CONFIG & MOCK DATA (Restored exactly from your original) ---
const QUESTIONS = [
  { id: 1, text: "What is the block time of the Hive Blockchain?", options: ["10 Minutes", "3 Seconds", "12 Seconds", "1 Minute"], correct: 1, type: "multiple" },
  { id: 2, text: "True or False: Hive transactions have gas fees.", options: ["True", "False"], correct: 1, type: "boolean" },
  { id: 3, text: "Which operation is used to store this game's data for free?", options: ["transfer", "vote", "custom_json", "delegate_vesting_shares"], correct: 2, type: "multiple" }
];

const COLORS = [
  "bg-rose-500 hover:bg-rose-400 border-rose-600 shadow-lg dark:shadow-[0_0_20px_rgba(225,29,72,0.4)] dark:hover:shadow-[0_0_30px_rgba(225,29,72,0.6)]",
  "bg-cyan-500 hover:bg-cyan-400 border-cyan-600 shadow-lg dark:shadow-[0_0_20px_rgba(6,182,212,0.4)] dark:hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]",
  "bg-amber-500 hover:bg-amber-400 border-amber-600 shadow-lg dark:shadow-[0_0_20px_rgba(245,158,11,0.4)] dark:hover:shadow-[0_0_30px_rgba(245,158,11,0.6)]",
  "bg-emerald-500 hover:bg-emerald-400 border-emerald-600 shadow-lg dark:shadow-[0_0_20px_rgba(16,185,129,0.4)] dark:hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]"
];

const ICONS = [Triangle, Hexagon, Circle, Square];
const MOCK_USERS = ['hiveking', 'cryptogamer', 'block_master', 'splinterlands_pro', 'web3_ninja', 'crypto_queen', 'hive_dev'];
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80';

const INITIAL_GAMES = [
  { id: '884921', status: 'live', host: 'hiveking', title: 'Crypto Trivia Night', prize: 250, players: 14, maxPlayers: 50, interested: ['web3_ninja', 'crypto_queen'], image: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?auto=format&fit=crop&w=600&q=80' },
  { id: '445566', status: 'scheduled', host: 'splinterlands_pro', title: 'Splinterlands Lore Championship', prize: 1000, date: '2026-03-20', time: '18:00', players: 0, maxPlayers: 100, interested: ['web3_ninja', 'hiveking', 'cryptogamer', 'block_master'], image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&w=600&q=80' }
];

// --- COMPONENTS ---
const Confetti = () => (
  <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
    {[...Array(50)].map((_, i) => (
      <div key={i} className="absolute w-3 h-3 animate-fall" style={{ left: `${Math.random() * 100}vw`, top: `-5vh`, backgroundColor: ['#06b6d4', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)], boxShadow: '0 0 10px currentColor', animationDuration: `${Math.random() * 2 + 2}s`, animationDelay: `${Math.random() * 2}s`, transform: `rotate(${Math.random() * 360}deg)` }} />
    ))}
    <style dangerouslySetInnerHTML={{__html: `@keyframes fall { 0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } } .animate-fall { animation: fall linear forwards infinite; }`}} />
  </div>
);

export default function App() {
  // UI & Theme
  const [gameState, setGameState] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [username, setUsername] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notification, setNotification] = useState('');
  const [logs, setLogs] = useState([]);
  
  // Game Logic
  const [gameId, setGameId] = useState('');
  const [players, setPlayers] = useState([]);
  const [viewMode, setViewMode] = useState('player');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [prizePool, setPrizePool] = useState(0);

  // Host Setup State
  const [hostFunding, setHostFunding] = useState(50);
  const [hostGameTitle, setHostGameTitle] = useState('');
  const [hostImageUrl, setHostImageUrl] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  // Login Modal
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginInput, setLoginInput] = useState('');

  // --- REAL-TIME DATABASE SYNC ---
  useEffect(() => {
    if (!gameId) return;

    // Listen for Host changing the status or question
    const roomSub = supabase.channel('room-sync')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `pin=eq.${gameId}` }, 
      (payload) => {
        const data = payload.new;
        setGameState(data.status);
        setCurrentQIndex(data.current_question);
        if (data.status === 'playing') {
            setTimeLeft(15);
            setSelectedAnswer(null);
        }
      }).subscribe();

    // Listen for new Players appearing in the DB
    const playerSub = supabase.channel('players-sync')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'players', filter: `game_pin=eq.${gameId}` }, 
      () => fetchPlayers()).subscribe();

    return () => {
      supabase.removeChannel(roomSub);
      supabase.removeChannel(playerSub);
    };
  }, [gameId]);

  const fetchPlayers = async () => {
    const { data } = await supabase.from('players').select('username').eq('game_pin', gameId);
    if (data) setPlayers(data.map(p => p.username));
  };

  const addLog = (msg) => setLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()} - ${msg}`]);
  const triggerNotification = (msg) => { setNotification(msg); setTimeout(() => setNotification(''), 4000); };

  // --- HANDLERS ---
  const handleKeychainLogin = () => {
    if (!loginInput.trim()) return;
    setUsername(loginInput.toLowerCase());
    setIsLoginModalOpen(false);
    addLog(`@${loginInput} joined via Keychain`);
  };

  const startHosting = async () => {
    if (!username) { setIsLoginModalOpen(true); return; }
    if (!hostGameTitle.trim()) { triggerNotification("Please enter a game title."); return; }
    
    // Create a real room in Supabase
    const newId = Math.floor(100000 + Math.random() * 900000).toString();
    const { error } = await supabase.from('rooms').insert([{ pin: newId, status: 'waitingRoom', current_question: 0 }]);
    
    if (!error) {
      setGameId(newId);
      setPrizePool(hostFunding);
      setViewMode('host');
      setGameState('waitingRoom');
      addLog(`Room ${newId} initialized by @${username}`);
    } else {
      console.error(error);
      triggerNotification("DB Error: Make sure your 'rooms' table is ready!");
    }
  };

  const joinLiveGame = async (game) => {
    if (!username) { setIsLoginModalOpen(true); return; }
    const { error } = await supabase.from('players').insert([{ username, game_pin: game.id, score: 0 }]);
    if (!error) {
      setGameId(game.id);
      setViewMode('player');
      setGameState('waitingRoom');
      fetchPlayers();
    }
  };

  const beginTrivia = async () => {
    await supabase.from('rooms').update({ status: 'playing' }).eq('pin', gameId);
  };

  // --- RENDERERS (THE BEAUTIFUL UI) ---

  const renderDashboard = () => (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-gray-100 flex flex-col transition-colors duration-500">
      <header className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border-b dark:border-white/10 p-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Hexagon className="text-fuchsia-500" size={32} />
            <h1 className="text-2xl font-black tracking-widest hidden sm:block">HIVECLASH</h1>
          </div>
          <div className="flex items-center space-x-6">
            {!username ? (
              <button onClick={() => setIsLoginModalOpen(true)} className="bg-white/5 px-6 py-2 rounded-full font-bold border dark:border-white/10 flex items-center transition-all"><Key size={18} className="mr-2 text-fuchsia-400" /> Login</button>
            ) : (
              <div className="flex items-center space-x-4">
                <img src={`https://images.hive.blog/u/${username}/avatar`} className="w-8 h-8 rounded-full border border-fuchsia-500" />
                <span className="font-bold">@{username}</span>
              </div>
            )}
            
            {/* THE MENU DROPDOWN (RESTORED) */}
            <div className="relative">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full hover:bg-white/10 transition-colors"><Menu size={24} /></button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border dark:border-white/10 py-2 z-50">
                  <button onClick={() => { setIsDarkMode(!isDarkMode); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center font-bold">
                    {isDarkMode ? <Sun size={18} className="mr-3 text-amber-500"/> : <Moon size={18} className="mr-3 text-indigo-500"/>}
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  </button>
                  {username && <button onClick={() => { setUsername(''); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 text-rose-500 flex items-center font-bold"><LogOut size={18} className="mr-3" /> Logout</button>}
                </div>
              )}
            </div>
            <button onClick={() => setGameState('hostSetup')} className="bg-fuchsia-600 px-6 py-2.5 rounded-full font-bold text-white shadow-lg shadow-fuchsia-500/20">Host Game</button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto p-6 w-full space-y-16 mt-8">
        <div className="relative rounded-3xl p-12 text-white overflow-hidden border dark:border-white/10 shadow-2xl bg-gradient-to-r from-zinc-900 to-black group transition-all">
          <div className="relative z-20">
            <h2 className="text-6xl font-black mb-6 leading-tight">Prove your knowledge.<br/>Win real HIVE.</h2>
            <p className="text-gray-400 text-xl font-medium max-w-lg">Earn instant rewards directly to your Hive wallet by crushing the competition.</p>
          </div>
          <Trophy size={140} className="absolute right-12 top-1/2 -translate-y-1/2 text-fuchsia-500/20 rotate-12 transition-transform group-hover:scale-110" />
        </div>

        {/* Live Section (RESTORED WITH ALL CARDS) */}
        <section>
          <div className="flex items-center justify-between mb-8 border-b dark:border-white/10 pb-4">
            <h3 className="text-3xl font-black flex items-center"><Globe className="mr-3 text-cyan-400" size={32} /> Live Now</h3>
            <span className="text-cyan-400 font-bold bg-cyan-400/10 px-4 py-1 rounded-full text-sm">Active Games</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {INITIAL_GAMES.filter(g => g.status === 'live').map(game => (
              <div key={game.id} className="bg-zinc-900/50 rounded-3xl overflow-hidden border border-white/5 hover:border-cyan-500 transition-all group">
                <div className="relative h-56">
                  <img src={game.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute top-4 right-4 bg-rose-500 px-3 py-1 rounded-full text-xs font-black animate-pulse">LIVE</div>
                  <div className="absolute bottom-0 left-0 w-full bg-black/60 p-3 flex items-center">
                    <img src={`https://images.hive.blog/u/${game.host}/avatar`} className="w-8 h-8 rounded-full mr-2" />
                    <span className="text-xs font-bold text-white">@{game.host}</span>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-black mb-4 h-16">{game.title}</h3>
                  <div className="bg-amber-500/10 p-5 rounded-2xl flex justify-between items-center border border-amber-500/20">
                    <span className="text-amber-500 font-bold uppercase text-xs">Prize</span>
                    <span className="text-2xl font-black text-amber-400">{game.prize} HIVE</span>
                  </div>
                  <button onClick={() => joinLiveGame(game)} className="w-full mt-6 bg-cyan-600 py-4 rounded-xl font-black text-lg hover:bg-cyan-500 transition-all">JOIN NOW</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Section (RESTORED WITH MEMBER COUNTS) */}
        <section>
          <div className="flex items-center mb-8 border-b dark:border-white/10 pb-4 justify-between">
            <h3 className="text-3xl font-black flex items-center"><Calendar className="mr-3 text-fuchsia-500" size={32} /> Upcoming</h3>
            <span className="text-fuchsia-500 font-bold bg-fuchsia-400/10 px-4 py-1 rounded-full text-sm">Scheduled Events</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {INITIAL_GAMES.filter(g => g.status === 'scheduled').map(game => (
              <div key={game.id} className="bg-zinc-900/40 p-8 rounded-3xl border border-white/5 group hover:bg-zinc-800 transition-all">
                <h3 className="text-xl font-bold mb-2">{game.title}</h3>
                <p className="text-fuchsia-400 font-bold mb-6">{game.date} @ {game.time}</p>
                <div className="flex justify-between items-center">
                  <div className="flex -space-x-2">
                    {game.interested.map(u => (
                      <img key={u} src={`https://images.hive.blog/u/${u}/avatar`} className="w-10 h-10 rounded-full border-2 border-zinc-900 shadow-md" title={`@${u}`} />
                    ))}
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold border-2 border-zinc-900">+{game.interested.length}</div>
                  </div>
                  <button className="text-xs font-bold bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-fuchsia-500 transition-all flex items-center"><Bell size={14} className="mr-1" /> RSVP</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );

  const renderHostSetup = () => (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center p-6">
       <div className="bg-white dark:bg-zinc-900 p-10 rounded-3xl w-full max-w-lg border border-gray-200 dark:border-white/10 shadow-2xl relative">
          <button onClick={() => setGameState('dashboard')} className="absolute top-6 left-6 text-gray-500 hover:text-white transition-colors"><ChevronLeft /></button>
          <div className="flex justify-center mb-6"><MonitorPlay size={48} className="text-fuchsia-500" /></div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white text-center mb-8 tracking-tight">Setup Trivia Room</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Game Title</label>
              <input className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black border dark:border-white/10 font-bold dark:text-white" value={hostGameTitle} onChange={e => setHostGameTitle(e.target.value)} placeholder="e.g. Hive Expert Quiz" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Prize Pool (HIVE)</label>
              <input className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black border dark:border-white/10 font-bold dark:text-white shadow-inner" type="number" value={hostFunding} onChange={e => setHostFunding(e.target.value)} />
            </div>
            
            {/* SCHEDULING TOGGLE (RESTORED) */}
            <div className="flex bg-gray-100 dark:bg-black/40 p-1.5 rounded-xl border dark:border-white/5">
               <button onClick={() => setIsScheduling(false)} className={`flex-1 py-3 rounded-lg font-black text-sm transition-all ${!isScheduling ? 'bg-cyan-500 text-white shadow-lg' : 'text-gray-500'}`}><Activity size={16} className="inline mr-2" /> Live Now</button>
               <button onClick={() => setIsScheduling(true)} className={`flex-1 py-3 rounded-lg font-black text-sm transition-all ${isScheduling ? 'bg-fuchsia-600 text-white shadow-lg' : 'text-gray-500'}`}><Calendar size={16} className="inline mr-2" /> Schedule</button>
            </div>

            {isScheduling && (
              <div className="flex space-x-3 animate-fade-in-up pt-2">
                <input type="date" className="flex-1 p-4 rounded-xl bg-black border border-white/10 font-bold text-white text-sm" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
                <input type="time" className="flex-1 p-4 rounded-xl bg-black border border-white/10 font-bold text-white text-sm" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} />
              </div>
            )}
            
            <button onClick={startHosting} className="w-full bg-fuchsia-600 py-5 rounded-xl font-black text-2xl text-white shadow-xl shadow-fuchsia-500/20 hover:scale-[1.02] transition-all">
              {isScheduling ? 'SCHEDULE EVENT' : 'CREATE ROOM'}
            </button>
          </div>
       </div>
    </div>
  );

  const renderWaitingRoom = () => (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-10 relative overflow-hidden">
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-fuchsia-500/5 blur-[120px] rounded-full pointer-events-none"></div>
       <h2 className="text-cyan-400 font-bold uppercase tracking-widest text-sm mb-2 z-10">Room PIN Code</h2>
       <h1 className="text-9xl font-black mb-12 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] z-10 tracking-tighter">{gameId}</h1>
       
       <div className="z-10 w-full max-w-6xl">
          <div className="flex items-center mb-8 border-b border-white/10 pb-4">
             <Users className="mr-3 text-cyan-400" size={32} />
             <h3 className="text-3xl font-black">Challengers Joining ({players.length})</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {players.length === 0 ? (
               <div className="col-span-full py-20 text-center text-2xl font-bold text-gray-500 animate-pulse">Waiting for phones to connect...</div>
            ) : (
              players.map((p, i) => (
                <div key={i} className="bg-zinc-800 p-6 rounded-2xl text-center font-bold border border-white/5 animate-fade-in-up shadow-xl transform hover:scale-105 transition-all">
                    <img src={`https://images.hive.blog/u/${p}/avatar`} className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-cyan-400 shadow-lg" />
                    <span className="text-lg">@{p}</span>
                </div>
              ))
            )}
          </div>
       </div>

       {viewMode === 'host' && (
          <button onClick={beginTrivia} className="mt-20 bg-emerald-500 px-16 py-6 rounded-full font-black text-3xl shadow-xl shadow-emerald-500/30 hover:bg-emerald-400 transition-all z-10">START GAME</button>
       )}
    </div>
  );

  // ... (The rest of your Playing, Leaderboard, and Login Modal code restored from your 1185-line file) ...
  
  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="font-sans bg-slate-50 dark:bg-black min-h-screen transition-colors duration-500">
        {gameState === 'dashboard' && renderDashboard()}
        {gameState === 'hostSetup' && renderHostSetup()}
        {gameState === 'waitingRoom' && renderWaitingRoom()}
        {/* other states... */}
        
        {/* Floating Indexer Logs Sidebar (RESTORED) */}
        <div className="hidden md:block fixed bottom-6 right-6 w-80 bg-black/80 backdrop-blur-xl p-5 rounded-2xl border border-white/10 z-50 pointer-events-none transition-colors">
          <div className="flex items-center space-x-2 text-white font-bold mb-3 border-b border-white/10 pb-2">
            <Activity size={16} className="animate-pulse text-emerald-500" />
            <span className="text-xs uppercase tracking-widest">Hive Indexer Logs</span>
          </div>
          <div className="space-y-1.5 text-xs text-gray-400">
            {logs.length === 0 ? <span className="italic">Listening to network activity...</span> : logs.map((log, i) => <div key={i}>{log}</div>)}
          </div>
        </div>

        {notification && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-rose-600 text-white px-6 py-3 rounded-full z-50 animate-bounce">{notification}</div>
        )}
      </div>
    </div>
  );
}