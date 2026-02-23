'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Challenge {
  id: string;
  mission: string;
  hint: string;
  acceptedAnswers: string[];
  explanation: string;
  points: number;
}

interface Level {
  id: number;
  name: string;
  icon: string;
  color: string;
  bgGlow: string;
  description: string;
  challenges: Challenge[];
}

type LineType = 'command' | 'success' | 'error' | 'info' | 'hint' | 'system';

interface TerminalLine {
  type: LineType;
  content: string;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  size: number;
}

type GameState = 'intro' | 'playing' | 'level-complete' | 'game-over' | 'victory';
type MascotMood = 'idle' | 'thinking' | 'happy' | 'sad' | 'celebrating';

// ─── Game Data ───────────────────────────────────────────────────────────────

const LEVELS: Level[] = [
  {
    id: 1,
    name: 'Navigation',
    icon: '🧭',
    color: 'text-sky-400',
    bgGlow: 'rgba(56,189,248,0.08)',
    description: 'Master moving around the filesystem',
    challenges: [
      {
        id: '1-1',
        mission: 'Print your current working directory path',
        hint: 'Think "Print Working Directory" — just 3 letters',
        acceptedAnswers: ['pwd'],
        explanation: '`pwd` prints the full absolute path of where you are right now.',
        points: 10,
      },
      {
        id: '1-2',
        mission: 'List ALL files (including hidden ones) in long format',
        hint: 'Use `ls` with two flags combined: -a (all) and -l (long format)',
        acceptedAnswers: ['ls -la', 'ls -al', 'ls -l -a', 'ls -a -l'],
        explanation: '`ls -la` shows all files (including hidden dotfiles) with permissions, owner, size and dates.',
        points: 15,
      },
      {
        id: '1-3',
        mission: 'Navigate to your home directory',
        hint: 'The tilde ~ is shorthand for home. Or just use `cd` with no arguments.',
        acceptedAnswers: ['cd ~', 'cd'],
        explanation: '`cd ~` or just `cd` takes you home. ~ always expands to your $HOME path.',
        points: 10,
      },
      {
        id: '1-4',
        mission: 'Go up one level to the parent directory',
        hint: 'Two dots (..) always mean "parent directory"',
        acceptedAnswers: ['cd ..'],
        explanation: '`cd ..` moves up one level. `..` is a universal reference to the parent directory.',
        points: 10,
      },
      {
        id: '1-5',
        mission: 'Find the full path to the `node` executable',
        hint: 'There\'s a command that tells you "which" program runs when you type a name',
        acceptedAnswers: ['which node'],
        explanation: '`which node` searches your $PATH and shows the full path to the node binary.',
        points: 15,
      },
    ],
  },
  {
    id: 2,
    name: 'Files & Dirs',
    icon: '📁',
    color: 'text-amber-400',
    bgGlow: 'rgba(251,191,36,0.08)',
    description: 'Create, copy, move, and organize files',
    challenges: [
      {
        id: '2-1',
        mission: 'Create a new directory called "projects"',
        hint: 'Short for "make directory"',
        acceptedAnswers: ['mkdir projects'],
        explanation: '`mkdir projects` creates a new directory. Use `-p` for nested paths.',
        points: 10,
      },
      {
        id: '2-2',
        mission: 'Create an empty file called "notes.txt"',
        hint: 'This command "touches" a file into existence',
        acceptedAnswers: ['touch notes.txt'],
        explanation: '`touch notes.txt` creates an empty file. On existing files it updates the timestamp.',
        points: 10,
      },
      {
        id: '2-3',
        mission: 'Create nested directories a/b/c in a single command',
        hint: 'Use `mkdir` with the flag that creates Parent dirs as needed',
        acceptedAnswers: ['mkdir -p a/b/c'],
        explanation: '`mkdir -p a/b/c` creates the full path at once. Without -p it fails if parents don\'t exist.',
        points: 20,
      },
      {
        id: '2-4',
        mission: 'Copy "file.txt" to a new file called "backup.txt"',
        hint: 'The command is `cp` — source then destination',
        acceptedAnswers: ['cp file.txt backup.txt'],
        explanation: '`cp source destination` copies files. Use `cp -r` for copying directories recursively.',
        points: 10,
      },
      {
        id: '2-5',
        mission: 'Rename "old.txt" to "new.txt"',
        hint: 'Unix uses the "move" command to rename — moving to a new name in the same place',
        acceptedAnswers: ['mv old.txt new.txt'],
        explanation: '`mv` handles both moving and renaming. Renaming is just "moving" to a new filename.',
        points: 10,
      },
    ],
  },
  {
    id: 3,
    name: 'Viewing Content',
    icon: '👁️',
    color: 'text-emerald-400',
    bgGlow: 'rgba(52,211,153,0.08)',
    description: 'Read and inspect what\'s inside files',
    challenges: [
      {
        id: '3-1',
        mission: 'Print the entire contents of "readme.txt" to the screen',
        hint: 'Con-CAT-enate — a feline-named command',
        acceptedAnswers: ['cat readme.txt'],
        explanation: '`cat` — my namesake command! 😸 It con-CAT-enates and prints file contents. Purrfect for small files.',
        points: 10,
      },
      {
        id: '3-2',
        mission: 'Show only the first 5 lines of "log.txt"',
        hint: 'Use the `head` command with -n to specify how many lines',
        acceptedAnswers: ['head -n 5 log.txt', 'head -5 log.txt'],
        explanation: '`head -n 5 log.txt` shows the first 5 lines. Default is 10 if you omit -n.',
        points: 15,
      },
      {
        id: '3-3',
        mission: 'Show the last 10 lines of "output.txt"',
        hint: 'The opposite of `head` — think of the tail end',
        acceptedAnswers: ['tail output.txt', 'tail -n 10 output.txt', 'tail -10 output.txt'],
        explanation: '`tail output.txt` shows the last 10 lines by default.',
        points: 15,
      },
      {
        id: '3-4',
        mission: 'Follow "server.log" live as new lines are written to it',
        hint: 'Use `tail` with a flag that -f-ollows the file in real time',
        acceptedAnswers: ['tail -f server.log'],
        explanation: '`tail -f` continuously streams new lines as they appear. Press Ctrl+C to stop.',
        points: 20,
      },
      {
        id: '3-5',
        mission: 'Open "bigfile.txt" in a scrollable pager (press q to quit)',
        hint: 'It rhymes with "stress" and is considered better than `more`',
        acceptedAnswers: ['less bigfile.txt'],
        explanation: '`less` lets you scroll through large files. Arrow keys navigate, q quits, /pattern searches.',
        points: 15,
      },
    ],
  },
  {
    id: 4,
    name: 'Searching',
    icon: '🔍',
    color: 'text-violet-400',
    bgGlow: 'rgba(167,139,250,0.08)',
    description: 'Find files and text patterns like a pro',
    challenges: [
      {
        id: '4-1',
        mission: 'Search for lines containing "error" in "app.log"',
        hint: 'Global Regular Expression Print — g-r-e-p',
        acceptedAnswers: ['grep error app.log', 'grep "error" app.log', "grep 'error' app.log"],
        explanation: '`grep pattern file` prints every line matching the pattern. One of Unix\'s most powerful tools.',
        points: 10,
      },
      {
        id: '4-2',
        mission: 'Search ALL files recursively for "TODO" (case-insensitive)',
        hint: 'Use grep with -r (recursive) and -i (ignore case), searching in . (current dir)',
        acceptedAnswers: [
          'grep -ri todo .', 'grep -ri "todo" .', 'grep -ir todo .',
          'grep -ri TODO .', 'grep -ri "TODO" .', 'grep -ir "TODO" .',
          'grep -ir "todo" .', "grep -ri 'TODO' .", "grep -ri 'todo' .",
        ],
        explanation: '`grep -ri` does a case-insensitive recursive search. The `.` means start from here.',
        points: 20,
      },
      {
        id: '4-3',
        mission: 'Find all .js files in the current directory tree',
        hint: 'Use the `find` command with -name and a wildcard (*.js)',
        acceptedAnswers: ['find . -name "*.js"', "find . -name '*.js'"],
        explanation: '`find . -name "*.js"` searches recursively from the current dir for files ending in .js.',
        points: 20,
      },
      {
        id: '4-4',
        mission: 'Count how many lines contain "error" in "app.log"',
        hint: 'Use grep with a flag that -c-ounts matches instead of showing them',
        acceptedAnswers: ['grep -c error app.log', 'grep -c "error" app.log'],
        explanation: '`grep -c` returns just the count of matching lines, not the lines themselves.',
        points: 20,
      },
      {
        id: '4-5',
        mission: 'Find all files modified in the last 1 day',
        hint: 'Use `find` with -type f (files only) and -mtime -1 (within 1 day)',
        acceptedAnswers: ['find . -type f -mtime -1', 'find . -mtime -1 -type f'],
        explanation: '`-mtime -1` means "modified less than 1 day ago". Negative values = within N days.',
        points: 25,
      },
    ],
  },
  {
    id: 5,
    name: 'Pipes & Redirection',
    icon: '🔗',
    color: 'text-rose-400',
    bgGlow: 'rgba(251,113,133,0.08)',
    description: 'Chain commands and control output flow',
    challenges: [
      {
        id: '5-1',
        mission: 'List files and pipe output to filter only .txt files',
        hint: 'Chain `ls` and `grep` using the | (pipe) character',
        acceptedAnswers: ['ls | grep .txt', 'ls | grep ".txt"', "ls | grep '.txt'"],
        explanation: '`|` (pipe) sends one command\'s output as input to the next. A core Unix philosophy!',
        points: 15,
      },
      {
        id: '5-2',
        mission: 'Save the output of `ls -la` to a file named "directory.txt"',
        hint: 'Use the > redirect operator to write stdout to a file',
        acceptedAnswers: ['ls -la > directory.txt', 'ls -al > directory.txt'],
        explanation: '`>` redirects stdout to a file, creating or overwriting it. `>>` appends instead.',
        points: 15,
      },
      {
        id: '5-3',
        mission: 'Append the word "done" to "log.txt" without overwriting it',
        hint: 'Use `echo` and the >> (double arrow) append operator',
        acceptedAnswers: ['echo done >> log.txt', 'echo "done" >> log.txt', "echo 'done' >> log.txt"],
        explanation: '`>>` appends to a file. Using `>` would erase existing content — be careful!',
        points: 20,
      },
      {
        id: '5-4',
        mission: 'Count the total number of lines in "data.csv"',
        hint: 'Use `wc` (word count) with the -l flag for lines',
        acceptedAnswers: ['wc -l data.csv', 'cat data.csv | wc -l'],
        explanation: '`wc -l` counts lines. Also useful: -w for words, -c for characters.',
        points: 15,
      },
      {
        id: '5-5',
        mission: 'Sort the lines in "names.txt" alphabetically and display them',
        hint: 'There\'s a command literally named `sort` — no tricks here!',
        acceptedAnswers: ['sort names.txt'],
        explanation: '`sort` outputs lines in alphabetical order. Add -r for reverse, -n for numeric sort.',
        points: 15,
      },
    ],
  },
];

const TOTAL_CHALLENGES = LEVELS.reduce((sum, l) => sum + l.challenges.length, 0);
const MAX_SCORE = LEVELS.flatMap(l => l.challenges).reduce((sum, c) => sum + c.points, 0);
const MAX_LIVES = 3;
const HINT_PENALTY = 5;
const MAX_ATTEMPTS = 2;

const MASCOT_STATES: Record<MascotMood, { emoji: string; message: string }> = {
  idle:        { emoji: '😺', message: 'Meow! What shall we learn today?' },
  thinking:    { emoji: '🐱', message: 'Hmm... think paw-sitively!' },
  happy:       { emoji: '😸', message: 'Purrfect! That\'s exactly right!' },
  sad:         { emoji: '🙀', message: 'Meow no! But don\'t stop meow!' },
  celebrating: { emoji: '🐈', message: 'You\'re the cat\'s meow! 🎉' },
};

const CORRECT_QUIPS = [
  'Purrfect! 🐱', 'Meow-velous work! 😸', 'Claw-some! 🐾',
  'Un-fur-gettable! 🌟', 'Hiss-torically correct! 💥', 'Feline fine! ✨',
  'Whisker-fast! ⚡', 'The cat\'s out of the bag! 🎊',
];

const WRONG_QUIPS = [
  'Hiss! Not quite, try again 🙀', 'Cat got your keyboard? Check the hint! 💡',
  'Meow no... so close though! 🐱', 'Don\'t paws now — try again! 🐾',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalize(cmd: string): string {
  return cmd.trim().replace(/\s+/g, ' ').toLowerCase();
}

function isCorrect(input: string, accepted: string[]): boolean {
  const n = normalize(input);
  return accepted.some(a => normalize(a) === n);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Sound Effects ────────────────────────────────────────────────────────────

function playPurr() {
  try {
    const ctx = new AudioContext();

    // Main oscillator — low rumble
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 90;

    // Tremolo LFO — creates the "rrrr" vibration
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 28;

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 30; // modulation depth in Hz

    // Master gain with fade-in/out envelope
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.18, ctx.currentTime + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.75);

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    lfo.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.75);
    lfo.stop(ctx.currentTime + 0.75);

    setTimeout(() => ctx.close(), 900);
  } catch {
    // Audio not supported
  }
}

function playMeow() {
  try {
    const ctx = new AudioContext();

    const osc = ctx.createOscillator();
    osc.type = 'sine';

    // Classic meow: ramp up, peak, drop — like a real cat
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(620, ctx.currentTime + 0.12);
    osc.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.32);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.22, ctx.currentTime + 0.22);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);

    setTimeout(() => ctx.close(), 600);
  } catch {
    // Audio not supported
  }
}

// ─── Stars Background ─────────────────────────────────────────────────────────

function StarField() {
  const stars = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: (i * 7 + 13) % 100,
    y: (i * 11 + 7) % 100,
    size: i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1.5,
    delay: (i * 0.3) % 4,
    duration: 2 + (i % 4),
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white animate-star-twinkle"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function UnixQuestPage() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [combo, setCombo] = useState(0);
  const [input, setInput] = useState('');
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [gameState, setGameState] = useState<GameState>('intro');
  const [mascotMood, setMascotMood] = useState<MascotMood>('idle');
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [scoreAnim, setScoreAnim] = useState(false);
  const [terminalShake, setTerminalShake] = useState(false);
  const [missionKey, setMissionKey] = useState(0);
  const [floatingText, setFloatingText] = useState<{ id: number; text: string; x: number } | null>(null);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundEnabledRef = useRef(true);

  function toggleSound() {
    const next = !soundEnabledRef.current;
    soundEnabledRef.current = next;
    setSoundEnabled(next);
  }

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const sparkleCounter = useRef(0);
  const floatingCounter = useRef(0);

  const currentLevel = LEVELS[levelIndex];
  const currentChallenge = currentLevel?.challenges[challengeIndex];
  const completedChallenges =
    LEVELS.slice(0, levelIndex).reduce((sum, l) => sum + l.challenges.length, 0) + challengeIndex;
  const progressPercent = (completedChallenges / TOTAL_CHALLENGES) * 100;

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input
  useEffect(() => {
    if (gameState === 'playing' && !transitioning) {
      inputRef.current?.focus();
    }
  }, [gameState, challengeIndex, levelIndex, transitioning]);

  // Reset mascot to idle after animation
  useEffect(() => {
    if (mascotMood === 'happy' || mascotMood === 'sad') {
      const t = setTimeout(() => setMascotMood('idle'), 2000);
      return () => clearTimeout(t);
    }
  }, [mascotMood]);

  function addLine(type: LineType, content: string) {
    setLines(prev => [...prev, { type, content }]);
  }

  function triggerSparkles() {
    const newSparkles = Array.from({ length: 8 }, (_, i) => ({
      id: sparkleCounter.current++,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      emoji: pick(['✨', '⭐', '🌟', '💫', '🎊', '🐾', '😸', '🐱']),
      size: 16 + Math.random() * 16,
    }));
    setSparkles(newSparkles);
    setTimeout(() => setSparkles([]), 800);
  }

  function triggerFloatingText(text: string) {
    const id = floatingCounter.current++;
    setFloatingText({ id, text, x: 30 + Math.random() * 40 });
    setTimeout(() => setFloatingText(null), 900);
  }

  function triggerScorePop() {
    setScoreAnim(true);
    setTimeout(() => setScoreAnim(false), 400);
  }

  function advanceChallenge(lvlIdx: number, chalIdx: number) {
    const nextChalIdx = chalIdx + 1;
    setWrongAttempts(0);
    setShowHint(false);
    setHintUsed(false);
    setTransitioning(false);
    setMissionKey(k => k + 1);

    if (nextChalIdx < LEVELS[lvlIdx].challenges.length) {
      setChallengeIndex(nextChalIdx);
      addLine('system', '  ' + '·'.repeat(44));
    } else {
      const nextLvlIdx = lvlIdx + 1;
      if (nextLvlIdx < LEVELS.length) {
        setGameState('level-complete');
      } else {
        setGameState('victory');
        setMascotMood('celebrating');
      }
    }
  }

  function startGame() {
    setLines([]);
    setGameState('playing');
    setMascotMood('idle');
    setTimeout(() => {
      addLine('system', `  😺 Meow! I'm Prof. Whiskers. Let's learn Unix together!`);
      addLine('system', `  Type commands to complete missions. I'll guide you every step! 🐾`);
      addLine('system', `  ${currentLevel.icon} Level 1: ${LEVELS[0].name} — ${LEVELS[0].description}`);
      addLine('system', '  ' + '─'.repeat(44));
    }, 0);
  }

  function handleSubmit() {
    if (!input.trim() || gameState !== 'playing' || transitioning) return;

    const cmd = input.trim();
    addLine('command', `  $ ${cmd}`);
    setCmdHistory(prev => [cmd, ...prev.slice(0, 49)]);
    setHistoryIdx(-1);
    setInput('');
    setMascotMood('thinking');

    setTimeout(() => {
      if (isCorrect(cmd, currentChallenge.acceptedAnswers)) {
        const basePoints = hintUsed ? Math.max(5, currentChallenge.points - HINT_PENALTY) : currentChallenge.points;
        const comboBonus = combo >= 4 ? 10 : combo >= 2 ? 5 : 0;
        const totalPts = basePoints + comboBonus;

        setScore(prev => prev + totalPts);
        setCombo(c => c + 1);
        setMascotMood('happy');
        triggerSparkles();
        triggerScorePop();
        if (soundEnabledRef.current) playPurr();

        const quip = pick(CORRECT_QUIPS);
        const bonusMsg = comboBonus > 0 ? ` (+${comboBonus} combo bonus 🔥)` : '';
        addLine('success', `  ✓ ${quip}  +${totalPts} pts${bonusMsg}`);
        addLine('info', `  ↳ ${currentChallenge.explanation}`);
        triggerFloatingText(`+${totalPts} pts`);

        setTransitioning(true);
        setTimeout(() => advanceChallenge(levelIndex, challengeIndex), 1000);
      } else {
        const newWrong = wrongAttempts + 1;
        setWrongAttempts(newWrong);
        setCombo(0);
        setMascotMood('sad');
        setTerminalShake(true);
        setTimeout(() => setTerminalShake(false), 500);
        if (soundEnabledRef.current) playMeow();

        if (newWrong >= MAX_ATTEMPTS) {
          const newLives = lives - 1;
          setLives(newLives);
          addLine('error', `  ✗ The answer was: ${currentChallenge.acceptedAnswers[0]}`);
          addLine('info', `  ↳ ${currentChallenge.explanation}`);
          setTransitioning(true);

          if (newLives <= 0) {
            setTimeout(() => setGameState('game-over'), 1500);
          } else {
            setTimeout(() => advanceChallenge(levelIndex, challengeIndex), 1500);
          }
        } else {
          const quip = pick(WRONG_QUIPS);
          addLine('error', `  ✗ ${quip}`);
          if (!hintUsed) {
            addLine('hint', `  😺 Prof. Whiskers: ${currentChallenge.hint}`);
            setHintUsed(true);
          }
          setShowHint(true);
        }
      }
    }, 80);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = Math.min(historyIdx + 1, cmdHistory.length - 1);
      setHistoryIdx(idx);
      setInput(cmdHistory[idx] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const idx = Math.max(historyIdx - 1, -1);
      setHistoryIdx(idx);
      setInput(idx === -1 ? '' : cmdHistory[idx]);
    }
  }

  function useHintButton() {
    if (!hintUsed) {
      setHintUsed(true);
      addLine('hint', `  😺 Prof. Whiskers: ${currentChallenge.hint}`);
    }
    setShowHint(true);
  }

  function continueToNextLevel() {
    const nextLvlIdx = levelIndex + 1;
    setLevelIndex(nextLvlIdx);
    setChallengeIndex(0);
    setWrongAttempts(0);
    setShowHint(false);
    setHintUsed(false);
    setMascotMood('idle');
    setMissionKey(k => k + 1);
    addLine('system', '  ' + '═'.repeat(44));
    addLine('system', `  ${LEVELS[nextLvlIdx].icon} Level ${nextLvlIdx + 1}: ${LEVELS[nextLvlIdx].name} — ${LEVELS[nextLvlIdx].description}`);
    addLine('system', '  ' + '─'.repeat(44));
    setGameState('playing');
  }

  function restart() {
    setLevelIndex(0);
    setChallengeIndex(0);
    setScore(0);
    setLives(MAX_LIVES);
    setCombo(0);
    setInput('');
    setLines([]);
    setShowHint(false);
    setHintUsed(false);
    setWrongAttempts(0);
    setTransitioning(false);
    setCmdHistory([]);
    setHistoryIdx(-1);
    setSparkles([]);
    setFloatingText(null);
    setMascotMood('idle');
    setMissionKey(0);
    setGameState('intro');
  }

  const lineColors: Record<LineType, string> = {
    command: 'text-white/90',
    success: 'text-emerald-400',
    error: 'text-rose-400',
    info: 'text-amber-300/80',
    hint: 'text-cyan-400',
    system: 'text-white/25',
  };

  // ─── Intro Screen ─────────────────────────────────────────────────────────

  if (gameState === 'intro') {
    return (
      <div className="min-h-screen bg-[#080b14] flex items-center justify-center p-6 relative overflow-hidden">
        <StarField />

        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20 blur-3xl bg-indigo-500 pointer-events-none" />

        <div className="relative max-w-lg w-full z-10">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-2 animate-bounce-slow">😺</div>
            <div className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-2">Prof. Whiskers presents</div>
            <h1 className="text-5xl font-bold text-white mb-2 tracking-tight" style={{ fontFamily: 'var(--font-poppins)' }}>
              Unix Quest
            </h1>
            <p className="text-white/40 text-base">Learn the Unix CLI — the purrfect way 🐾</p>
          </div>

          {/* Level cards */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 mb-4 backdrop-blur-sm">
            <div className="text-white/30 text-xs uppercase tracking-widest mb-4 font-semibold">
              5 Levels · {TOTAL_CHALLENGES} Challenges · {MAX_SCORE} pts max
            </div>
            <div className="space-y-2.5">
              {LEVELS.map((level, i) => (
                <div key={level.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0`}
                    style={{ background: level.bgGlow.replace('0.08', '0.15') }}>
                    {level.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold ${level.color}`}>{level.name}</div>
                    <div className="text-white/30 text-xs truncate">{level.description}</div>
                  </div>
                  <div className="text-white/20 text-xs shrink-0">{level.challenges.length} ch.</div>
                </div>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 mb-5 backdrop-blur-sm">
            <div className="text-white/30 text-xs uppercase tracking-widest mb-3 font-semibold">Prof. Whiskers&apos; Rules 🐾</div>
            <div className="space-y-2 text-sm text-white/50">
              <div className="flex gap-2"><span>⌨️</span><span>Type the correct Unix command and press <kbd className="bg-white/10 text-white/70 px-1.5 py-0.5 rounded text-xs font-mono">Enter</kbd></span></div>
              <div className="flex gap-2"><span>↕️</span><span>Use <kbd className="bg-white/10 text-white/70 px-1 py-0.5 rounded text-xs font-mono">↑↓</kbd> arrows to browse your command history</span></div>
              <div className="flex gap-2"><span>❤️</span><span>3 lives — 2 tries per challenge before losing one</span></div>
              <div className="flex gap-2"><span>🔥</span><span>Combo streak bonuses for consecutive correct answers!</span></div>
              <div className="flex gap-2"><span>😺</span><span>Prof. Whiskers gives hints and reacts to your answers</span></div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={startGame}
              className="flex-1 relative overflow-hidden bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-900/50"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              Let&apos;s Go! 😺 →
            </button>
            <Link
              href="/"
              className="px-5 py-3.5 border border-white/10 text-white/40 hover:text-white/60 hover:border-white/20 rounded-xl transition-all text-sm"
            >
              ← Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Game Over Screen ─────────────────────────────────────────────────────

  if (gameState === 'game-over') {
    return (
      <div className="min-h-screen bg-[#080b14] flex items-center justify-center p-6 relative overflow-hidden">
        <StarField />
        <div className="relative z-10 max-w-sm w-full text-center">
          <div className="text-6xl mb-4 animate-mascot-sad">🙀</div>
          <div className="text-white/30 text-sm mb-1 italic">"Don't paws now!" — Prof. Whiskers</div>
          <h1 className="text-3xl font-bold text-rose-400 mb-1" style={{ fontFamily: 'var(--font-poppins)' }}>
            Game Over
          </h1>
          <p className="text-white/30 mb-8 text-sm">You ran out of lives — but you learned a lot!</p>
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 mb-6">
            <div className="text-5xl font-bold text-white font-mono mb-1">{score}</div>
            <div className="text-white/30 text-sm">points scored</div>
            <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-rose-400 rounded-full" style={{ width: `${(score / MAX_SCORE) * 100}%` }} />
            </div>
            <div className="mt-2 text-white/25 text-xs">{Math.round((score / MAX_SCORE) * 100)}% of max score</div>
            <div className="mt-3 text-white/30 text-xs">{completedChallenges} / {TOTAL_CHALLENGES} challenges completed</div>
          </div>
          <button onClick={restart} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all hover:scale-[1.02]">
            Try Again 💪
          </button>
        </div>
      </div>
    );
  }

  // ─── Victory Screen ───────────────────────────────────────────────────────

  if (gameState === 'victory') {
    const pct = Math.round((score / MAX_SCORE) * 100);
    const medal = pct >= 90 ? '🥇' : pct >= 70 ? '🥈' : '🥉';
    return (
      <div className="min-h-screen bg-[#080b14] flex items-center justify-center p-6 relative overflow-hidden">
        <StarField />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full opacity-25 blur-3xl bg-amber-400 pointer-events-none" />
        <div className="relative z-10 max-w-sm w-full text-center">
          <div className="text-7xl mb-2 animate-bounce-slow">🐱</div>
          <div className="text-5xl mb-2 animate-mascot-happy">{medal}</div>
          <div className="text-white/30 text-sm mb-1 italic">"You&apos;re the cat&apos;s meow!" — Prof. Whiskers 🎉</div>
          <h1 className="text-3xl font-bold text-amber-400 mb-1" style={{ fontFamily: 'var(--font-poppins)' }}>
            Meow-velous!
          </h1>
          <p className="text-white/40 mb-8 text-sm">You mastered all {TOTAL_CHALLENGES} Unix CLI challenges!</p>
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 mb-6">
            <div className="text-6xl font-bold text-white font-mono mb-1">{score}</div>
            <div className="text-white/30 text-sm">{score} / {MAX_SCORE} points ({pct}%)</div>
            <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-3 flex justify-center gap-1">
              {'❤️'.repeat(lives)}{'🖤'.repeat(MAX_LIVES - lives)}
            </div>
            <div className="mt-1 text-white/30 text-xs">
              {lives === MAX_LIVES ? '🌟 Flawless! No lives lost!' : `${lives} life${lives !== 1 ? 's' : ''} remaining`}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={restart} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all hover:scale-[1.02]">
              Play Again
            </button>
            <Link href="/" className="flex-1 border border-white/10 text-white/40 hover:text-white/60 hover:border-white/20 py-3 rounded-xl transition-all text-sm">
              Back to HookHub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Level Complete Screen ────────────────────────────────────────────────

  if (gameState === 'level-complete') {
    const nextLevel = LEVELS[levelIndex + 1];
    return (
      <div className="min-h-screen bg-[#080b14] flex items-center justify-center p-6 relative overflow-hidden">
        <StarField />
        <div className="relative z-10 max-w-sm w-full text-center">
          <div className="text-5xl mb-2 animate-mascot-happy">😸</div>
          <div className="text-4xl mb-2">{currentLevel.icon}</div>
          <div className="text-white/30 text-sm mb-1 italic">"Claw-some work!" — Prof. Whiskers</div>
          <h1 className={`text-3xl font-bold mb-1 ${currentLevel.color}`} style={{ fontFamily: 'var(--font-poppins)' }}>
            Level {currentLevel.id} Complete!
          </h1>
          <p className="text-white/40 mb-1 text-sm">{currentLevel.name}</p>
          <p className="text-white/20 text-xs mb-8">All {currentLevel.challenges.length} challenges cleared ✓ 🐾</p>

          {nextLevel && (
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 mb-6 text-left">
              <div className="text-white/25 text-xs uppercase tracking-widest mb-3">Next Level</div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: nextLevel.bgGlow.replace('0.08', '0.2') }}>
                  {nextLevel.icon}
                </div>
                <div>
                  <div className={`font-bold text-lg ${nextLevel.color}`}>{nextLevel.name}</div>
                  <div className="text-white/30 text-sm">{nextLevel.description}</div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={continueToNextLevel}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all hover:scale-[1.02]"
          >
            Continue → Level {levelIndex + 2}
          </button>
        </div>
      </div>
    );
  }

  // ─── Main Game Screen ─────────────────────────────────────────────────────

  const mascot = MASCOT_STATES[mascotMood];

  return (
    <div
      className="min-h-screen bg-[#080b14] flex flex-col relative overflow-hidden"
      onClick={() => !transitioning && inputRef.current?.focus()}
    >
      <StarField />

      {/* Ambient level glow */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-1000"
        style={{ background: currentLevel.bgGlow.replace('0.08', '0.12') }}
      />

      {/* Sparkles */}
      {sparkles.map(s => (
        <div
          key={s.id}
          className="absolute pointer-events-none animate-sparkle-spin z-50"
          style={{ left: `${s.x}%`, top: `${s.y}%`, fontSize: s.size }}
        >
          {s.emoji}
        </div>
      ))}

      {/* Floating score text */}
      {floatingText && (
        <div
          className="absolute z-50 font-bold text-emerald-400 text-lg pointer-events-none animate-fly-up font-mono"
          style={{ left: `${floatingText.x}%`, top: '30%' }}
        >
          {floatingText.text}
        </div>
      )}

      {/* ── Header ── */}
      <header className="relative z-10 border-b border-white/[0.06] px-4 py-2.5 flex items-center gap-3 shrink-0 backdrop-blur-sm bg-black/20">
        <Link href="/" className="text-white/20 hover:text-white/50 text-xs transition-colors" onClick={e => e.stopPropagation()}>
          ← HookHub
        </Link>

        <div className="flex items-center gap-1.5">
          <span>😺</span>
          <span className="text-white font-bold text-sm" style={{ fontFamily: 'var(--font-poppins)' }}>
            Unix Quest
          </span>
          <span className="text-white/20 text-xs hidden sm:inline">with Prof. Whiskers</span>
        </div>

        {/* Level breadcrumb */}
        <div className="hidden md:flex items-center gap-0.5 mx-auto">
          {LEVELS.map((level, idx) => (
            <div key={level.id} className="flex items-center">
              <div className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                idx === levelIndex ? `${level.color} bg-white/[0.06]` :
                idx < levelIndex ? 'text-white/25' : 'text-white/10'
              }`}>
                {level.icon} <span className="hidden lg:inline">{level.name}</span>
              </div>
              {idx < LEVELS.length - 1 && <span className="text-white/10 text-xs">›</span>}
            </div>
          ))}
        </div>

        {/* Score + lives + sound toggle */}
        <div className="flex items-center gap-3 shrink-0 ml-auto md:ml-0">
          {combo >= 2 && (
            <div className="text-orange-400 text-xs font-bold animate-pulse">
              🔥 ×{combo}
            </div>
          )}
          <span
            className={`text-amber-400 font-mono font-bold text-sm transition-all ${scoreAnim ? 'animate-score-pop' : ''}`}
          >
            {score} pts
          </span>
          <span className="font-mono text-sm">
            {'❤️'.repeat(lives)}{'🖤'.repeat(MAX_LIVES - lives)}
          </span>
          <button
            onClick={e => { e.stopPropagation(); toggleSound(); }}
            className="text-white/30 hover:text-white/60 transition-colors text-base"
            title={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="relative z-10 flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 48px)' }}>

        {/* ── Left panel ── */}
        <div className="w-72 border-r border-white/[0.06] flex flex-col shrink-0 overflow-hidden backdrop-blur-sm bg-black/10">

          {/* Prof. Whiskers */}
          <div className="p-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div
                  className={`text-4xl transition-all select-none ${
                    mascotMood === 'happy' ? 'animate-mascot-happy' :
                    mascotMood === 'sad' ? 'animate-mascot-sad' :
                    mascotMood === 'celebrating' ? 'animate-bounce' :
                    mascotMood === 'thinking' ? 'animate-pulse-slow' : ''
                  }`}
                >
                  {mascot.emoji}
                </div>
                {/* Paw prints decorations */}
                <div className="absolute -bottom-1 -right-1 text-[10px] opacity-30">🐾</div>
              </div>
              <div>
                <div className="text-white/50 text-xs font-semibold">Prof. Whiskers</div>
                <div className="text-white/30 text-xs italic leading-snug mt-0.5">
                  &ldquo;{mascot.message}&rdquo;
                </div>
              </div>
            </div>
          </div>

          {/* Level + Challenge progress */}
          <div className="p-4 border-b border-white/[0.06]">
            <div className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${currentLevel.color}`}>
              {currentLevel.icon} {currentLevel.name}
            </div>
            <div className="text-white/20 text-xs mb-2.5">
              Challenge {challengeIndex + 1} / {currentLevel.challenges.length}
            </div>
            <div className="flex gap-1">
              {currentLevel.challenges.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                    idx < challengeIndex ? 'bg-emerald-500' :
                    idx === challengeIndex ? 'bg-indigo-400' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Mission card */}
          <div key={missionKey} className="p-4 flex-1 animate-slide-in-up">
            <div className="text-white/25 text-xs uppercase tracking-widest mb-2 font-semibold">Mission</div>
            <div className="text-white text-sm leading-relaxed font-medium mb-4">
              {currentChallenge.mission}
            </div>

            {/* Attempts indicator */}
            {wrongAttempts > 0 && !transitioning && (
              <div className="mb-3">
                <div className="text-white/25 text-xs mb-1">Attempts</div>
                <div className="flex gap-1">
                  {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${i < wrongAttempts ? 'bg-rose-500' : 'bg-white/10'}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Points */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/20">Reward:</span>
              <span className="text-amber-400 font-mono font-bold">
                +{hintUsed ? Math.max(5, currentChallenge.points - HINT_PENALTY) : currentChallenge.points} pts
              </span>
              {hintUsed && <span className="text-rose-500/50 text-xs font-mono">(hint −{HINT_PENALTY})</span>}
              {combo >= 2 && <span className="text-orange-400 text-xs">+{combo >= 4 ? 10 : 5} 🔥</span>}
            </div>
          </div>

          {/* Hint */}
          <div className="p-4 border-t border-white/[0.06]">
            {showHint ? (
              <div className="bg-cyan-950/40 border border-cyan-800/30 rounded-xl p-3 animate-slide-in-up">
                <div className="text-cyan-400 text-xs font-bold mb-1.5">😺 Prof. Whiskers says...</div>
                <div className="text-cyan-300/70 text-xs leading-relaxed">{currentChallenge.hint}</div>
              </div>
            ) : (
              <button
                onClick={e => { e.stopPropagation(); useHintButton(); }}
                className="w-full text-xs text-white/20 hover:text-cyan-400 border border-white/[0.06] hover:border-cyan-800/40 py-2 rounded-xl transition-all hover:bg-cyan-950/20"
              >
                🐱 Ask Prof. Whiskers (−{HINT_PENALTY} pts)
              </button>
            )}
          </div>

          {/* Overall progress */}
          <div className="px-4 pb-4">
            <div className="flex justify-between text-xs text-white/20 mb-1.5">
              <span>Overall Progress</span>
              <span>{completedChallenges}/{TOTAL_CHALLENGES}</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Terminal ── */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all ${terminalShake ? 'animate-shake' : ''}`}>

          {/* Terminal chrome */}
          <div className="flex items-center gap-1.5 px-4 py-2 bg-black/30 border-b border-white/[0.06] shrink-0">
            <div className="w-3 h-3 rounded-full bg-rose-500/60" />
            <div className="w-3 h-3 rounded-full bg-amber-500/60" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
            <span className="ml-3 text-white/20 text-xs font-mono">
              prof-whiskers — {currentLevel.name.toLowerCase()} — zsh 😺
            </span>
          </div>

          {/* Output */}
          <div
            ref={terminalRef}
            className="flex-1 overflow-y-auto p-5 font-mono text-sm"
            style={{ lineHeight: '1.75' }}
          >
            {lines.map((line, idx) => (
              <div
                key={idx}
                className={`whitespace-pre-wrap break-all ${lineColors[line.type]}`}
              >
                {line.content}
              </div>
            ))}

            {gameState === 'playing' && !transitioning && (
              <div className="mt-3 text-white/15 text-xs pb-1">
                ▸ {currentChallenge.mission}
              </div>
            )}
            {transitioning && (
              <div className="mt-2 text-indigo-400/50 text-xs animate-pulse">
                ⏳ loading next challenge...
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-white/[0.06] px-5 py-3.5 bg-black/20 shrink-0">
            <div className="flex items-center gap-2.5 font-mono text-sm">
              <span className={`shrink-0 font-bold transition-colors ${transitioning ? 'text-white/10' : 'text-indigo-400'}`}>
                $
              </span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onClick={e => e.stopPropagation()}
                className="flex-1 bg-transparent text-white/90 outline-none placeholder-white/10 disabled:opacity-30"
                placeholder={transitioning ? '' : 'type your command here...'}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                disabled={transitioning}
              />
              {input && !transitioning && (
                <button
                  onClick={e => { e.stopPropagation(); handleSubmit(); }}
                  className="text-white/20 hover:text-indigo-400 text-xs transition-colors shrink-0"
                >
                  Enter ↵
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
