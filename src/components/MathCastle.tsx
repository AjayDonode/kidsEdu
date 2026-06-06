import React, { useState, useEffect } from 'react';
import { Trophy, Star, ArrowRight, RefreshCw } from 'lucide-react';
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

interface MathCastleProps {
  userStats: StudentStats;
  onUpdateStats: (updates: any) => void;
  setMascotText: (text: string) => void;
  questionDb: Question[];
}

export default function MathCastle({ userStats, onUpdateStats, setMascotText, questionDb }: MathCastleProps) {
  const [level, setLevel] = useState<number>(1); // 1: Addition, 2: Subtraction, 3: Advanced
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [levelCompleted, setLevelCompleted] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);

  // Track indices of original set placed in subtraction negative/trash bucket
  const [trashedIndices, setTrashedIndices] = useState<number[]>([]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropToTrash = (e: React.DragEvent) => {
    e.preventDefault();
    const indexStr = e.dataTransfer.getData("text/plain");
    if (indexStr === "") return;
    const index = parseInt(indexStr);
    
    if (!trashedIndices.includes(index)) {
      const num2 = currentQuestion?.num2 || 0;
      const emoji = currentQuestion?.emoji || 'items';
      const emojiText = isImage(emoji) ? 'items' : emoji;
      const newTrashed = [...trashedIndices, index];
      setTrashedIndices(newTrashed);
      audioSynth.playClick();
      
      const count = newTrashed.length;
      if (count === num2) {
        setMascotText(`Great job! You subtracted exactly ${num2} ${emojiText}! Count how many are left and choose the answer! ⭐`);
      } else if (count > num2) {
        setMascotText(`Oops, you put too many ${emojiText} in the trash! Put some back by clicking on the trash bin.`);
      } else {
        setMascotText(`Nice! Drag ${num2 - count} more ${emojiText} to the trash!`);
      }
    }
  };

  const handleRemoveFromTrash = (index: number) => {
    const newTrashed = trashedIndices.filter(i => i !== index);
    setTrashedIndices(newTrashed);
    audioSynth.playClick();
    
    const num2 = currentQuestion?.num2 || 0;
    const emoji = currentQuestion?.emoji || 'items';
    const emojiText = isImage(emoji) ? 'items' : emoji;
    const count = newTrashed.length;
    if (count === num2) {
      setMascotText(`Perfect! You subtracted exactly ${num2} ${emojiText}! Count how many are left and select the answer! ⭐`);
    } else if (count < num2) {
      setMascotText(`Drag ${num2 - count} more ${emojiText} to the trash bin to subtract them!`);
    }
  };

  // Map student's verbose grade string to database code
  const getGradeCode = (g: string): 'K' | '1' | '2' | '3' | '4' => {
    if (g === 'Kindergarten') return 'K';
    if (g.includes('1')) return '1';
    if (g.includes('2')) return '2';
    if (g.includes('3')) return '3';
    return '4';
  };

  const gradeCode = getGradeCode(userStats.grade);

  // Get active tower list with adaptive difficulty filtering
  const getTowerQuestions = (towerLvl: number): Question[] => {
    // 1. Filter by subject, grade, and current difficulty
    let mathQs = questionDb.filter(
      q => q.subject === 'math' && 
      q.grade === gradeCode && 
      q.difficulty === userStats.currentMathDiff
    );

    // 2. If no questions match the current difficulty level, fallback to other difficulties
    if (mathQs.length === 0) {
      const diffs: ('easy' | 'medium' | 'hard')[] = ['medium', 'easy', 'hard'];
      for (const d of diffs) {
        mathQs = questionDb.filter(q => q.subject === 'math' && q.grade === gradeCode && q.difficulty === d);
        if (mathQs.length > 0) break;
      }
    }

    // 3. Fallback: if still empty, fetch any math questions in that grade
    if (mathQs.length === 0) {
      mathQs = questionDb.filter(q => q.subject === 'math' && q.grade === gradeCode);
    }
    
    // 4. Filter by Tower topic/types
    if (towerLvl === 1) {
      const filtered = mathQs.filter(q => q.topic === 'addition' || q.questionText.includes('+'));
      return filtered.length > 0 ? filtered : mathQs;
    } else if (towerLvl === 2) {
      const filtered = mathQs.filter(q => q.topic === 'subtraction' || q.questionText.includes('-'));
      return filtered.length > 0 ? filtered : mathQs;
    } else {
      const filtered = mathQs.filter(q => q.topic === 'patterns' || q.topic === 'multiplication' || q.topic === 'division' || q.questionText.includes('x') || q.questionText.includes('÷') || q.questionText.toLowerCase().includes('pattern'));
      return filtered.length > 0 ? filtered : mathQs;
    }
  };

  const towerQuestions = getTowerQuestions(level);

  const loadQuestion = (idx: number): void => {
    setTrashedIndices([]);
    
    if (towerQuestions.length === 0) {
      const fallback = {
        questionText: `What is ${level * 2} + 2?`,
        options: [String(level * 2 + 2), String(level * 2 + 3), String(level * 2 + 1), '5'],
        answer: String(level * 2 + 2),
        emoji: '🍎',
        hint: 'Let\'s count together!'
      };
      setCurrentQuestion({ ...fallback, visualItems: [], num1: level * 2, symbol: '+', num2: 2 });
      setMascotText(fallback.questionText);
      return;
    }

    const q = towerQuestions[idx % towerQuestions.length];
    
    // Parse visual items
    let visualItems: any[] = [];
    let num1 = 0;
    let symbol = '';
    let num2 = 0;
    const match = q.questionText.match(/(\d+)\s*([\+\-\*x\/÷])\s*(\d+)/);
    
    if (match) {
      num1 = parseInt(match[1]);
      symbol = match[2];
      num2 = parseInt(match[3]);
      
      visualItems = [
        { type: 'item1', count: num1, emoji: q.emoji || '🍎' },
        { type: 'symbol', isSymbol: true, emoji: symbol === 'x' || symbol === '*' ? '✖️' : symbol === '-' ? '➖' : symbol === '÷' ? '➗' : '➕' },
        { type: 'item2', count: num2, emoji: symbol === '-' ? '✖️' : q.emoji || '🍎' }
      ];
    } else if (q.questionText.toLowerCase().includes('pattern')) {
      const numbers = q.questionText.match(/\d+/g);
      if (numbers) {
        const sequence = [...numbers.map(n => parseInt(n)), '?'];
        visualItems = [{ type: 'pattern', sequence }];
      }
    }

    setCurrentQuestion({
      ...q,
      num1,
      symbol,
      num2,
      visualItems
    });
    
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setLevelCompleted(false);

    if (symbol === '-') {
      const emojiText = isImage(q.emoji) ? 'items' : (q.emoji || 'items');
      setMascotText(`Subtraction! Drag ${num2} ${emojiText} to the trash bin to subtract them!`);
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

    let nextStreak = userStats.mathStreak || 0;
    let nextDiff = userStats.currentMathDiff || 'medium';

    if (correct) {
      audioSynth.playCorrect();
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.8 }
      });
      
      const praises = ["Incredible! 🌟", "Awesome arithmetic! 🚀", "Correct! You got it! 🎉", "You are a math genius! 🧙‍♂️"];
      const randomPraise = praises[Math.floor(Math.random() * praises.length)];
      
      nextStreak += 1;
      if (nextStreak >= 2) {
        nextStreak = 0;
        if (nextDiff === 'easy') nextDiff = 'medium';
        else if (nextDiff === 'medium') nextDiff = 'hard';
      }

      setMascotText(`${randomPraise} The answer is indeed ${currentQuestion.answer}!`);
      
      onUpdateStats({
        xp: 15,
        stars: 1,
        mathSolved: 1,
        mathStreak: nextStreak,
        currentMathDiff: nextDiff
      });
    } else {
      audioSynth.playIncorrect();
      setShake(true);
      setTimeout(() => setShake(false), 500);
      
      nextStreak = 0;
      if (nextDiff === 'hard') nextDiff = 'medium';
      else if (nextDiff === 'medium') nextDiff = 'easy';

      setMascotText(`Oops, not quite! Let's practice with ${nextDiff} questions. Kiko is helping you count! 💖`);
      
      onUpdateStats({
        mathStreak: 0,
        currentMathDiff: nextDiff
      });
    }
  };

  const handleNextClick = (): void => {
    audioSynth.playClick();
    
    const maxQs = Math.min(QUESTIONS_PER_LEVEL, towerQuestions.length || QUESTIONS_PER_LEVEL);
    
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
        badgeUnlocked: level === 1 ? 'Math Novice' : level === 2 ? 'Math Defender' : 'Math Knight'
      });

      setMascotText(`Hooray! You conquered Castle Tower ${level}! You earned a shiny trophy and star bonuses! 🏰🏆`);
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

  if (!currentQuestion) return null;

  const totalQuestionsToShow = Math.min(QUESTIONS_PER_LEVEL, towerQuestions.length || QUESTIONS_PER_LEVEL);

  return (
    <div style={styles.container} className="anim-pop">
      {/* Title Panel */}
      <div style={styles.titlePanel} className="glass-panel">
        <h2 style={styles.titleText}>🏰 Math Castle</h2>
        <p style={styles.subtitleText}>Solve math operations suited for Age {userStats.age} ({userStats.grade})</p>
        
        {/* Tower Selector */}
        <div style={styles.towerSelector}>
          {[1, 2, 3].map((lvl) => (
            <button
              key={lvl}
              onClick={() => selectLevel(lvl)}
              className="btn-kids"
              style={{
                ...styles.towerButton,
                backgroundColor: level === lvl ? '#0ea5e9' : '#ffffff',
                color: level === lvl ? '#ffffff' : '#0ea5e9',
                boxShadow: level === lvl ? '0 6px 0 #0284c7' : '0 6px 0 #e2e8f0',
                border: level === lvl ? 'none' : '2px solid #e2e8f0'
              }}
            >
              Tower {lvl}: {lvl === 1 ? '➕ Addition' : lvl === 2 ? '➖ Subtraction' : '🔢 Advanced'}
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
              <Trophy size={80} color="#f59e0b" fill="#fef3c7" />
            </div>
            <h1 style={styles.completeTitle}>Tower Completed!</h1>
            <p style={styles.completeDesc}>You solved all calculations in Tower {level}! Kiko is super proud of you! ✨</p>
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
                  className="btn-kids btn-kids-math"
                  style={styles.actionBtn}
                >
                  Next Tower <ArrowRight size={20} />
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

            {/* Question Text */}
            <h2 style={styles.questionText}>{currentQuestion.questionText}</h2>

            {/* Visual counting aids */}
            <div style={styles.visualAidContainer}>
              {currentQuestion.symbol === '-' ? (
                <div style={styles.subtractionArena}>
                  {/* Original Items Box */}
                  <div style={styles.subtractionBox}>
                    <h4 style={styles.boxTitle}>Original Set ({currentQuestion.num1} {isImage(currentQuestion.emoji) ? '' : (currentQuestion.emoji || '🍎')})</h4>
                    <div style={styles.itemsRow}>
                      {Array.from({ length: currentQuestion.num1 }).map((_, idx) => {
                        const isTrashed = trashedIndices.includes(idx);
                        if (isTrashed) return null;
                        
                        return (
                          <div
                            key={idx}
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            className="math-visual-item anim-pop"
                            style={styles.draggableItem}
                            title="Drag me to the trash!"
                          >
                            {renderEmojiOrImage(currentQuestion.emoji || '🍎', '2.2rem')}
                          </div>
                        );
                      })}
                      {trashedIndices.length === currentQuestion.num1 && (
                        <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>All items removed!</span>
                      )}
                    </div>
                  </div>

                  {/* Subtraction Symbol */}
                  <div style={styles.symbolItem}>➖</div>

                  {/* Trash Bucket (Drop Zone) */}
                  <div 
                    onDragOver={handleDragOver}
                    onDrop={handleDropToTrash}
                    style={{
                      ...styles.trashBucket,
                      borderColor: trashedIndices.length === currentQuestion.num2 ? '#10b981' : '#ef4444',
                      backgroundColor: trashedIndices.length === currentQuestion.num2 ? '#ecfdf5' : '#fef2f2'
                    }}
                    className="glass-panel"
                  >
                    <span style={styles.trashTitle}>
                      🗑️ Trash Bucket (Subtract {currentQuestion.num2})
                    </span>
                    
                    <div style={styles.trashItemsRow}>
                      {trashedIndices.map((originalIdx) => (
                        <div 
                          key={originalIdx} 
                          onClick={() => handleRemoveFromTrash(originalIdx)}
                          style={styles.trashedItem}
                          className="math-visual-item anim-pop"
                          title="Click to put back!"
                        >
                          {renderEmojiOrImage(currentQuestion.emoji || '🍎', '2.2rem')}
                        </div>
                      ))}
                      {trashedIndices.length === 0 && (
                        <span style={styles.trashPlaceholder}>Drag items here!</span>
                      )}
                    </div>
                    
                    <span style={{
                      ...styles.trashCounter,
                      color: trashedIndices.length === currentQuestion.num2 ? '#047857' : '#b91c1c'
                    }}>
                      {trashedIndices.length} / {currentQuestion.num2} Removed
                    </span>
                  </div>
                </div>
              ) : (
                currentQuestion.visualItems && currentQuestion.visualItems.map((item: any, idx: number) => {
                  if (item.isSymbol) {
                    return (
                      <div key={idx} style={styles.symbolItem}>
                        {item.emoji}
                      </div>
                    );
                  }
                  
                  if (item.type === 'pattern') {
                    return (
                      <div key={idx} style={styles.patternContainer}>
                        {item.sequence.map((num: any, i: number) => (
                          <div 
                            key={i} 
                            style={{
                              ...styles.patternItem,
                              backgroundColor: num === '?' ? '#fee2e2' : '#e0f2fe',
                              borderColor: num === '?' ? '#ef4444' : '#0ea5e9'
                            }}
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                    );
                  }

                  // Apple/Star counts
                  const count = Math.min(item.count, 15);
                  return (
                    <div key={idx} className="math-item-grid" style={styles.gridAids}>
                      {count > 0 ? (
                        Array.from({ length: count }).map((_, itemIdx) => (
                          <div key={itemIdx} className="math-visual-item" style={{ animationDelay: `${itemIdx * 0.05}s` }}>
                            {renderEmojiOrImage(item.emoji, '2rem')}
                          </div>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>None</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Answer Options */}
            <div style={styles.optionsContainer}>
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

            {/* Correct/Incorrect alert notification */}
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
                  {isCorrect ? '🎉 Correct! Super job!' : '💡 Let Kiko help you count again!'}
                </span>
                
                <button 
                  onClick={handleNextClick} 
                  className="btn-kids btn-kids-math"
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
    color: '#0284c7',
    marginBottom: '8px'
  },
  subtitleText: {
    color: '#64748b',
    fontSize: '1.05rem',
    marginBottom: '16px'
  },
  towerSelector: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  towerButton: {
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
    backgroundColor: '#0ea5e9',
    borderRadius: '8px',
  },
  progressText: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#64748b'
  },
  questionText: {
    fontSize: '2.2rem',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: '24px'
  },
  visualAidContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
    marginBottom: '32px',
    width: '100%',
    flexWrap: 'wrap',
  },
  gridAids: {
    border: '3px dashed #93c5fd',
    borderRadius: '20px',
    padding: '12px 24px',
    backgroundColor: '#eff6ff',
    minWidth: '60px'
  },
  symbolItem: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#0ea5e9',
  },
  patternContainer: {
    display: 'flex',
    gap: '12px',
  },
  patternItem: {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    border: '3px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#1e293b',
  },
  optionsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    width: '100%',
    maxWidth: '440px',
    marginBottom: '24px'
  },
  optionBtn: {
    width: '100%',
    padding: '18px',
    fontSize: '1.75rem',
    fontWeight: '800',
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
    color: '#f59e0b',
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
  },
  subtractionArena: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    width: '100%',
    flexWrap: 'wrap',
  },
  subtractionBox: {
    border: '3px dashed #3b82f6',
    borderRadius: '24px',
    padding: '16px 20px',
    backgroundColor: '#eff6ff',
    minWidth: '220px',
    minHeight: '120px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    flex: 1,
  },
  boxTitle: {
    margin: 0,
    fontSize: '1rem',
    color: '#1d4ed8',
    fontWeight: '700',
  },
  itemsRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  draggableItem: {
    fontSize: '2.2rem',
    cursor: 'grab',
    userSelect: 'none',
    transition: 'transform 0.15s ease',
  },
  trashBucket: {
    border: '3px dashed',
    borderRadius: '24px',
    padding: '16px 20px',
    minWidth: '220px',
    minHeight: '120px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    flex: 1,
    transition: 'all 0.2s ease',
  },
  trashTitle: {
    fontSize: '0.95rem',
    fontWeight: '800',
    color: '#334155',
  },
  trashItemsRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    minHeight: '40px',
    width: '100%',
    alignItems: 'center',
  },
  trashedItem: {
    fontSize: '2.2rem',
    cursor: 'pointer',
    opacity: 0.8,
  },
  trashPlaceholder: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  trashCounter: {
    fontSize: '0.85rem',
    fontWeight: '800',
  }
};
