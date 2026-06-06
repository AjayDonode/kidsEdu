import React, { useState, useEffect } from 'react';
import { Home, Castle, Award, Flame, Star, Wrench } from 'lucide-react';
import Login from './components/Login';
import MathCastle from './components/MathCastle';
import WordForest from './components/WordForest';
import ProgressDashboard from './components/ProgressDashboard';
import AdminPortal from './components/AdminPortal';
import Mascot from './components/Mascot';
import { audioSynth } from './utils/audioSynth';
import type { StudentStats, Question } from './types';

// SVG Illustrations for Game Cards
const MathCastleIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 260 200" style={{ display: 'block' }}>
    <defs>
      <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#bae6fd" />
        <stop offset="100%" stopColor="#e0f2fe" />
      </linearGradient>
      <linearGradient id="castleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#93c5fd" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
      <linearGradient id="roofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
      <linearGradient id="dragonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    
    <rect width="260" height="200" rx="20" fill="url(#skyGrad)" />
    <circle cx="40" cy="40" r="15" fill="#ffffff" opacity="0.8" />
    <circle cx="60" cy="45" r="18" fill="#ffffff" opacity="0.8" />
    <circle cx="210" cy="50" r="14" fill="#ffffff" opacity="0.7" />
    <circle cx="225" cy="55" r="16" fill="#ffffff" opacity="0.7" />

    <path d="M 0 160 Q 130 140 260 160 L 260 200 L 0 200 Z" fill="#86efac" />
    <path d="M 0 175 Q 130 160 260 175 L 260 200 L 0 200 Z" fill="#4ade80" />

    <text x="75" y="60" fill="#f59e0b" fontSize="26" fontWeight="900" fontFamily="'Fredoka', sans-serif" transform="rotate(-15 75 60)">2</text>
    <text x="25" y="110" fill="#ef4444" fontSize="24" fontWeight="900" fontFamily="'Fredoka', sans-serif" transform="rotate(10 25 110)">1</text>
    <text x="175" y="80" fill="#ec4899" fontSize="24" fontWeight="900" fontFamily="'Fredoka', sans-serif" transform="rotate(12 175 80)">3</text>
    <text x="20" y="70" fill="#0ea5e9" fontSize="26" fontWeight="900" fontFamily="'Fredoka', sans-serif" transform="rotate(-8 20 70)">+</text>
    <text x="180" y="115" fill="#f43f5e" fontSize="26" fontWeight="900" fontFamily="'Fredoka', sans-serif">-</text>
    <text x="220" y="100" fill="#aa3bff" fontSize="24" fontWeight="900" fontFamily="'Fredoka', sans-serif">=</text>

    <rect x="75" y="115" width="80" height="50" fill="url(#castleGrad)" stroke="#1d4ed8" strokeWidth="2.5" />
    <rect x="90" y="95" width="50" height="25" fill="url(#castleGrad)" stroke="#1d4ed8" strokeWidth="2.5" />
    
    <rect x="55" y="100" width="20" height="65" fill="url(#castleGrad)" stroke="#1d4ed8" strokeWidth="2.5" />
    <polygon points="50,100 65,65 80,100" fill="url(#roofGrad)" stroke="#1d4ed8" strokeWidth="2" />
    <line x1="65" y1="65" x2="65" y2="55" stroke="#dc2626" strokeWidth="2" />
    <polygon points="65,55 75,50 65,48" fill="#dc2626" />

    <rect x="155" y="100" width="20" height="65" fill="url(#castleGrad)" stroke="#1d4ed8" strokeWidth="2.5" />
    <polygon points="150,100 165,65 180,100" fill="url(#roofGrad)" stroke="#1d4ed8" strokeWidth="2" />
    <line x1="165" y1="65" x2="165" y2="55" stroke="#dc2626" strokeWidth="2" />
    <polygon points="165,55 175,50 165,48" fill="#dc2626" />

    <polygon points="100,95 115,55 130,95" fill="url(#roofGrad)" stroke="#1d4ed8" strokeWidth="2.5" />
    <line x1="115" y1="55" x2="115" y2="40" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
    <polygon points="115,40 132,33 115,30" fill="#dc2626" />

    <path d="M 105 110 L 125 110 L 125 122 Q 115 132 105 122 Z" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
    <path d="M 115 110 L 115 125" stroke="#ffffff" strokeWidth="1.5" />

    <path d="M 95 165 C 95 140 135 140 135 165 Z" fill="#b45309" stroke="#78350f" strokeWidth="2" />
    
    <rect x="100" y="80" width="10" height="12" rx="3" fill="#fef08a" stroke="#1d4ed8" strokeWidth="1.5" />
    <rect x="120" y="80" width="10" height="12" rx="3" fill="#fef08a" stroke="#1d4ed8" strokeWidth="1.5" />
    <circle cx="65" cy="115" r="4" fill="#fef08a" stroke="#1d4ed8" strokeWidth="1.5" />
    <circle cx="165" cy="115" r="4" fill="#fef08a" stroke="#1d4ed8" strokeWidth="1.5" />

    <g transform="translate(180, 115)" style={{ animation: 'float 3s ease-in-out infinite' }}>
      <path d="M 15 45 C 30 45, 35 30, 30 25" stroke="#10b981" strokeWidth="6" fill="none" strokeLinecap="round" />
      <ellipse cx="15" cy="35" rx="16" ry="18" fill="url(#dragonGrad)" stroke="#047857" strokeWidth="2" />
      <ellipse cx="12" cy="36" rx="9" ry="11" fill="#fef08a" />
      <circle cx="20" cy="18" r="12" fill="url(#dragonGrad)" stroke="#047857" strokeWidth="2" />
      <circle cx="17" cy="15" r="2.5" fill="#1e293b" />
      <circle cx="16" cy="14" r="0.8" fill="white" />
      <path d="M 23 18 C 29 18, 30 24, 23 24" fill="url(#dragonGrad)" stroke="#047857" strokeWidth="2" />
      <path d="M 3 30 C -8 24, -3 12, 3 20" fill="#60a5fa" stroke="#2563eb" strokeWidth="1.5" />
      <path d="M 24 28 C 34 26, 36 18, 34 16" stroke="#10b981" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>

    <circle cx="25" cy="30" r="6" fill="#f59e0b" />
    <polygon points="25,27 26,29 28,29 26,30 27,32 25,31 23,32 24,30 22,29 24,29" fill="#ffffff" />
    <circle cx="235" cy="30" r="6" fill="#aa3bff" />
  </svg>
);

const WordForestIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 260 200" style={{ display: 'block' }}>
    <defs>
      <linearGradient id="forestSky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#d1fae5" />
        <stop offset="100%" stopColor="#ecfdf5" />
      </linearGradient>
      <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#b45309" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>
      <linearGradient id="leavesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
    </defs>
    
    <rect width="260" height="200" rx="20" fill="url(#forestSky)" />

    <polygon points="0,0 45,0 90,200 0,200" fill="#ffffff" opacity="0.25" />
    <polygon points="80,0 130,0 190,200 120,200" fill="#ffffff" opacity="0.25" />

    <path d="M 0 160 Q 130 145 260 160 L 260 200 L 0 200 Z" fill="#a7f3d0" />
    <path d="M 0 175 Q 130 165 260 175 L 260 200 L 0 200 Z" fill="#6ee7b7" />

    <text x="25" y="75" fill="#ef4444" fontSize="28" fontWeight="900" fontFamily="'Fredoka', sans-serif" transform="rotate(-10 25 75)">A</text>
    <text x="65" y="105" fill="#3b82f6" fontSize="28" fontWeight="900" fontFamily="'Fredoka', sans-serif" transform="rotate(8 65 105)">B</text>
    <text x="210" y="75" fill="#10b981" fontSize="28" fontWeight="900" fontFamily="'Fredoka', sans-serif" transform="rotate(15 210 75)">C</text>
    <text x="180" y="110" fill="#f59e0b" fontSize="28" fontWeight="900" fontFamily="'Fredoka', sans-serif" transform="rotate(-12 180 110)">C</text>

    <path d="M 115 120 L 145 120 L 155 180 L 105 180 Z" fill="url(#trunkGrad)" stroke="#78350f" strokeWidth="2.5" />
    <path d="M 115 130 Q 90 110 80 100" stroke="url(#trunkGrad)" strokeWidth="8" fill="none" strokeLinecap="round" />
    <path d="M 145 130 Q 175 115 190 115" stroke="url(#trunkGrad)" strokeWidth="8" fill="none" strokeLinecap="round" />

    <circle cx="130" cy="70" r="45" fill="url(#leavesGrad)" stroke="#065f46" strokeWidth="2.5" />
    <circle cx="95" cy="80" r="35" fill="url(#leavesGrad)" stroke="#065f46" strokeWidth="2.5" />
    <circle cx="165" cy="80" r="35" fill="url(#leavesGrad)" stroke="#065f46" strokeWidth="2.5" />
    <circle cx="130" cy="45" r="30" fill="url(#leavesGrad)" stroke="#065f46" strokeWidth="2.5" />

    <g transform="translate(100, 60)">
      <rect x="5" y="18" width="50" height="35" rx="4" fill="#d97706" stroke="#78350f" strokeWidth="2.5" />
      <line x1="5" y1="28" x2="55" y2="28" stroke="#78350f" strokeWidth="1.5" />
      <line x1="5" y1="38" x2="55" y2="38" stroke="#78350f" strokeWidth="1.5" />
      <rect x="22" y="27" width="16" height="26" rx="4" fill="#7c2d12" />
      <circle cx="12" cy="27" r="5" fill="#fef08a" stroke="#78350f" strokeWidth="1.5" />
      
      <path d="M 27 53 L 27 90 M 33 53 L 33 90" stroke="#b45309" strokeWidth="2" />
      <line x1="27" y1="60" x2="33" y2="60" stroke="#b45309" strokeWidth="2" />
      <line x1="27" y1="70" x2="33" y2="70" stroke="#b45309" strokeWidth="2" />
      <line x1="27" y1="80" x2="33" y2="80" stroke="#b45309" strokeWidth="2" />

      <polygon points="0,20 30,-5 60,20" fill="#f43f5e" stroke="#be123c" strokeWidth="2.5" />
      <rect x="42" y="0" width="8" height="15" fill="#b91c1c" />
      <path d="M 40 0 L 52 0" stroke="#be123c" strokeWidth="2.5" />
    </g>

    <g transform="translate(182, 85)">
      <ellipse cx="12" cy="16" rx="10" ry="12" fill="#b45309" stroke="#78350f" strokeWidth="2" />
      <ellipse cx="12" cy="18" rx="6" ry="8" fill="#fef3c7" />
      <circle cx="8" cy="12" r="3.5" fill="#ffffff" stroke="#78350f" strokeWidth="1" />
      <circle cx="8" cy="12" r="1.5" fill="#000000" />
      <circle cx="16" cy="12" r="3.5" fill="#ffffff" stroke="#78350f" strokeWidth="1" />
      <circle cx="16" cy="12" r="1.5" fill="#000000" />
      <polygon points="12,13 14,15 12,17" fill="#f59e0b" />
      <polygon points="4,7 7,10 5,12" fill="#b45309" />
      <polygon points="20,7 17,10 19,12" fill="#b45309" />
    </g>

    <circle cx="235" cy="30" r="6" fill="#f59e0b" />
    <circle cx="25" cy="30" r="6" fill="#0ea5e9" />
  </svg>
);

const INITIAL_QUESTION_DB: Question[] = [
  // Math - Grade K (Kindergarten)
  { id: 'm5_1', subject: 'math', grade: 'K', difficulty: 'easy', topic: 'addition', questionText: 'What is 3 + 2?', options: ['4', '5', '6', '3'], answer: '5', emoji: '🍎', hint: 'Let\'s count the apples!' },
  { id: 'm5_2', subject: 'math', grade: 'K', difficulty: 'medium', topic: 'addition', questionText: 'What is 4 + 2?', options: ['5', '6', '7', '4'], answer: '6', emoji: '🍎', hint: 'Count all the red apples together!' },
  { id: 'm5_3', subject: 'math', grade: 'K', difficulty: 'hard', topic: 'subtraction', questionText: 'What is 5 - 2?', options: ['2', '3', '4', '1'], answer: '3', emoji: '⭐', hint: 'Look at the stars. If you cross out 2, how many are left?' },
  
  // Math - Grade 1
  { id: 'm5_4', subject: 'math', grade: '1', difficulty: 'easy', topic: 'subtraction', questionText: 'What is 3 - 1?', options: ['2', '3', '1', '4'], answer: '2', emoji: '⭐', hint: 'Take away 1 star!' },
  { id: 'm5_5', subject: 'math', grade: '1', difficulty: 'medium', topic: 'addition', questionText: 'What is 2 + 1?', options: ['3', '4', '2', '5'], answer: '3', emoji: '🍎', hint: 'Super easy addition!' },
  { id: 'm7_1', subject: 'math', grade: '1', difficulty: 'hard', topic: 'addition', questionText: 'What is 12 + 5?', options: ['15', '17', '18', '16'], answer: '17', emoji: '💎', hint: 'Solve the double digit math!' },
  
  // Math - Grade 2
  { id: 'm7_2', subject: 'math', grade: '2', difficulty: 'easy', topic: 'subtraction', questionText: 'What is 15 - 6?', options: ['8', '9', '7', '10'], answer: '9', emoji: '🎈', hint: 'Count backwards from 15!' },
  { id: 'm7_3', subject: 'math', grade: '2', difficulty: 'medium', topic: 'patterns', questionText: 'Complete the pattern: 2, 4, 6, [?]', options: ['7', '8', '9', '10'], answer: '8', emoji: '🔢', hint: 'Skip counting by 2!' },
  { id: 'm7_4', subject: 'math', grade: '2', difficulty: 'hard', topic: 'patterns', questionText: 'Complete the pattern: 5, 10, 15, [?]', options: ['18', '20', '25', '30'], answer: '20', emoji: '🔢', hint: 'Skip counting by 5!' },
  
  // Math - Grade 3
  { id: 'm7_5', subject: 'math', grade: '3', difficulty: 'easy', topic: 'subtraction', questionText: 'What is 20 - 8?', options: ['10', '12', '14', '11'], answer: '12', emoji: '💎', hint: 'Subtract 8 from 20!' },
  { id: 'm9_1', subject: 'math', grade: '3', difficulty: 'medium', topic: 'multiplication', questionText: 'What is 6 x 7?', options: ['36', '42', '48', '40'], answer: '42', emoji: '⚔️', hint: 'Climb the castle by multiplying 6 by 7!' },
  { id: 'm9_2', subject: 'math', grade: '3', difficulty: 'hard', topic: 'multiplication', questionText: 'What is 9 x 8?', options: ['72', '81', '64', '80'], answer: '72', emoji: '⚔️', hint: 'Do you know your 9 times tables?' },
  
  // Math - Grade 4
  { id: 'm9_3', subject: 'math', grade: '4', difficulty: 'easy', topic: 'subtraction', questionText: 'What is 100 - 35?', options: ['60', '65', '55', '75'], answer: '65', emoji: '💎', hint: 'Subtract 35 from 100!' },
  { id: 'm9_4', subject: 'math', grade: '4', difficulty: 'medium', topic: 'division', questionText: 'What is 45 ÷ 5?', options: ['8', '9', '7', '10'], answer: '9', emoji: '🏰', hint: 'Find what number multiplied by 5 equals 45!' },
  { id: 'm9_5', subject: 'math', grade: '4', difficulty: 'hard', topic: 'patterns', questionText: 'Complete the pattern: 1, 3, 9, [?]', options: ['12', '27', '18', '21'], answer: '27', emoji: '🔢', hint: 'Multiply each number by 3 to find the next!' },

  // Reading - Grade K (Kindergarten)
  { id: 'r5_1', subject: 'reading', grade: 'K', difficulty: 'easy', topic: 'spelling', questionText: 'Help spell the word: C _ T', options: ['A', 'E', 'I', 'O'], answer: 'A', emoji: '🐱', hint: 'A furry pet that meows!' },
  { id: 'r5_2', subject: 'reading', grade: 'K', difficulty: 'medium', topic: 'spelling', questionText: 'Help spell the word: F _ O G', options: ['O', 'A', 'I', 'E'], answer: 'O', emoji: '🐸', hint: 'A green animal that jumps!' },
  { id: 'r5_3', subject: 'reading', grade: 'K', difficulty: 'hard', topic: 'vocabulary', questionText: 'Look at the picture! What is this?', options: ['Apple', 'Banana', 'Cherry', 'Pear'], answer: 'Apple', emoji: '🍎', hint: 'A red crunchy fruit!' },
  
  // Reading - Grade 1
  { id: 'r5_4', subject: 'reading', grade: '1', difficulty: 'easy', topic: 'vocabulary', questionText: 'Look at the picture! What is this?', options: ['Car', 'Train', 'Plane', 'Bike'], answer: 'Car', emoji: '🚗', hint: 'Vroom vroom!' },
  { id: 'r5_5', subject: 'reading', grade: '1', difficulty: 'medium', topic: 'spelling', questionText: 'Help spell the word: D _ G', options: ['O', 'A', 'U', 'I'], answer: 'O', emoji: '🐶', hint: 'A pet that barks!' },
  { id: 'r7_1', subject: 'reading', grade: '1', difficulty: 'hard', topic: 'spelling', questionText: 'Help spell the word: B _ R D', options: ['I', 'R', 'E', 'O'], answer: 'I', emoji: '🐦', hint: 'A colorful animal that flies!' },
  
  // Reading - Grade 2
  { id: 'r7_2', subject: 'reading', grade: '2', difficulty: 'easy', topic: 'spelling', questionText: 'Help spell the word: L _ O N', options: ['I', 'O', 'A', 'E'], answer: 'I', emoji: '🦁', hint: 'The king of the jungle!' },
  { id: 'r7_3', subject: 'reading', grade: '2', difficulty: 'medium', topic: 'phonics', questionText: 'Listen to Kiko say the word, then select it!', options: ['Jumping', 'Running', 'Sleeping', 'Eating'], answer: 'Jumping', hint: 'Can you find the word jumping?' },
  { id: 'r7_4', subject: 'reading', grade: '2', difficulty: 'hard', topic: 'phonics', questionText: 'Listen to Kiko say the word, then select it!', options: ['Reading', 'Writing', 'Talking', 'Singing'], answer: 'Reading', hint: 'Can you find the word reading?' },
  
  // Reading - Grade 3
  { id: 'r7_5', subject: 'reading', grade: '3', difficulty: 'easy', topic: 'vocabulary', questionText: 'Look at the picture! What is this?', options: ['Teddy', 'Doll', 'Robot', 'Ball'], answer: 'Teddy', emoji: '🧸', hint: 'A soft cuddle bear!' },
  { 
    id: 'r9_1', 
    subject: 'reading', 
    grade: '3',
    difficulty: 'medium',
    topic: 'comprehension',
    paragraph: 'The blue whale is the largest animal in the world. It lives in the ocean and eats tiny shrimp called krill.',
    questionText: 'What does the blue whale eat?', 
    options: ['Krill', 'Fish', 'Seaweed', 'Jellyfish'], 
    answer: 'Krill', 
    emoji: '🐋', 
    hint: 'Read carefully about what they eat in the ocean!' 
  },
  { 
    id: 'r9_2', 
    subject: 'reading', 
    grade: '3',
    difficulty: 'hard',
    topic: 'comprehension',
    paragraph: 'Trees are the lungs of our Earth. They clean the air by breathing in carbon dioxide and breathing out clean oxygen.',
    questionText: 'What do trees breathe out?', 
    options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'], 
    answer: 'Oxygen', 
    emoji: '🌳', 
    hint: 'Read about what clean air trees breathe out!' 
  },
  
  // Reading - Grade 4
  { 
    id: 'r9_3', 
    subject: 'reading', 
    grade: '4',
    difficulty: 'easy',
    topic: 'comprehension',
    paragraph: 'Astronauts float in space because there is zero gravity. They wear heavy space suits to breathe and stay safe.',
    questionText: 'Why do astronauts float in space?', 
    options: ['Zero gravity', 'No air', 'Heavy suits', 'Rocket speed'], 
    answer: 'Zero gravity', 
    emoji: '👨‍🚀', 
    hint: 'Look for why they float in the text!' 
  },
  { 
    id: 'r9_4', 
    subject: 'reading', 
    grade: '4',
    difficulty: 'medium',
    topic: 'spelling',
    questionText: 'Select the correct spelling of the word:', 
    options: ['Beautiful', 'Beatiful', 'Beautifull', 'Butiful'], 
    answer: 'Beautiful', 
    emoji: '🌸', 
    hint: 'Which spelling looks exactly correct?' 
  },
  { 
    id: 'r9_5', 
    subject: 'reading', 
    grade: '4',
    difficulty: 'hard',
    topic: 'vocabulary',
    questionText: 'Select the word that means the opposite of "Huge":', 
    options: ['Tiny', 'Giant', 'Large', 'Heavy'], 
    answer: 'Tiny', 
    emoji: '🐜', 
    hint: 'Opposite of very big!' 
  }
];

const INITIAL_STUDENTS_DB: StudentStats[] = [
  { name: 'Emma', age: 5, grade: 'Kindergarten', xp: 340, stars: 24, streak: 4, mathSolved: 5, readingSolved: 3, badges: ['Letter Scout'], mathStreak: 0, readingStreak: 0, currentMathDiff: 'medium', currentReadingDiff: 'medium' },
  { name: 'Sophia', age: 6, grade: 'Grade 1', xp: 820, stars: 40, streak: 7, mathSolved: 8, readingSolved: 6, badges: ['Addition Squire', 'Letter Scout'], mathStreak: 0, readingStreak: 0, currentMathDiff: 'medium', currentReadingDiff: 'medium' },
  { name: 'Leo', age: 7, grade: 'Grade 2', xp: 4750, stars: 98, streak: 12, mathSolved: 12, readingSolved: 9, badges: ['Math Novice', 'Math Defender', 'Spelling Ranger'], mathStreak: 0, readingStreak: 0, currentMathDiff: 'medium', currentReadingDiff: 'medium' },
  { name: 'Sam', age: 9, grade: 'Grade 4', xp: 1250, stars: 65, streak: 8, mathSolved: 10, readingSolved: 8, badges: ['Math Knight', 'Word Ranger'], mathStreak: 0, readingStreak: 0, currentMathDiff: 'medium', currentReadingDiff: 'medium' }
];

export default function App() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
  const isDev = import.meta.env.DEV;
  const isPWA = isStandalone || isDev;

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'home' | 'math' | 'reading' | 'progress' | 'admin'>(() => {
    if (window.location.pathname === '/admin') {
      return 'admin';
    }
    return 'home';
  });
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  
  const [questionDb, setQuestionDb] = useState<Question[]>(INITIAL_QUESTION_DB);
  const [studentsDb, setStudentsDb] = useState<StudentStats[]>(INITIAL_STUDENTS_DB);

  const [stats, setStats] = useState<StudentStats>({
    name: '',
    age: 7,
    grade: '',
    xp: 0,
    stars: 0,
    streak: 1,
    mathSolved: 0,
    readingSolved: 0,
    badges: [],
    mathStreak: 0,
    readingStreak: 0,
    currentMathDiff: 'medium',
    currentReadingDiff: 'medium'
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [mascotText, setMascotText] = useState<string>(() => {
    if (window.location.pathname === '/admin') {
      if (isStandalone || isDev) {
        return "Welcome Admin! Here you can add new lessons and track how all children are progressing! 🛠️";
      } else {
        return "Oops! Secure area! 🔐 The Admin Portal is only for teachers and parents!";
      }
    }
    return "Welcome to KidsEdu! 🌟";
  });

  // Track viewport sizes for iOS responsive layout
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen to popstate event to synchronize activeTab and pathname
  useEffect(() => {
    const handleLocationChange = () => {
      if (window.location.pathname === '/admin') {
        setActiveTab('admin');
      } else {
        setActiveTab('home');
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const handleLogin = ({ name, age, grade }: { name: string; age: number; grade: string }) => {
    if (name.toLowerCase() === 'leo') {
      const leoData = INITIAL_STUDENTS_DB.find(s => s.name === 'Leo')!;
      setStats({
        name: 'Leo',
        age: age,
        grade: grade,
        xp: leoData.xp,
        stars: leoData.stars,
        streak: leoData.streak,
        mathSolved: leoData.mathSolved,
        readingSolved: leoData.readingSolved,
        badges: leoData.badges,
        mathStreak: leoData.mathStreak,
        readingStreak: leoData.readingStreak,
        currentMathDiff: leoData.currentMathDiff,
        currentReadingDiff: leoData.currentReadingDiff
      });
    } else {
      const existing = studentsDb.find(s => s.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        setStats({
          name: existing.name,
          age: existing.age,
          grade: existing.grade,
          xp: existing.xp,
          stars: existing.stars,
          streak: existing.streak,
          mathSolved: existing.mathSolved,
          readingSolved: existing.readingSolved,
          badges: existing.badges,
          mathStreak: existing.mathStreak,
          readingStreak: existing.readingStreak,
          currentMathDiff: existing.currentMathDiff,
          currentReadingDiff: existing.currentReadingDiff
        });
      } else {
        const newStudent: StudentStats = {
          name, age, grade,
          xp: 0, stars: 0, streak: 1,
          mathSolved: 0, readingSolved: 0, badges: [],
          mathStreak: 0, readingStreak: 0,
          currentMathDiff: 'medium', currentReadingDiff: 'medium'
        };
        setStudentsDb(prev => [...prev, newStudent]);
        setStats(newStudent);
      }
    }
    setIsLoggedIn(true);
    setMascotText(`Nice to meet you, ${name}! Let's select an adventure below to start learning! 🚀`);
  };

  const handleUpdateStats = (updates: any) => {
    setStats((prev) => {
      const newBadges = [...prev.badges];
      if (updates.badgeUnlocked && !newBadges.includes(updates.badgeUnlocked)) {
        newBadges.push(updates.badgeUnlocked);
      }
      return {
        ...prev,
        xp: prev.xp + (updates.xp || 0),
        stars: prev.stars + (updates.stars || 0),
        mathSolved: prev.mathSolved + (updates.mathSolved || 0),
        readingSolved: prev.readingSolved + (updates.readingSolved || 0),
        badges: newBadges,
        mathStreak: updates.mathStreak !== undefined ? updates.mathStreak : prev.mathStreak,
        readingStreak: updates.readingStreak !== undefined ? updates.readingStreak : prev.readingStreak,
        currentMathDiff: updates.currentMathDiff !== undefined ? updates.currentMathDiff : prev.currentMathDiff,
        currentReadingDiff: updates.currentReadingDiff !== undefined ? updates.currentReadingDiff : prev.currentReadingDiff
      };
    });
  };

  const handleToggleMute = () => {
    const muted = audioSynth.toggleMute();
    setIsMuted(muted);
    if (muted) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  };

  const navigateTo = (tab: 'home' | 'math' | 'reading' | 'progress' | 'admin') => {
    audioSynth.playClick();
    setActiveTab(tab);
    if (tab === 'admin') {
      window.history.pushState({}, '', '/admin');
      if (isPWA) {
        setMascotText("Welcome Admin! Here you can add new lessons and track how all children are progressing! 🛠️");
      } else {
        setMascotText("Oops! Secure area! 🔐 The Admin Portal is only for teachers and parents!");
      }
    } else {
      window.history.pushState({}, '', '/');
      if (tab === 'home') {
        setMascotText("Welcome back to your dashboard! Which adventure shall we choose today? 🌟");
      } else if (tab === 'math') {
        setMascotText("Welcome to the Math Castle! Let's climb towers by solving math puzzles! 🏰");
      } else if (tab === 'reading') {
        setMascotText("Welcome to the Word Forest! Help the forest animals by spelling words! 🌳");
      } else if (tab === 'progress') {
        setMascotText("Look at all your achievements and stars! You're doing amazing! 🏆");
      }
    }
  };

  const currentLevel = Math.floor(stats.xp / 500) + 1; 
  const xpInCurrentLevel = ((stats.xp % 500) / 500) * 100;

  const showAdmin = activeTab === 'admin';

  if (!isLoggedIn && !showAdmin) {
    return (
      <div style={{ display: 'flex', width: '100vw', minHeight: '100vh', justifyContent: 'center', alignItems: 'center' }}>
        <Login onLogin={handleLogin} setMascotText={setMascotText} />
        <Mascot text={mascotText} isMuted={isMuted} onToggleMute={handleToggleMute} />
      </div>
    );
  }

  return (
    <div className={`app-layout ${isMobile ? 'mobile-view' : ''}`}>
      {/* Sidebar - Desktop Only */}
      {!isMobile && (
        <aside className="floating-sidebar">
          <div className="sidebar-logo">
            <span>Kids</span>
            <br />
            <span>Edu</span>
          </div>

          <nav className="sidebar-menu">
            {isLoggedIn ? (
              <>
                <button 
                  onClick={() => navigateTo('home')} 
                  className={`sidebar-item ${activeTab === 'home' ? 'sidebar-item-active' : ''}`}
                >
                  <Home size={24} />
                  <span>Home</span>
                </button>
                
                <button 
                  onClick={() => navigateTo('math')} 
                  className={`sidebar-item ${activeTab === 'math' ? 'sidebar-item-active' : ''}`}
                >
                  <Castle size={24} />
                  <span>Games</span>
                </button>

                <button 
                  onClick={() => navigateTo('progress')} 
                  className={`sidebar-item ${activeTab === 'progress' ? 'sidebar-item-active' : ''}`}
                >
                  <Award size={24} />
                  <span>Progress</span>
                </button>
              </>
            ) : (
              <button 
                onClick={() => navigateTo('home')} 
                className="sidebar-item"
              >
                <Home size={24} />
                <span>Student Login</span>
              </button>
            )}

            {isPWA && !isLoggedIn && (
              <button 
                onClick={() => navigateTo('admin')} 
                className={`sidebar-item ${activeTab === 'admin' ? 'sidebar-item-active' : ''}`}
                style={{ marginTop: '24px', borderTop: '2px dashed #cbd5e1', paddingTop: '16px', height: '80px' }}
              >
                <Wrench size={24} color="#aa3bff" />
                <span style={{ color: '#aa3bff' }}>Admin</span>
              </button>
            )}
          </nav>
        </aside>
      )}

      {/* Main Panel Wrapper */}
      <div style={{ ...styles.mainWrapper, paddingLeft: isMobile ? '0' : '130px' }}>
        {/* Floating Top Stats Headers */}
        {activeTab !== 'admin' && isLoggedIn && (
          <div className="top-stats-container" style={{ padding: isMobile ? '16px 16px 10px' : '24px 40px 10px' }}>
          {/* Profile Card */}
          <div className="profile-widget" style={{ width: isMobile ? '100%' : '320px' }}>
            <div className="profile-avatar-box">👦</div>
            <div className="profile-info">
              <div className="profile-name-row">
                <span className="profile-name">{stats.name}</span>
                <span className="level-indicator">{currentLevel}</span>
              </div>
              <div className="xp-container">
                <span>{stats.xp} XP • {stats.grade}</span>
                <div className="xp-bar-bg">
                  <div className="xp-bar-fill" style={{ width: `${xpInCurrentLevel}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats & Streak Card */}
          <div className="stats-widget" style={{ width: isMobile ? '100%' : '340px' }}>
            <div className="stats-values-row">
              <div className="stat-item" style={{ color: '#b45309' }}>
                <Star size={20} fill="#f59e0b" color="#f59e0b" />
                <span>Points: {stats.xp.toLocaleString()} XP</span>
              </div>
              <div className="stat-item" style={{ color: '#b91c1c' }}>
                <Flame size={20} fill="#ef4444" color="#ef4444" />
                <span>Streak: {stats.streak} Days</span>
              </div>
            </div>
            <div className="streak-bar-bg">
              <div className="streak-bar-fill" style={{ width: `${Math.min((stats.streak / 20) * 100, 100)}%` }}></div>
            </div>
          </div>
        </div>
      )}

        {/* Central Workspace */}
        <main style={{ 
          ...styles.mainContent, 
          padding: isMobile ? '10px 16px 120px' : '10px 40px 40px',
        }}>
          {activeTab === 'home' && (
            <div style={styles.homeDashboard}>
              <h1 style={styles.dashboardTitle}>Dashboard</h1>
              
              <div style={styles.dashboardGrid}>
                {/* Math Castle Card */}
                <div className="game-card-mockup math-border anim-pop" style={{ width: isMobile ? '100%' : '320px' }}>
                  <div className="illustration-box">
                    <MathCastleIllustration />
                  </div>
                  <h2 className="bubble-title-math">Math Castle</h2>
                  <div className="card-level-text">Level {stats.mathSolved}</div>
                  <button 
                    onClick={() => navigateTo('math')} 
                    className="btn-kids btn-play-math anim-breathe"
                    style={{ width: '170px' }}
                  >
                    Play Now!
                  </button>
                </div>

                {/* Word Forest Card */}
                <div className="game-card-mockup reading-border anim-pop" style={{ animationDelay: '0.1s', width: isMobile ? '100%' : '320px' }}>
                  <div className="illustration-box reading-bg">
                    <WordForestIllustration />
                  </div>
                  <h2 className="bubble-title-reading">Word Forest</h2>
                  <div className="card-level-text">Level {stats.readingSolved}</div>
                  <button 
                    onClick={() => navigateTo('reading')} 
                    className="btn-kids btn-play-reading anim-breathe"
                    style={{ width: '170px' }}
                  >
                    Play Now!
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'math' && (
            <MathCastle 
              userStats={stats} 
              onUpdateStats={handleUpdateStats} 
              setMascotText={setMascotText} 
              questionDb={questionDb}
            />
          )}

          {activeTab === 'reading' && (
            <WordForest 
              userStats={stats} 
              onUpdateStats={handleUpdateStats} 
              setMascotText={setMascotText} 
              questionDb={questionDb}
            />
          )}

          {activeTab === 'progress' && (
            <ProgressDashboard 
              stats={stats} 
              setMascotText={setMascotText} 
            />
          )}

          {activeTab === 'admin' && (
            isPWA ? (
              <AdminPortal 
                questionDb={questionDb} 
                setQuestionDb={setQuestionDb} 
                studentsDb={studentsDb} 
                activeStudent={stats}
              />
            ) : (
              <div style={styles.restrictedContainer} className="glass-panel anim-pop">
                <div style={styles.lockIcon} className="anim-bounce">🔐</div>
                <h1 style={styles.restrictedTitle}>Restricted Access</h1>
                <p style={styles.restrictedText}>
                  The Admin Portal is only accessible when running the installed **KidsEdu** Progressive Web App (PWA) or in local development.
                </p>
                <div style={styles.restrictedHint}>
                  <strong>To access this page:</strong>
                  <br />
                  1. Click the install button in your browser address bar to install **KidsEdu**.
                  <br />
                  2. Launch the app from your home screen or applications menu.
                </div>
                <button onClick={() => navigateTo('home')} className="btn-kids btn-kids-secondary" style={{ marginTop: '16px' }}>
                  Return to Dashboard
                </button>
              </div>
            )
          )}
        </main>
      </div>

      {/* Floating Bottom Nav Bar - Mobile Only */}
      {isMobile && (
        <nav className="mobile-tab-bar">
          {isLoggedIn ? (
            <>
              <button 
                onClick={() => navigateTo('home')} 
                className={`mobile-tab-item ${activeTab === 'home' ? 'mobile-tab-item-active' : ''}`}
              >
                <Home size={22} />
                <span>Home</span>
              </button>

              <button 
                onClick={() => navigateTo('math')} 
                className={`mobile-tab-item ${activeTab === 'math' ? 'mobile-tab-item-active' : ''}`}
              >
                <Castle size={22} />
                <span>Games</span>
              </button>

              <button 
                onClick={() => navigateTo('progress')} 
                className={`mobile-tab-item ${activeTab === 'progress' ? 'mobile-tab-item-active' : ''}`}
              >
                <Award size={22} />
                <span>Progress</span>
              </button>
            </>
          ) : (
            <button 
              onClick={() => navigateTo('home')} 
              className={`mobile-tab-item ${activeTab === 'home' ? 'mobile-tab-item-active' : ''}`}
            >
              <Home size={22} />
              <span>Login</span>
            </button>
          )}

          {isPWA && !isLoggedIn && (
            <button 
              onClick={() => navigateTo('admin')} 
              className={`mobile-tab-item ${activeTab === 'admin' ? 'mobile-tab-item-active' : ''}`}
            >
              <Wrench size={22} />
              <span>Admin</span>
            </button>
          )}
        </nav>
      )}

      {/* Mascot Narrator */}
      <Mascot 
        text={mascotText} 
        isMuted={isMuted} 
        onToggleMute={handleToggleMute} 
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  mainWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    height: '100vh',
    position: 'relative',
    boxSizing: 'border-box'
  },
  mainContent: {
    flex: 1,
    boxSizing: 'border-box'
  },
  homeDashboard: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '900px',
    margin: '0 auto',
  },
  dashboardTitle: {
    fontFamily: "'Fredoka', sans-serif",
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: '20px',
    textAlign: 'left',
  },
  dashboardGrid: {
    display: 'flex',
    gap: '40px',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginTop: '10px',
  },
  restrictedContainer: {
    maxWidth: '500px',
    margin: '40px auto',
    padding: '40px 32px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    borderRadius: '24px',
    border: '3px solid #f87171',
    backgroundColor: '#fffbeb',
  },
  lockIcon: {
    fontSize: '4.5rem',
    marginBottom: '8px',
  },
  restrictedTitle: {
    fontFamily: "'Fredoka', sans-serif",
    fontSize: '2.2rem',
    fontWeight: '800',
    color: '#dc2626',
  },
  restrictedText: {
    fontSize: '1.1rem',
    color: '#475569',
    lineHeight: '1.6',
    fontWeight: '600',
  },
  restrictedHint: {
    fontSize: '0.9rem',
    color: '#64748b',
    lineHeight: '1.6',
    textAlign: 'left',
    backgroundColor: '#ffffff',
    padding: '16px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    width: '100%',
    boxSizing: 'border-box',
  }
};
