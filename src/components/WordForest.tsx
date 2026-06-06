import React, { useState, useEffect } from 'react';
import { Trophy, Star, ArrowRight, RefreshCw, Volume2 } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';
import type { StudentStats, Question } from '../types';
import confetti from 'canvas-confetti';

const QUESTIONS_PER_LEVEL = 5;

const isImage = (str?: string): boolean => {
  if (!str) return false;
  return str.startsWith('data:image/') || str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/');
};

const renderEmojiOrImage = (emojiStr: string, size: string = '2.2rem', style?: React.CSSProperties) => {
  if (isImage(emojiStr)) {
    return (
      <img 
        src={emojiStr} 
        alt="graphic" 
        style={{ 
          width: size, 
          height: size, 
          objectFit: 'contain',
          display: 'inline-block',
          verticalAlign: 'middle',
          ...style 
        }} 
      />
    );
  }
  return <span style={{ fontSize: size, display: 'inline-block', verticalAlign: 'middle' }}>{emojiStr}</span>;
};

interface WordForestProps {
  userStats: StudentStats;
  onUpdateStats: (updates: any) => void;
  setMascotText: (text: string) => void;
  questionDb: Question[];
}

export default function WordForest({ userStats, onUpdateStats, setMascotText, questionDb }: WordForestProps) {
  const [level, setLevel] = useState<number>(1); // 1: Spelling, 2: Pictures, 3: Phonics
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [levelCompleted, setLevelCompleted] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);

  // Map student's verbose grade string to database code
  const getGradeCode = (g: string): 'K' | '1' | '2' | '3' | '4' => {
    if (g === 'Kindergarten') return 'K';
    if (g.includes('1')) return '1';
    if (g.includes('2')) return '2';
    if (g.includes('3')) return '3';
    return '4';
  };

  const gradeCode = getGradeCode(userStats.grade);

  const getForestQuestions = (forestLvl: number): Question[] => {
    // 1. Filter by subject, grade, and current difficulty
    let readingQs = questionDb.filter(
      q => q.subject === 'reading' && 
      q.grade === gradeCode && 
      q.difficulty === userStats.currentReadingDiff
    );

    // 2. Fallback: if no questions match the current difficulty level, try fallback difficulties
    if (readingQs.length === 0) {
      const diffs: ('easy' | 'medium' | 'hard')[] = ['medium', 'easy', 'hard'];
      for (const d of diffs) {
        readingQs = questionDb.filter(q => q.subject === 'reading' && q.grade === gradeCode && q.difficulty === d);
        if (readingQs.length > 0) break;
      }
    }

    // 3. Fallback: if still empty, fetch any reading questions in that grade
    if (readingQs.length === 0) {
      readingQs = questionDb.filter(q => q.subject === 'reading' && q.grade === gradeCode);
    }
    
    // 4. Filter by Level topics
    if (forestLvl === 1) {
      const filtered = readingQs.filter(q => q.questionText.includes('_') || q.topic === 'spelling');
      return filtered.length > 0 ? filtered : readingQs;
    } else if (forestLvl === 2) {
      const filtered = readingQs.filter(q => q.questionText.toLowerCase().includes('picture') || q.topic === 'vocabulary');
      return filtered.length > 0 ? filtered : readingQs;
    } else {
      const filtered = readingQs.filter(q => q.paragraph !== undefined || q.questionText.toLowerCase().includes('listen') || q.topic === 'phonics' || q.topic === 'comprehension');
      return filtered.length > 0 ? filtered : readingQs;
    }
  };

  const forestQuestions = getForestQuestions(level);

  const loadQuestion = (idx: number): void => {
    if (forestQuestions.length === 0) {
      const fallback = {
        id: 'fallback_r',
        questionText: 'Which word starts with the letter F?',
        options: ['Frog', 'Dog', 'Cat', 'Bird'],
        answer: 'Frog',
        emoji: '🐸',
        hint: 'Say the word: Frog!'
      };
      setCurrentQuestion({ ...fallback, type: 'vocab' });
      setMascotText(fallback.hint);
      return;
    }

    const q = forestQuestions[idx % forestQuestions.length];
    
    let type = 'vocab';
    if (q.questionText.includes('_')) {
      type = 'spelling';
    } else if (q.questionText.toLowerCase().includes('listen')) {
      type = 'phonics';
    } else if (q.paragraph) {
      type = 'paragraph';
    }

    setCurrentQuestion({
      ...q,
      type
    });

    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setLevelCompleted(false);

    if (type === 'phonics') {
      setMascotText(`Can you select the word: ${q.answer}?`);
    } else if (type === 'paragraph') {
      setMascotText(`Read the story carefully and answer Kiko's question: ${q.questionText}`);
    } else {
      setMascotText(q.hint || q.questionText);
    }
  };

  useEffect(() => {
    loadQuestion(questionIndex);
  }, [level, questionIndex, questionDb]);

  const handleAnswerClick = (option: string): void => {
    if (isAnswered) return;
    
    setSelectedAnswer(option);
    setIsAnswered(true);
    
    const correct = String(option).trim() === String(currentQuestion.answer).trim();
    setIsCorrect(correct);

    let nextStreak = userStats.readingStreak || 0;
    let nextDiff = userStats.currentReadingDiff || 'medium';

    if (correct) {
      audioSynth.playCorrect();
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.8 }
      });
      
      let praise = '';
      if (currentQuestion.type === 'spelling') {
        praise = `Splendid spelling! You spelled it correctly! ✏️`;
      } else if (currentQuestion.type === 'vocab') {
        praise = `Spot on! Yes, that is a ${currentQuestion.answer}! 🌟`;
      } else if (currentQuestion.type === 'paragraph') {
        praise = `Excellent reading! You found the correct detail in the story! 📖`;
      } else {
        praise = `Super listening! Yes, the word was ${currentQuestion.answer}! 👂`;
      }

      nextStreak += 1;
      if (nextStreak >= 2) {
        nextStreak = 0;
        if (nextDiff === 'easy') nextDiff = 'medium';
        else if (nextDiff === 'medium') nextDiff = 'hard';
      }

      setMascotText(`${praise} Let's continue!`);
      
      onUpdateStats({
        xp: 15,
        stars: 1,
        readingSolved: 1,
        readingStreak: nextStreak,
        currentReadingDiff: nextDiff
      });
    } else {
      audioSynth.playIncorrect();
      setShake(true);
      setTimeout(() => setShake(false), 500);

      nextStreak = 0;
      if (nextDiff === 'hard') nextDiff = 'medium';
      else if (nextDiff === 'medium') nextDiff = 'easy';

      setMascotText(`Oops, not quite! Let's practice reading with ${nextDiff} questions. You can do it! 💖`);
      
      onUpdateStats({
        readingStreak: 0,
        currentReadingDiff: nextDiff
      });
    }
  };

  const handleNextClick = (): void => {
    audioSynth.playClick();
    
    const maxQs = Math.min(QUESTIONS_PER_LEVEL, forestQuestions.length || QUESTIONS_PER_LEVEL);

    if (questionIndex < maxQs - 1) {
      setQuestionIndex(prev => prev + 1);
    } else {
      setLevelCompleted(true);
      audioSynth.playLevelUp();
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 }
      });

      onUpdateStats({
        xp: 50,
        stars: 5,
        badgeUnlocked: level === 1 ? 'Spelling Ranger' : level === 2 ? 'Word Scout' : 'Word Ninja'
      });

      setMascotText(`Hooray! You completed Word Forest Level ${level}! You are a reading champion! 🌳📖🏆`);
    }
  };

  const resetLevel = (): void => {
    audioSynth.playClick();
    setQuestionIndex(0);
    setLevelCompleted(false);
    loadQuestion(0);
  };

  const selectLevel = (newLvl: number): void => {
    audioSynth.playClick();
    setLevel(newLvl);
    setQuestionIndex(0);
    setLevelCompleted(false);
  };

  const playVoiceAgain = (): void => {
    audioSynth.playClick();
    setMascotText(`Select the word: ${currentQuestion.answer}!`);
  };

  if (!currentQuestion) return null;

  const totalQuestionsToShow = Math.min(QUESTIONS_PER_LEVEL, forestQuestions.length || QUESTIONS_PER_LEVEL);

  return (
    <div style={styles.container} className="anim-pop">
      {/* Title Panel */}
      <div style={styles.titlePanel} className="glass-panel">
        <h2 style={styles.titleText}>🌳 Word Forest</h2>
        <p style={styles.subtitleText}>Learn vocabulary, spell, and read stories for Age {userStats.age}</p>
        
        {/* Level Selector */}
        <div style={styles.levelSelector}>
          {[1, 2, 3].map((lvl) => (
            <button
              key={lvl}
              onClick={() => selectLevel(lvl)}
              className="btn-kids"
              style={{
                ...styles.levelButton,
                backgroundColor: level === lvl ? '#10b981' : '#ffffff',
                color: level === lvl ? '#ffffff' : '#10b981',
                boxShadow: level === lvl ? '0 6px 0 #059669' : '0 6px 0 #e2e8f0',
                border: level === lvl ? 'none' : '2px solid #e2e8f0'
              }}
            >
              Forest {lvl}: {lvl === 1 ? '✏️ Spelling' : lvl === 2 ? '🖼️ Pictures' : '📖 Comprehension'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Game Screen */}
      <div style={{ ...styles.gameCard, transform: shake ? 'translateX(10px)' : 'none' }} className="glass-panel">
        {levelCompleted ? (
          /* Level Completed Splash */
          <div style={styles.completeSplash}>
            <div style={styles.trophyIcon} className="anim-bounce">
              <Trophy size={80} color="#10b981" fill="#d1fae5" />
            </div>
            <h1 style={styles.completeTitle}>Forest Level Completed!</h1>
            <p style={styles.completeDesc}>You solved all reading challenges in Forest {level}! You are ready to explore further! 🌿</p>
            
            <div style={styles.rewardsBox}>
              <div style={styles.rewardItem}>
                <span style={{ fontSize: '2rem' }}>💎</span>
                <span>+50 XP</span>
              </div>
              <div style={styles.rewardItem}>
                <Star size={32} color="#f59e0b" fill="#f59e0b" />
                <span>+5 Stars</span>
              </div>
            </div>
            
            <div style={styles.completeActions}>
              {level < 3 ? (
                <button 
                  onClick={() => selectLevel(level + 1)} 
                  className="btn-kids btn-kids-reading"
                  style={styles.actionBtn}
                >
                  Next Forest <ArrowRight size={20} />
                </button>
              ) : (
                <button 
                  onClick={resetLevel} 
                  className="btn-kids btn-kids-secondary"
                  style={styles.actionBtn}
                >
                  Play Again <RefreshCw size={20} />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Game Question Board */
          <>
            {/* Progress indicators */}
            <div style={styles.progressContainer}>
              <div style={styles.progressBarBg}>
                <div 
                  style={{ 
                    ...styles.progressBarFill, 
                    width: `${((questionIndex) / totalQuestionsToShow) * 100}%` 
                  }}
                ></div>
              </div>
              <span style={styles.progressText}>Question {questionIndex + 1} of {totalQuestionsToShow}</span>
            </div>

            {/* Paragraph story comprehension */}
            {currentQuestion.type === 'paragraph' && (
              <div style={styles.storyBox}>
                <span style={styles.storyIcon}>📖 Story Time</span>
                <p style={styles.storyText}>{currentQuestion.paragraph}</p>
              </div>
            )}

            {/* Question Title */}
            <h3 style={styles.questionTextTitle}>
              {currentQuestion.type === 'phonics' ? 'Listen carefully and choose the word!' : currentQuestion.questionText}
            </h3>

            {/* Interactive Area */}
            <div style={styles.displayArea}>
              {currentQuestion.type === 'spelling' && (
                <div style={styles.spellingLayout}>
                  <div style={styles.spellingEmoji} className="anim-float">{renderEmojiOrImage(currentQuestion.emoji || '🐱', '4.5rem')}</div>
                  
                  {/* Word Blank display */}
                  <div style={styles.wordBlankBox}>
                    {currentQuestion.questionText.split(' ').pop().split('').map((char: string, idx: number) => {
                      const isMissing = char === '_';
                      return (
                        <div 
                          key={idx} 
                          style={{
                            ...styles.blankChar,
                            borderBottom: '4px solid #10b981',
                            color: isMissing && selectedAnswer ? '#10b981' : '#1e293b',
                            backgroundColor: isMissing ? '#f0fdf4' : 'transparent',
                          }}
                        >
                          {isMissing 
                            ? (selectedAnswer || '?') 
                            : char
                          }
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentQuestion.type === 'vocab' && (
                <div style={styles.vocabLayout}>
                  <div style={styles.vocabEmoji} className="anim-bounce">{renderEmojiOrImage(currentQuestion.emoji || '🍎', '6rem')}</div>
                </div>
              )}

              {currentQuestion.type === 'phonics' && (
                <div style={styles.phonicsLayout}>
                  <div style={styles.listenMascotBox}>
                    <button 
                      onClick={playVoiceAgain}
                      className="btn-kids btn-kids-reading anim-breathe"
                      style={styles.listenBtn}
                    >
                      <Volume2 size={32} /> Listen
                    </button>
                    <p style={styles.phonicsInstruction}>Click to hear Kiko speak the word!</p>
                  </div>
                </div>
              )}
            </div>

            {/* Answer Options */}
            <div 
              style={{
                ...styles.optionsContainer,
                gridTemplateColumns: currentQuestion.options.length > 2 ? 'repeat(2, 1fr)' : '1fr'
              }}
            >
              {currentQuestion.options.map((option: string, idx: number) => {
                const isSelected = selectedAnswer === option;
                const isCorrectOption = String(option).trim() === String(currentQuestion.answer).trim();
                
                let btnStyle = { ...styles.optionBtn };
                if (isAnswered) {
                  if (isCorrectOption) {
                    btnStyle.backgroundColor = '#10b981';
                    btnStyle.color = '#ffffff';
                    btnStyle.boxShadow = '0 6px 0 #059669';
                  } else if (isSelected) {
                    btnStyle.backgroundColor = '#ef4444';
                    btnStyle.color = '#ffffff';
                    btnStyle.boxShadow = '0 6px 0 #dc2626';
                  } else {
                    btnStyle.opacity = 0.5;
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerClick(option)}
                    disabled={isAnswered}
                    className="btn-kids btn-kids-secondary anim-wiggle"
                    style={btnStyle}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {/* Feedback alert */}
            {isAnswered && (
              <div 
                style={{
                  ...styles.feedbackAlert,
                  backgroundColor: isCorrect ? '#ecfdf5' : '#fef2f2',
                  borderColor: isCorrect ? '#10b981' : '#ef4444'
                }}
                className="anim-pop"
              >
                <span style={{ ...styles.feedbackText, color: isCorrect ? '#065f46' : '#991b1b' }}>
                  {isCorrect ? '🎉 Correct! Super job!' : '💡 Let\'s try once more!'}
                </span>
                
                <button 
                  onClick={handleNextClick} 
                  className="btn-kids btn-kids-reading"
                  style={styles.nextBtn}
                >
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
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
  titlePanel: {
    padding: '24px',
    textAlign: 'center',
  },
  titleText: {
    fontSize: '2rem',
    color: '#059669',
    marginBottom: '8px'
  },
  subtitleText: {
    color: '#64748b',
    fontSize: '1.05rem',
    marginBottom: '16px'
  },
  levelSelector: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  levelButton: {
    padding: '10px 18px',
    fontSize: '0.95rem',
  },
  gameCard: {
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '400px',
    justifyContent: 'center',
  },
  progressContainer: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    gap: '16px'
  },
  progressBarBg: {
    flex: 1,
    height: '16px',
    backgroundColor: '#e2e8f0',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: '8px',
  },
  progressText: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#64748b'
  },
  storyBox: {
    width: '100%',
    padding: '16px 20px',
    borderRadius: '16px',
    backgroundColor: '#ecfdf5',
    border: '2px solid #a7f3d0',
    marginBottom: '20px',
    textAlign: 'left'
  },
  storyIcon: {
    fontWeight: '800',
    color: '#059669',
    fontSize: '0.9rem',
    display: 'block',
    marginBottom: '6px'
  },
  storyText: {
    fontSize: '1.05rem',
    color: '#1e293b',
    lineHeight: '1.6',
    fontWeight: '600'
  },
  questionTextTitle: {
    fontSize: '1.4rem',
    color: '#475569',
    textAlign: 'center',
    marginBottom: '20px',
    fontWeight: '700'
  },
  displayArea: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    marginBottom: '28px'
  },
  spellingLayout: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  spellingEmoji: {
    fontSize: '4.5rem',
  },
  wordBlankBox: {
    display: 'flex',
    gap: '16px',
    marginTop: '10px'
  },
  blankChar: {
    width: '50px',
    height: '60px',
    fontSize: '2.5rem',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px 8px 0 0',
  },
  vocabLayout: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vocabEmoji: {
    fontSize: '6rem',
  },
  phonicsLayout: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listenMascotBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },
  listenBtn: {
    padding: '16px 28px',
    fontSize: '1.25rem',
  },
  phonicsInstruction: {
    fontSize: '0.95rem',
    color: '#64748b',
    fontWeight: '600'
  },
  optionsContainer: {
    display: 'grid',
    gap: '16px',
    width: '100%',
    maxWidth: '480px',
    marginBottom: '24px'
  },
  optionBtn: {
    width: '100%',
    padding: '16px',
    fontSize: '1.35rem',
    fontWeight: '700',
  },
  feedbackAlert: {
    width: '100%',
    padding: '18px 24px',
    borderRadius: '20px',
    border: '3px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
  },
  feedbackText: {
    fontSize: '1.25rem',
    fontWeight: '700'
  },
  nextBtn: {
    padding: '10px 20px',
    fontSize: '1.05rem',
  },
  completeSplash: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '24px'
  },
  trophyIcon: {
    marginBottom: '16px'
  },
  completeTitle: {
    fontSize: '2.5rem',
    color: '#10b981',
    marginBottom: '8px'
  },
  completeDesc: {
    fontSize: '1.15rem',
    color: '#64748b',
    maxWidth: '500px',
    marginBottom: '24px'
  },
  rewardsBox: {
    display: 'flex',
    gap: '24px',
    marginBottom: '32px'
  },
  rewardItem: {
    backgroundColor: '#ffffff',
    padding: '12px 24px',
    borderRadius: '16px',
    border: '2px solid #cbd5e1',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1e293b'
  },
  completeActions: {
    display: 'flex',
    gap: '16px'
  },
  actionBtn: {
    padding: '12px 28px',
    fontSize: '1.1rem'
  }
};
