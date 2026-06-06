import React, { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

interface LoginProps {
  onLogin: (data: { name: string; age: number; grade: string }) => void;
  setMascotText: (text: string) => void;
}

// SVG Lion Mascot for Login Card
const LionMascot = ({ isTalking }: { isTalking: boolean }) => (
  <svg width="110" height="110" viewBox="0 0 110 110" style={{ display: 'block', margin: '0 auto 16px' }}>
    <defs>
      <linearGradient id="maneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#ea580c" />
      </linearGradient>
      <linearGradient id="faceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="100%" stopColor="#eab308" />
      </linearGradient>
    </defs>

    {/* Mane (Orange outer spikes) */}
    <g fill="url(#maneGrad)" stroke="#c2410c" strokeWidth="2.5">
      <circle cx="55" cy="55" r="44" />
      {/* Mane Spikes */}
      <path d="M 55 10 Q 55 0 65 8 Q 75 -2 80 8 Q 90 2 92 12 Q 102 10 100 20 Q 110 20 105 30 Q 112 35 106 45 Q 112 55 106 65 Q 112 75 105 85 Q 108 92 98 95 Q 98 105 88 102 Q 80 110 72 102 Q 65 110 55 102 Q 45 110 38 102 Q 30 110 22 102 Q 12 105 12 95 Q 2 92 5 85 Q -2 75 4 65 Q -2 55 4 45 Q -2 35 5 30 Q 0 20 10 20 Q 8 10 18 12 Q 20 2 30 8 Q 35 -2 45 8 Z" />
    </g>

    {/* Body / Shirt */}
    <path d="M 35 90 C 35 75 75 75 75 90 Z" fill="#0ea5e9" stroke="#0284c7" strokeWidth="2.5" />
    {/* Letter K */}
    <text x="50" y="88" fill="#ffffff" fontSize="12" fontWeight="900" fontFamily="'Fredoka', sans-serif">K</text>

    {/* Waving Paw */}
    <g transform="translate(18, 55) rotate(-30)" style={{ transformOrigin: '0 0', animation: 'wavePaw 2s ease-in-out infinite' }}>
      <path d="M -8 -8 C -15 -20 -2 -25 8 -12 C 12 -4 4 10 -8 -8 Z" fill="url(#maneGrad)" stroke="#c2410c" strokeWidth="2" />
      <circle cx="-1" cy="-10" r="3.5" fill="#f472b6" />
      <circle cx="-5" cy="-6" r="2" fill="#f472b6" />
      <circle cx="2" cy="-5" r="2" fill="#f472b6" />
    </g>

    {/* Ears */}
    <circle cx="32" cy="30" r="10" fill="url(#maneGrad)" stroke="#c2410c" strokeWidth="2.5" />
    <circle cx="32" cy="30" r="6" fill="#fef08a" />
    <circle cx="78" cy="30" r="10" fill="url(#maneGrad)" stroke="#c2410c" strokeWidth="2.5" />
    <circle cx="78" cy="30" r="6" fill="#fef08a" />

    {/* Face */}
    <circle cx="55" cy="55" r="32" fill="url(#faceGrad)" stroke="#c2410c" strokeWidth="2.5" />

    {/* Eyes */}
    <circle cx="45" cy="48" r="4.5" fill="#1e293b" />
    <circle cx="43" cy="46" r="1.5" fill="#ffffff" />
    <circle cx="65" cy="48" r="4.5" fill="#1e293b" />
    <circle cx="63" cy="46" r="1.5" fill="#ffffff" />

    {/* Cheeks */}
    <circle cx="37" cy="56" r="3" fill="#f472b6" opacity="0.6" />
    <circle cx="73" cy="56" r="3" fill="#f472b6" opacity="0.6" />

    {/* Snout */}
    <ellipse cx="55" cy="58" rx="8" ry="6" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
    <polygon points="53,54 57,54 55,57" fill="#1e293b" />

    {/* Mouth */}
    {isTalking ? (
      <path 
        d="M 51 61 Q 55 70, 59 61 Z" 
        fill="#be123c" 
        stroke="#be123c" 
        strokeWidth="1.5" 
        style={{
          transformOrigin: '55px 61px',
          animation: 'talkMouth 0.15s ease infinite alternate'
        }}
      />
    ) : (
      <path d="M 50 61 Q 55 64, 60 61" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
    )}
  </svg>
);

const AGE_CONFIGS = [
  { val: 5, color: '#ec4899', shadow: '#be185d', overlay: '⭐' },
  { val: 6, color: '#f97316', shadow: '#c2410c', overlay: '🐻' },
  { val: 7, color: '#eab308', shadow: '#a16207', overlay: '🐦' },
  { val: 8, color: '#22c55e', shadow: '#15803d', overlay: '🦒' },
  { val: 9, color: '#3b82f6', shadow: '#1d4ed8', overlay: '🐱' },
  { val: 10, color: '#a855f7', shadow: '#7e22ce', overlay: '🚀' }
];

export default function Login({ onLogin, setMascotText }: LoginProps) {
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<number>(7);
  const [grade, setGrade] = useState<string>('Grade 2');
  const [shake, setShake] = useState<boolean>(false);
  const [isTalking, setIsTalking] = useState<boolean>(false);

  useEffect(() => {
    setMascotText("Welcome to KidsEdu! Tell me your name, age, and grade so we can start our adventure! 🌟");
  }, []);

  useEffect(() => {
    const checkVoice = setInterval(() => {
      if ('speechSynthesis' in window) {
        setIsTalking(window.speechSynthesis.speaking);
      }
    }, 150);
    return () => clearInterval(checkVoice);
  }, []);

  const handleAgeClick = (selectedAge: number): void => {
    audioSynth.playClick();
    setAge(selectedAge);
    setMascotText(`Awesome! Age ${selectedAge} is a wonderful age to learn! 🎉`);
  };

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    audioSynth.playClick();
    setGrade(e.target.value);
    setMascotText(`Super! ${e.target.value} is going to be so much fun! 🎒`);
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!name.trim()) {
      audioSynth.playIncorrect();
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setMascotText("Oops! Don't forget to write your name in the card! ✏️");
      return;
    }

    audioSynth.playCorrect();
    onLogin({
      name: name.trim(),
      age: age,
      grade: grade
    });
  };

  return (
    <div style={styles.loginOverlay} className="anim-pop">
      <div 
        style={{ ...styles.loginCard, transform: shake ? 'translateX(10px)' : 'none' }} 
        className="glass-panel"
      >
        <div style={styles.avatarCircle}>
          <LionMascot isTalking={isTalking} />
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>What is your name?</label>
            <div style={styles.inputWrapper}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                maxLength={12}
                style={styles.textInput}
              />
              <Pencil size={20} color="#cbd5e1" style={styles.inputIcon} />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Select your Age</label>
            <div style={styles.ageRow}>
              {AGE_CONFIGS.map((cfg) => {
                const isSelected = age === cfg.val;
                return (
                  <button
                    key={cfg.val}
                    type="button"
                    onClick={() => handleAgeClick(cfg.val)}
                    style={{
                      ...styles.ageCircleButton,
                      backgroundColor: isSelected ? cfg.color : '#ffffff',
                      color: isSelected ? '#ffffff' : '#4f46e5',
                      borderColor: isSelected ? cfg.shadow : '#cbd5e1',
                      boxShadow: isSelected ? `0 5px 0 ${cfg.shadow}` : '0 5px 0 #cbd5e1',
                      transform: isSelected ? 'scale(1.08)' : 'scale(1)'
                    }}
                    className="anim-wiggle"
                  >
                    {cfg.val}
                    <span style={styles.ageOverlay}>{cfg.overlay}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>What grade are you in?</label>
            <div style={styles.inputWrapper}>
              <select
                value={grade}
                onChange={handleGradeChange}
                style={styles.selectInput}
              >
                <option value="Kindergarten">Kindergarten</option>
                <option value="Grade 1">Grade 1</option>
                <option value="Grade 2">Grade 2</option>
                <option value="Grade 3">Grade 3</option>
                <option value="Grade 4">Grade 4</option>
                <option value="Grade 5">Grade 5</option>
              </select>
              <span style={styles.selectIcon}>🏫</span>
            </div>
          </div>

          <button
            type="submit"
            className="btn-kids anim-breathe"
            style={styles.submitBtn}
          >
            Start Adventure!
            <span style={styles.starBadge}>⭐</span>
          </button>
        </form>
        
        <div style={styles.footerText}>Join the fun!</div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loginOverlay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '20px'
  },
  loginCard: {
    width: '100%',
    maxWidth: '430px',
    padding: '48px 32px 32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    border: '3px solid rgba(255,255,255,0.8)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
    borderRadius: '32px',
    position: 'relative'
  },
  avatarCircle: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    backgroundColor: '#f8fafc',
    border: '3.5px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
    overflow: 'visible',
    position: 'relative'
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    width: '100%'
  },
  label: {
    fontFamily: "'Fredoka', sans-serif",
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center'
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: '340px'
  },
  textInput: {
    fontFamily: "'Fredoka', sans-serif",
    width: '100%',
    padding: '12px 48px 12px 20px',
    borderRadius: '24px',
    border: '3px solid #f1f5f9',
    fontSize: '1.15rem',
    fontWeight: '700',
    outline: 'none',
    color: '#1e293b',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.02)',
    transition: 'border-color 0.2s',
  },
  inputIcon: {
    position: 'absolute',
    right: '18px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none'
  },
  ageRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    width: '100%',
    maxWidth: '340px',
    padding: '4px 0'
  },
  ageCircleButton: {
    fontFamily: "'Fredoka', sans-serif",
    height: '46px',
    width: '46px',
    borderRadius: '50%',
    border: '2px solid',
    fontSize: '1.35rem',
    fontWeight: '900',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  ageOverlay: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    fontSize: '1rem',
    pointerEvents: 'none'
  },
  selectInput: {
    fontFamily: "'Fredoka', sans-serif",
    width: '100%',
    padding: '12px 48px 12px 20px',
    borderRadius: '24px',
    border: '3px solid #f1f5f9',
    fontSize: '1.15rem',
    fontWeight: '700',
    outline: 'none',
    color: '#1e293b',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    textAlign: 'center',
    appearance: 'none',
    WebkitAppearance: 'none'
  },
  selectIcon: {
    position: 'absolute',
    right: '18px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '1.2rem',
    pointerEvents: 'none'
  },
  submitBtn: {
    background: 'linear-gradient(180deg, #a855f7 0%, #7e22ce 100%)',
    color: '#ffffff',
    boxShadow: '0 6px 0 #6b21a8, 0 10px 20px rgba(126, 34, 206, 0.25)',
    fontSize: '1.35rem',
    fontWeight: '900',
    padding: '14px',
    width: '100%',
    maxWidth: '340px',
    borderRadius: '24px',
    alignSelf: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.15s ease',
    textShadow: '0 2px 0 rgba(0,0,0,0.15)'
  },
  starBadge: {
    fontSize: '1.3rem',
  },
  footerText: {
    marginTop: '20px',
    fontFamily: "'Fredoka', sans-serif",
    fontWeight: '800',
    fontSize: '1rem',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  }
};
