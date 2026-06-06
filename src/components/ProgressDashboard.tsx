import React from 'react';
import { Star, Flame, Trophy, Lock } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';
import type { StudentStats } from '../types';
import confetti from 'canvas-confetti';

interface ProgressDashboardProps {
  stats: StudentStats;
  setMascotText: (text: string) => void;
}

interface BadgeConfig {
  id: string;
  name: string;
  desc: string;
  icon: string;
  color: string;
  borderColor: string;
  requirement: (stats: StudentStats) => boolean;
}

const BADGES: BadgeConfig[] = [
  {
    id: 'math_1',
    name: 'Addition Squire',
    desc: 'Solve your first Math Castle challenge!',
    icon: '⚔️',
    color: '#bae6fd',
    borderColor: '#0284c7',
    requirement: (stats) => stats.mathSolved >= 1
  },
  {
    id: 'math_2',
    name: 'Math Knight',
    desc: 'Solve 5 Math Castle calculations!',
    icon: '🛡️',
    color: '#7dd3fc',
    borderColor: '#0284c7',
    requirement: (stats) => stats.mathSolved >= 5
  },
  {
    id: 'math_3',
    name: 'Math Conqueror',
    desc: 'Complete a Math Tower level!',
    icon: '🏰',
    color: '#38bdf8',
    borderColor: '#0284c7',
    requirement: (stats) => stats.badges.includes('Math Novice') || stats.badges.includes('Math Defender') || stats.badges.includes('Math Knight')
  },
  {
    id: 'read_1',
    name: 'Letter Scout',
    desc: 'Solve your first spelling challenge in Word Forest!',
    icon: '🌿',
    color: '#a7f3d0',
    borderColor: '#059669',
    requirement: (stats) => stats.readingSolved >= 1
  },
  {
    id: 'read_2',
    name: 'Word Ranger',
    desc: 'Solve 5 Word Forest reading challenges!',
    icon: '🏹',
    color: '#6ee7b7',
    borderColor: '#059669',
    requirement: (stats) => stats.readingSolved >= 5
  },
  {
    id: 'read_3',
    name: 'Word Ninja',
    desc: 'Complete a Word Forest level!',
    icon: '🥷',
    color: '#34d399',
    borderColor: '#059669',
    requirement: (stats) => stats.badges.includes('Spelling Ranger') || stats.badges.includes('Word Scout') || stats.badges.includes('Word Ninja')
  },
  {
    id: 'star_10',
    name: 'Star Collector',
    desc: 'Collect 10 or more Golden Stars!',
    icon: '⭐',
    color: '#fef08a',
    borderColor: '#d97706',
    requirement: (stats) => stats.stars >= 10
  },
  {
    id: 'streak_3',
    name: 'Super Streak',
    desc: 'Have a learning streak of 12 days or more!',
    icon: '🔥',
    color: '#fecaca',
    borderColor: '#dc2626',
    requirement: (stats) => stats.streak >= 12
  }
];

export default function ProgressDashboard({ stats, setMascotText }: ProgressDashboardProps) {
  const handleBadgeClick = (badge: BadgeConfig, unlocked: boolean): void => {
    audioSynth.playClick();
    if (unlocked) {
      audioSynth.playCorrect();
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.8 }
      });
      setMascotText(`Awesome! You unlocked the "${badge.name}" badge! ${badge.desc} Keep up the amazing work! 🏆✨`);
    } else {
      setMascotText(`You haven't unlocked "${badge.name}" yet. ${badge.desc} You can do it! 💪`);
    }
  };

  const getUnlockedCount = (): number => {
    return BADGES.filter(b => b.requirement(stats)).length;
  };

  return (
    <div style={styles.container} className="anim-pop">
      {/* Overview Cards */}
      <div style={styles.statsRow}>
        <div style={{ ...styles.statCard, borderBottom: '6px solid #e0f2fe' }} className="glass-panel">
          <span style={{ fontSize: '2.5rem' }}>💎</span>
          <div style={styles.statInfo}>
            <span style={styles.statLabel}>Total XP</span>
            <span style={styles.statVal}>{stats.xp} XP</span>
          </div>
        </div>

        <div style={{ ...styles.statCard, borderBottom: '6px solid #fef3c7' }} className="glass-panel">
          <Star size={40} color="#f59e0b" fill="#f59e0b" className="anim-bounce" />
          <div style={styles.statInfo}>
            <span style={styles.statLabel}>Stars Earned</span>
            <span style={styles.statVal}>{stats.stars} ⭐</span>
          </div>
        </div>

        <div style={{ ...styles.statCard, borderBottom: '6px solid #fee2e2' }} className="glass-panel">
          <Flame size={40} color="#ef4444" fill="#ef4444" className="anim-wiggle" />
          <div style={styles.statInfo}>
            <span style={styles.statLabel}>Daily Streak</span>
            <span style={styles.statVal}>{stats.streak} Days</span>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div style={styles.badgesPanel} className="glass-panel">
        <div style={styles.badgeHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={28} color="#f59e0b" />
            <h2 style={{ fontSize: '1.75rem', color: '#1e293b' }}>Your Achievements</h2>
          </div>
          <span style={styles.badgeCount}>
            {getUnlockedCount()} / {BADGES.length} Unlocked
          </span>
        </div>

        <p style={styles.badgesSubtitle}>Click on unlocked badges to celebrate your hard work!</p>

        <div style={styles.badgeGrid}>
          {BADGES.map((badge) => {
            const unlocked = badge.requirement(stats);
            return (
              <div
                key={badge.id}
                onClick={() => handleBadgeClick(badge, unlocked)}
                style={{
                  ...styles.badgeCard,
                  backgroundColor: unlocked ? badge.color : '#f1f5f9',
                  borderColor: unlocked ? badge.borderColor : '#cbd5e1',
                  opacity: unlocked ? 1 : 0.75,
                  cursor: 'pointer'
                }}
                className="anim-wiggle"
              >
                {!unlocked && (
                  <div style={styles.lockOverlay}>
                    <Lock size={16} color="#64748b" />
                  </div>
                )}
                
                <span style={styles.badgeIcon}>{badge.icon}</span>
                <span style={styles.badgeName}>{badge.name}</span>
                <span style={styles.badgeDesc}>{badge.desc}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Report */}
      <div style={styles.reportCard} className="glass-panel">
        <h2 style={{ fontSize: '1.5rem', color: '#4f46e5', marginBottom: '16px' }}>📝 Adventure Logs</h2>
        <div style={styles.logList}>
          <div style={styles.logItem}>
            <span>⚔️ Math Problems Solved:</span>
            <span style={styles.logVal}>{stats.mathSolved}</span>
          </div>
          <div style={styles.logItem}>
            <span>📚 Reading Problems Solved:</span>
            <span style={styles.logVal}>{stats.readingSolved}</span>
          </div>
          <div style={styles.logItem}>
            <span>🏆 Level Reached:</span>
            <span style={styles.logVal}>Level {Math.floor(stats.xp / 500) + 1}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    maxWidth: '800px',
    margin: '0 auto',
    paddingBottom: '100px'
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  statCard: {
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    borderRadius: '20px',
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: '600'
  },
  statVal: {
    fontSize: '1.35rem',
    fontWeight: '800',
    color: '#1e293b'
  },
  badgesPanel: {
    padding: '24px',
    borderRadius: '24px',
  },
  badgeHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  badgeCount: {
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: '700',
  },
  badgesSubtitle: {
    color: '#64748b',
    fontSize: '0.95rem',
    marginBottom: '20px',
  },
  badgeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
  },
  badgeCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '16px',
    borderRadius: '20px',
    border: '3px solid',
    position: 'relative',
    transition: 'all 0.15s ease',
  },
  lockOverlay: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #cbd5e1'
  },
  badgeIcon: {
    fontSize: '2.5rem',
    marginBottom: '8px',
  },
  badgeName: {
    fontSize: '0.95rem',
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: '4px',
  },
  badgeDesc: {
    fontSize: '0.75rem',
    color: '#475569',
    fontWeight: '600',
    lineHeight: '1.2'
  },
  reportCard: {
    padding: '24px',
    borderRadius: '24px',
  },
  logList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  logItem: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingBottom: '8px',
    borderBottom: '1.5px dashed #e2e8f0',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#475569'
  },
  logVal: {
    color: '#1e293b',
    fontWeight: '800'
  }
};
