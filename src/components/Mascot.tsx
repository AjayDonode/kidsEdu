import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

interface MascotProps {
  text: string;
  isMuted: boolean;
  onToggleMute: () => void;
}

export default function Mascot({ text, isMuted, onToggleMute }: MascotProps) {
  const [isTalking, setIsTalking] = useState<boolean>(false);

  // Narrate text aloud whenever it changes (if not muted)
  useEffect(() => {
    if (text) {
      speak(text);
    }
  }, [text]);

  const speak = (speechText: string): void => {
    if (isMuted) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.pitch = 1.4; // Slightly high-pitched, cute voice
      utterance.rate = 0.9;  // Slightly slower, clear for kids
      
      utterance.onstart = () => setIsTalking(true);
      utterance.onend = () => setIsTalking(false);
      utterance.onerror = () => setIsTalking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSpeakerClick = (): void => {
    audioSynth.playClick();
    if (isTalking) {
      window.speechSynthesis.cancel();
      setIsTalking(false);
    } else {
      speak(text);
    }
  };

  return (
    <div className="mascot-container" style={styles.container}>
      {/* Speech Bubble */}
      {text && (
        <div className="speech-bubble glass-panel anim-pop" style={styles.bubble}>
          <div style={styles.bubbleText}>{text}</div>
          <div style={styles.bubbleActions}>
            <button 
              onClick={handleSpeakerClick}
              style={{
                ...styles.soundButton,
                backgroundColor: isTalking ? '#c084fc' : '#e0e7ff',
                color: isTalking ? '#ffffff' : '#4f46e5'
              }}
              title="Listen to Kiko"
            >
              <Volume2 size={18} className={isTalking ? 'anim-wiggle' : ''} />
            </button>
            <button
              onClick={onToggleMute}
              style={{
                ...styles.soundButton,
                backgroundColor: isMuted ? '#fecaca' : '#f1f5f9',
                color: isMuted ? '#ef4444' : '#64748b'
              }}
              title={isMuted ? 'Unmute voice' : 'Mute voice'}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
          <div style={styles.bubbleTail}></div>
        </div>
      )}

      {/* Mascot Graphic */}
      <div 
        className="mascot-character anim-breathe" 
        style={styles.character}
        onClick={() => {
          audioSynth.playClick();
          speak("Hi! I'm Kiko, your learning buddy. Click on games to start our adventure!");
        }}
      >
        <img 
          src="/mascot.png" 
          alt="Kiko" 
          className={`mascot-img-png ${isTalking ? 'is-talking' : ''}`}
          style={{ 
            width: '130px', 
            height: '130px', 
            objectFit: 'contain',
            cursor: 'pointer' 
          }}
        />
      </div>

      {/* CSS Animation Overrides for Mascot PNG */}
      <style>{`
        .mascot-img-png {
          transition: transform 0.2s ease;
        }
        .is-talking {
          animation: talkWiggle 0.2s ease infinite alternate;
        }
        @keyframes talkWiggle {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.04) rotate(3deg); }
          100% { transform: scale(0.98) rotate(-3deg); }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    zIndex: 1000,
    pointerEvents: 'none',
  },
  bubble: {
    pointerEvents: 'auto',
    marginBottom: '8px',
    marginRight: '20px',
    padding: '16px 20px',
    maxWidth: '280px',
    borderRadius: '20px',
    position: 'relative',
    border: '3px solid #e0f2fe',
    boxShadow: '0 8px 24px rgba(56, 189, 248, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: '#ffffff',
  },
  bubbleText: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: '1.4',
  },
  bubbleActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },
  soundButton: {
    border: 'none',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  bubbleTail: {
    position: 'absolute',
    bottom: '-12px',
    right: '40px',
    width: '24px',
    height: '24px',
    backgroundColor: '#ffffff',
    borderBottom: '3px solid #e0f2fe',
    borderRight: '3px solid #e0f2fe',
    transform: 'rotate(45deg)',
    zIndex: -1,
  },
  character: {
    pointerEvents: 'auto',
    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.06))',
  }
};
