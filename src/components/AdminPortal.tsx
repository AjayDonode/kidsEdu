import React, { useState } from 'react';
import { Plus, Trash2, Users, BookOpen, TrendingUp } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';
import type { Question, StudentStats } from '../types';
import confetti from 'canvas-confetti';

const isImage = (str?: string): boolean => {
  if (!str) return false;
  return str.startsWith('data:image/') || str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/');
};

const POPULAR_EMOJIS = [
  '🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🥕', '🍕', '🍪', '🍰',
  '🦁', '🐯', '🐻', '🐼', '🐨', '🦊', '🐸', '🐵', '🐔', '🐧',
  '🦆', '🦉', '🐝', '🐞', '🦋', '🐟', '🐙', '🦖', '🚗', '✈️',
  '🎈', '🎁', '🎨', '📚', '✏️', '⭐️', '🌟', '🔥', '🏆', '🎯'
];

interface AdminPortalProps {
  questionDb: Question[];
  setQuestionDb: React.Dispatch<React.SetStateAction<Question[]>>;
  studentsDb: StudentStats[];
  activeStudent: StudentStats;
}

export default function AdminPortal({ questionDb, setQuestionDb, studentsDb, activeStudent }: AdminPortalProps) {
  const [adminTab, setAdminTab] = useState<'content' | 'students'>('content');
  const [selectedSubject, setSelectedSubject] = useState<'math' | 'reading'>('math');
  const [selectedGrade, setSelectedGrade] = useState<'K' | '1' | '2' | '3' | '4'>('K');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [topic, setTopic] = useState<string>('');
  const [questionText, setQuestionText] = useState<string>('');
  const [options, setOptions] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [emoji, setEmoji] = useState<string>('');
  const [hint, setHint] = useState<string>('');
  const [paragraph, setParagraph] = useState<string>('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file!');
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setEmoji(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRowDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleRowDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRowDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    // Get all questions matching current selected grade and subject
    const filteredQs = questionDb.filter(q => q.grade === selectedGrade && q.subject === selectedSubject);
    
    // Rearrange within the filtered list
    const updatedFiltered = [...filteredQs];
    const [draggedItem] = updatedFiltered.splice(draggedIndex, 1);
    updatedFiltered.splice(index, 0, draggedItem);
    
    // Merge back into global questionDb while keeping other grades/subjects' order intact
    let filteredIdx = 0;
    const newQuestionDb = questionDb.map(q => {
      if (q.grade === selectedGrade && q.subject === selectedSubject) {
        return updatedFiltered[filteredIdx++];
      }
      return q;
    });

    setQuestionDb(newQuestionDb);
    setDraggedIndex(null);
    audioSynth.playClick();
  };

  const handleRowDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleAddQuestion = (e: React.FormEvent): void => {
    e.preventDefault();
    audioSynth.playClick();

    if (!questionText || !options || !answer) {
      alert("Please fill in the question text, options, and the correct answer!");
      return;
    }

    const parsedOptions = options.split(',').map(opt => opt.trim());
    if (!parsedOptions.includes(answer.trim())) {
      alert("Error: The correct answer must be one of the comma-separated options!");
      return;
    }

    const newQuestion: Question = {
      id: `${selectedSubject}_${Date.now()}`,
      subject: selectedSubject,
      grade: selectedGrade,
      difficulty,
      topic: topic.trim() || (selectedSubject === 'math' ? 'addition' : 'spelling'),
      questionText: questionText.trim(),
      options: parsedOptions,
      answer: answer.trim(),
      emoji: emoji.trim() || undefined,
      hint: hint.trim() || undefined,
      paragraph: selectedSubject === 'reading' && paragraph.trim() ? paragraph.trim() : undefined
    };

    setQuestionDb(prev => [...prev, newQuestion]);

    // Reset Form
    setQuestionText('');
    setOptions('');
    setAnswer('');
    setEmoji('');
    setHint('');
    setParagraph('');
    setTopic('');
    setShowAddForm(false);
    setShowEmojiPicker(false);

    audioSynth.playCorrect();
    confetti({
      particleCount: 40,
      spread: 30,
      origin: { y: 0.8 }
    });
  };

  const handleDeleteQuestion = (id: string): void => {
    audioSynth.playClick();
    if (confirm("Are you sure you want to delete this question?")) {
      setQuestionDb(prev => prev.filter(q => q.id !== id));
    }
  };

  // Merge the active logged in student's stats into the class roster for rendering
  const allStudents = studentsDb.map(student => {
    if (student.name.toLowerCase() === activeStudent.name.toLowerCase()) {
      return {
        ...student,
        xp: activeStudent.xp,
        stars: activeStudent.stars,
        streak: activeStudent.streak,
        badges: activeStudent.badges,
        mathSolved: activeStudent.mathSolved,
        readingSolved: activeStudent.readingSolved,
        mathStreak: activeStudent.mathStreak,
        readingStreak: activeStudent.readingStreak,
        currentMathDiff: activeStudent.currentMathDiff,
        currentReadingDiff: activeStudent.currentReadingDiff
      };
    }
    return student;
  });

  return (
    <div style={styles.container} className="anim-pop">
      {/* Header Panel */}
      <div style={styles.headerPanel} className="glass-panel">
        <h2 style={styles.titleText}>🛠️ Admin Portal</h2>
        <p style={styles.subtitleText}>Manage age-wise curriculum material and track classroom progress.</p>
        
        {/* Tab Controls */}
        <div style={styles.tabsRow}>
          <button
            onClick={() => { audioSynth.playClick(); setAdminTab('content'); }}
            style={{
              ...styles.tabButton,
              backgroundColor: adminTab === 'content' ? '#4f46e5' : '#ffffff',
              color: adminTab === 'content' ? '#ffffff' : '#4f46e5',
              boxShadow: adminTab === 'content' ? '0 5px 0 #3730a3' : '0 5px 0 #cbd5e1',
            }}
            className="btn-kids"
          >
            <BookOpen size={18} /> Curriculum Manager
          </button>
          
          <button
            onClick={() => { audioSynth.playClick(); setAdminTab('students'); }}
            style={{
              ...styles.tabButton,
              backgroundColor: adminTab === 'students' ? '#4f46e5' : '#ffffff',
              color: adminTab === 'students' ? '#ffffff' : '#4f46e5',
              boxShadow: adminTab === 'students' ? '0 5px 0 #3730a3' : '0 5px 0 #cbd5e1',
            }}
            className="btn-kids"
          >
            <Users size={18} /> Student Tracker
          </button>
        </div>
      </div>

      {adminTab === 'content' ? (
        /* ==================== TAB 1: CURRICULUM MANAGER ==================== */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Global Grade & Subject Selector Bar */}
          <div style={styles.gradeSelectorBar} className="glass-panel">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <span style={styles.gradeBarLabel}>Scope Curriculum Grade Level:</span>
                <div style={styles.gradeButtonsRow}>
                  {(['K', '1', '2', '3', '4'] as const).map((g) => {
                    const isActive = selectedGrade === g;
                    const label = g === 'K' ? 'Kindergarten' : `Grade ${g}`;
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => { audioSynth.playClick(); setSelectedGrade(g); }}
                        style={{
                          ...styles.gradeSelectBtn,
                          backgroundColor: isActive ? '#4f46e5' : '#ffffff',
                          color: isActive ? '#ffffff' : '#4f46e5',
                          boxShadow: isActive ? '0 5px 0 #3730a3' : '0 5px 0 #cbd5e1',
                          border: isActive ? 'none' : '2px solid #cbd5e1',
                        }}
                        className="btn-kids"
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ borderTop: '1.5px dashed #cbd5e1', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <span style={styles.gradeBarLabel}>Scope Subject:</span>
                <div style={styles.gradeButtonsRow}>
                  {(['math', 'reading'] as const).map((sub) => {
                    const isActive = selectedSubject === sub;
                    const label = sub === 'math' ? '🏰 Math Castle' : '🌳 Word Forest';
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => { audioSynth.playClick(); setSelectedSubject(sub); }}
                        style={{
                          ...styles.gradeSelectBtn,
                          backgroundColor: isActive ? '#0284c7' : '#ffffff',
                          color: isActive ? '#ffffff' : '#0284c7',
                          boxShadow: isActive ? '0 5px 0 #0369a1' : '0 5px 0 #cbd5e1',
                          border: isActive ? 'none' : '2px solid #cbd5e1',
                        }}
                        className="btn-kids"
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Add Question Modal Overlay */}
          {showAddForm && (
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.45)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
              }}
              onClick={() => { audioSynth.playClick(); setShowAddForm(false); }}
              className="anim-pop"
            >
              <div 
                style={{
                  ...styles.formCard,
                  maxWidth: '520px',
                  width: '90%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  borderRadius: '24px',
                  border: '3px solid #e2e8f0',
                  position: 'relative',
                  padding: '32px',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => { audioSynth.playClick(); setShowAddForm(false); }}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: '#f1f5f9',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '1.1rem',
                    fontWeight: '800',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 0 #cbd5e1',
                  }}
                  className="btn-kids"
                  type="button"
                >
                  ✕
                </button>

                <h3 style={{ ...styles.sectionTitle, marginTop: 0 }}>Add New Question</h3>
                
                <form onSubmit={handleAddQuestion} style={styles.form}>
                  <div style={styles.row}>
                    {/* Target Subject (Scoped) */}
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Subject</label>
                      <div style={{
                        fontFamily: "'Fredoka', sans-serif",
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: '2px solid #cbd5e1',
                        fontSize: '0.95rem',
                        fontWeight: '700',
                        backgroundColor: '#f8fafc',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        height: '46px',
                        boxSizing: 'border-box'
                      }}>
                        {selectedSubject === 'math' ? '🏰 Math Castle' : '🌳 Word Forest'}
                      </div>
                    </div>
                    
                    {/* Target Grade (Scoped) */}
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Target Grade</label>
                      <div style={{
                        fontFamily: "'Fredoka', sans-serif",
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: '2px solid #cbd5e1',
                        fontSize: '0.95rem',
                        fontWeight: '700',
                        backgroundColor: '#f8fafc',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        height: '46px',
                        boxSizing: 'border-box'
                      }}>
                        {selectedGrade === 'K' ? 'Kindergarten' : `Grade ${selectedGrade}`}
                      </div>
                    </div>
                  </div>

                  <div style={styles.row}>
                    {/* Difficulty */}
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Difficulty</label>
                      <select 
                        value={difficulty} 
                        onChange={e => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')} 
                        style={styles.select}
                      >
                        <option value="easy">🟢 Easy</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="hard">🔴 Hard</option>
                      </select>
                    </div>

                    {/* Topic */}
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Topic / Category</label>
                      <input
                        type="text"
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        placeholder="e.g. addition, spelling, patterns"
                        style={styles.input}
                        required
                      />
                    </div>
                  </div>

                  {/* Reading Comprehension Paragraph (Conditional) */}
                  {selectedSubject === 'reading' && (selectedGrade === '3' || selectedGrade === '4') && (
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Story / Paragraph Content</label>
                      <textarea
                        value={paragraph}
                        onChange={e => setParagraph(e.target.value)}
                        placeholder="Enter short paragraph for child to read before answering question..."
                        style={styles.textarea}
                        rows={3}
                      />
                    </div>
                  )}

                  {/* Question Text */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      {selectedSubject === 'math' ? 'Equation / Calculation' : 'Spelling Blank or Question'}
                    </label>
                    <input
                      type="text"
                      value={questionText}
                      onChange={e => setQuestionText(e.target.value)}
                      placeholder={selectedSubject === 'math' ? 'e.g. 5 x 6 = ?' : 'e.g. F _ O G  or What color is the red hat?'}
                      style={styles.input}
                      required
                    />
                  </div>

                  {/* Options */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Answer Choices (Comma separated)</label>
                    <input
                      type="text"
                      value={options}
                      onChange={e => setOptions(e.target.value)}
                      placeholder="e.g. 20, 30, 25, 15"
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.row}>
                    {/* Correct Answer */}
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Correct Answer</label>
                      <input
                        type="text"
                        value={answer}
                        onChange={e => setAnswer(e.target.value)}
                        placeholder="Must match one option"
                        style={styles.input}
                        required
                      />
                    </div>

                    {/* Emoji Graphic or Image */}
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Emoji / Image (Optional)</label>
                      
                      {/* Selection Box / Trigger */}
                      <div 
                        onClick={() => { audioSynth.playClick(); setShowEmojiPicker(!showEmojiPicker); }}
                        style={{
                          border: '2px dashed #cbd5e1',
                          borderRadius: '16px',
                          padding: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          backgroundColor: '#f8fafc',
                          minHeight: '60px',
                          position: 'relative',
                          transition: 'all 0.15s ease',
                          borderColor: showEmojiPicker ? '#aa3bff' : '#cbd5e1'
                        }}
                        className="btn-kids"
                      >
                        {emoji ? (
                          isImage(emoji) ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <img
                                src={emoji}
                                alt="selected graphic"
                                style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px' }}
                              />
                              <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'bold' }}>Custom Image</span>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '2rem' }}>{emoji}</span>
                              <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'bold' }}>Selected Emoji</span>
                            </div>
                          )
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: '700' }}>
                            ❓ Click to choose Emoji or Upload Image
                          </span>
                        )}
                      </div>

                      {/* Picker Panel */}
                      {showEmojiPicker && (
                        <div 
                          style={{
                            marginTop: '8px',
                            padding: '16px',
                            backgroundColor: '#ffffff',
                            border: '2px solid #e2e8f0',
                            borderRadius: '16px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                          }}
                          className="anim-pop"
                        >
                          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>Select a Kid-Friendly Emoji:</span>
                          
                          {/* Emoji Grid */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(8, 1fr)',
                            gap: '8px',
                            maxHeight: '150px',
                            overflowY: 'auto',
                            paddingRight: '4px',
                          }}>
                            {POPULAR_EMOJIS.map((e) => (
                              <button
                                key={e}
                                type="button"
                                onClick={() => {
                                  audioSynth.playClick();
                                  setEmoji(e);
                                  setShowEmojiPicker(false);
                                }}
                                style={{
                                  fontSize: '1.6rem',
                                  padding: '4px',
                                  background: emoji === e ? '#f3e8ff' : 'transparent',
                                  border: emoji === e ? '2px solid #c084fc' : '2px solid transparent',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.1s ease',
                                }}
                                className="btn-kids"
                              >
                                {e}
                              </button>
                            ))}
                          </div>

                          <div style={{ borderTop: '1.5px dashed #e2e8f0', paddingTop: '12px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>Or use custom image:</span>
                            
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input
                                type="file"
                                accept="image/*"
                                id="admin-image-upload"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                              />
                              <label
                                htmlFor="admin-image-upload"
                                className="btn-kids"
                                style={{
                                  padding: '8px 14px',
                                  fontSize: '0.8rem',
                                  backgroundColor: '#f1f5f9',
                                  border: '2px solid #cbd5e1',
                                  cursor: 'pointer',
                                  borderRadius: '10px',
                                  fontWeight: '700',
                                  color: '#475569',
                                  userSelect: 'none'
                                }}
                                onClick={() => {
                                  audioSynth.playClick();
                                  setShowEmojiPicker(false);
                                }}
                              >
                                📁 Upload Image
                              </label>

                              {emoji && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    audioSynth.playClick();
                                    setEmoji('');
                                    setShowEmojiPicker(false);
                                  }}
                                  style={{
                                    background: '#fee2e2',
                                    color: '#ef4444',
                                    border: 'none',
                                    padding: '8px 14px',
                                    borderRadius: '10px',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    fontWeight: '700',
                                    boxShadow: '0 2px 0 #fca5a5'
                                  }}
                                  className="btn-kids"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Helper Hint */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Narration Hint (Optional)</label>
                    <input
                      type="text"
                      value={hint}
                      onChange={e => setHint(e.target.value)}
                      placeholder="e.g. Count the apples! or Help the frog cross the river!"
                      style={styles.input}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <button 
                      type="button" 
                      onClick={() => { audioSynth.playClick(); setShowAddForm(false); }}
                      className="btn-kids btn-kids-secondary" 
                      style={{ flex: 1, padding: '12px' }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn-kids btn-kids-primary" 
                      style={{ flex: 2, padding: '12px' }}
                    >
                      <Plus size={18} /> Add Question
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Database Questions List - 100% stretched panel */}
          <div style={{ width: '100%' }}>
            <div style={styles.listCard} className="glass-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h3 style={{ ...styles.sectionTitle, margin: 0 }}>
                    {selectedGrade === 'K' ? 'Kindergarten' : `Grade ${selectedGrade}`} {selectedSubject === 'math' ? 'Math' : 'Reading'} Curriculum ({questionDb.filter(q => q.grade === selectedGrade && q.subject === selectedSubject).length} items)
                  </h3>
                  <button
                    type="button"
                    onClick={() => { audioSynth.playClick(); setShowAddForm(true); }}
                    style={{
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 0 #059669',
                      fontSize: '1.25rem',
                      fontWeight: '800',
                      transition: 'all 0.1s ease',
                    }}
                    className="btn-kids anim-breathe"
                    title="Add New Question"
                  >
                    +
                  </button>
                </div>
                
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>
                  💡 Drag rows using ⋮⋮ handle to reorder questions
                </span>
              </div>
            
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.trHeader}>
                    <th style={{ ...styles.th, width: '40px' }}></th>
                    <th style={styles.th}>Difficulty</th>
                    <th style={styles.th}>Topic</th>
                    <th style={styles.th}>Question</th>
                    <th style={styles.th}>Choices</th>
                    <th style={styles.th}>Answer</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questionDb
                    .filter(q => q.grade === selectedGrade && q.subject === selectedSubject)
                    .map((q, index) => (
                    <tr 
                      key={q.id} 
                      style={{
                        ...styles.trBody,
                        cursor: draggedIndex === index ? 'grabbing' : 'default',
                        backgroundColor: draggedIndex === index ? '#f1f5f9' : 'transparent',
                        opacity: draggedIndex === index ? 0.5 : 1,
                        transition: 'all 0.15s ease'
                      }}
                      draggable
                      onDragStart={(e) => handleRowDragStart(e, index)}
                      onDragOver={handleRowDragOver}
                      onDrop={(e) => handleRowDrop(e, index)}
                      onDragEnd={handleRowDragEnd}
                    >
                      <td style={{ ...styles.td, color: '#94a3b8', cursor: 'grab', padding: '16px 8px 16px 16px', userSelect: 'none' }}>
                        ⋮⋮
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          backgroundColor: q.difficulty === 'easy' ? '#ecfdf5' : q.difficulty === 'medium' ? '#fffbeb' : '#fef2f2',
                          color: q.difficulty === 'easy' ? '#047857' : q.difficulty === 'medium' ? '#d97706' : '#b91c1c',
                        }}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td style={{ ...styles.td, fontSize: '0.85rem' }}>{q.topic}</td>
                      <td style={styles.td}>
                        <div style={styles.questionCell}>
                          {q.emoji && (
                            <span style={{ marginRight: '8px', display: 'inline-flex', alignItems: 'center' }}>
                              {isImage(q.emoji) ? (
                                <img 
                                  src={q.emoji} 
                                  alt="graphic" 
                                  style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '4px' }} 
                                />
                              ) : (
                                <span style={{ fontSize: '1.25rem' }}>{q.emoji}</span>
                              )}
                            </span>
                          )}
                          <span>{q.questionText}</span>
                        </div>
                      </td>
                      <td style={{ ...styles.td, fontSize: '0.85rem' }}>{q.options.join(' | ')}</td>
                      <td style={{ ...styles.td, fontWeight: '700', color: '#10b981' }}>{q.answer}</td>
                      <td style={styles.td}>
                        <button onClick={() => handleDeleteQuestion(q.id)} style={styles.deleteBtn} title="Delete Question">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      ) : (
        /* ==================== TAB 2: STUDENT TRACKER ==================== */
        <div style={styles.trackerContainer} className="glass-panel">
          <div style={styles.trackerHeader}>
            <TrendingUp size={24} color="#aa3bff" />
            <h3 style={styles.sectionTitle}>Classroom Stats Dashboard</h3>
          </div>
          
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.trHeader}>
                  <th style={styles.th}>Student</th>
                  <th style={styles.th}>Age / Grade</th>
                  <th style={styles.th}>Progress Points</th>
                  <th style={styles.th}>Streak</th>
                  <th style={styles.th}>Stars</th>
                  <th style={styles.th}>Unlocked Achievements</th>
                </tr>
              </thead>
              <tbody>
                {allStudents.map((student, idx) => {
                  const isActive = student.name.toLowerCase() === activeStudent.name.toLowerCase();
                  
                  const level = Math.floor(student.xp / 500) + 1;
                  const levelXP = student.xp % 500;
                  const barPercent = (levelXP / 500) * 100;
                  
                  return (
                    <tr key={idx} style={{ 
                      ...styles.trBody, 
                      backgroundColor: isActive ? 'rgba(170, 59, 255, 0.05)' : 'transparent',
                      borderLeft: isActive ? '4px solid #aa3bff' : 'none'
                    }}>
                      <td style={styles.td}>
                        <div style={styles.studentNameCell}>
                          <span style={styles.studentAvatar}>👦</span>
                          <div>
                            <span style={{ fontWeight: '800' }}>{student.name}</span>
                            {isActive && <span style={styles.activeLabel}>You</span>}
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        Age {student.age} <br />
                        <span style={styles.gradeSubtitle}>{student.grade}</span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.studentProgressCell}>
                          <div style={styles.studentProgressTexts}>
                            <span>Level {level}</span>
                            <span style={{ color: '#64748b' }}>{student.xp} XP</span>
                          </div>
                          <div style={styles.progressBarBg}>
                            <div style={{ ...styles.progressBarFill, width: `${barPercent}%` }}></div>
                          </div>
                          <span style={styles.detailedLogs}>
                            Math: {student.mathSolved} solved (level: {student.currentMathDiff || 'medium'}, streak: {student.mathStreak || 0})<br />
                            Reading: {student.readingSolved} solved (level: {student.currentReadingDiff || 'medium'}, streak: {student.readingStreak || 0})
                          </span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.streakCell}>
                          <span style={{ fontSize: '1.25rem' }}>🔥</span>
                          <span>{student.streak} Days</span>
                        </div>
                      </td>
                      <td style={{ ...styles.td, fontWeight: '800', color: '#b45309' }}>
                        ⭐ {student.stars} Stars
                      </td>
                      <td style={styles.td}>
                        <div style={styles.badgesWrapper}>
                          {student.badges.length > 0 ? (
                            student.badges.map((b, i) => (
                              <span key={i} style={styles.achievementBadge}>
                                🏆 {b}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No badges yet</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    maxWidth: '960px',
    margin: '0 auto',
    paddingBottom: '100px'
  },
  headerPanel: {
    padding: '28px',
    textAlign: 'center',
  },
  titleText: {
    fontSize: '2rem',
    color: '#4f46e5',
    marginBottom: '8px'
  },
  subtitleText: {
    color: '#64748b',
    fontSize: '1.05rem',
    marginBottom: '20px'
  },
  tabsRow: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center'
  },
  tabButton: {
    padding: '12px 24px',
    fontSize: '1rem',
  },
  tabContentGrid: {
    display: 'grid',
    gridTemplateColumns: '380px 1fr',
    gap: '24px',
    alignItems: 'start',
  },
  formCard: {
    padding: '24px',
  },
  listCard: {
    padding: '24px',
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: '1.35rem',
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: '20px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  row: {
    display: 'flex',
    gap: '12px',
    width: '100%'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1
  },
  label: {
    fontFamily: "'Fredoka', sans-serif",
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#475569'
  },
  select: {
    fontFamily: "'Fredoka', sans-serif",
    padding: '10px 14px',
    borderRadius: '12px',
    border: '2px solid #cbd5e1',
    outline: 'none',
    fontSize: '0.95rem',
    fontWeight: '600',
    backgroundColor: '#ffffff',
    cursor: 'pointer'
  },
  input: {
    fontFamily: "'Fredoka', sans-serif",
    padding: '10px 14px',
    borderRadius: '12px',
    border: '2px solid #cbd5e1',
    outline: 'none',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#1e293b'
  },
  textarea: {
    fontFamily: "'Fredoka', sans-serif",
    padding: '10px 14px',
    borderRadius: '12px',
    border: '2px solid #cbd5e1',
    outline: 'none',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#1e293b',
    resize: 'none'
  },
  submitBtn: {
    padding: '12px',
    fontSize: '1.05rem',
    marginTop: '10px'
  },
  tableWrapper: {
    overflowX: 'auto',
    width: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  trHeader: {
    borderBottom: '2.5px solid #cbd5e1'
  },
  th: {
    padding: '12px 16px',
    fontWeight: '800',
    color: '#475569',
    fontSize: '0.95rem'
  },
  trBody: {
    borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '16px',
    color: '#1e293b',
    fontSize: '0.95rem',
    fontWeight: '600',
    verticalAlign: 'middle'
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '700'
  },
  questionCell: {
    display: 'flex',
    alignItems: 'center'
  },
  deleteBtn: {
    background: '#fee2e2',
    color: '#ef4444',
    border: 'none',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  
  /* Tracker Styles */
  trackerContainer: {
    padding: '28px',
  },
  trackerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px'
  },
  studentNameCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  studentAvatar: {
    fontSize: '1.8rem',
    width: '40px',
    height: '40px',
    backgroundColor: '#f1f5f9',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1.5px solid #cbd5e1'
  },
  activeLabel: {
    backgroundColor: '#eedfff',
    color: '#7c3aed',
    fontSize: '0.7rem',
    fontWeight: '800',
    padding: '1px 6px',
    borderRadius: '8px',
    marginLeft: '6px',
    textTransform: 'uppercase'
  },
  gradeSubtitle: {
    fontSize: '0.8rem',
    color: '#64748b',
    fontWeight: '600'
  },
  studentProgressCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    width: '180px'
  },
  studentProgressTexts: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    fontWeight: '700'
  },
  progressBarBg: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#aa3bff',
    borderRadius: '4px'
  },
  detailedLogs: {
    fontSize: '0.72rem',
    color: '#94a3b8',
    fontWeight: '700'
  },
  streakCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  badgesWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    maxWidth: '220px'
  },
  achievementBadge: {
    backgroundColor: '#fffbeb',
    color: '#b45309',
    border: '1px solid #fef3c7',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '0.75rem',
    fontWeight: '700'
  },
  gradeSelectorBar: {
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
  },
  gradeBarLabel: {
    fontFamily: "'Fredoka', sans-serif",
    fontSize: '1.15rem',
    fontWeight: '800',
    color: '#1e293b',
  },
  gradeButtonsRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  gradeSelectBtn: {
    padding: '10px 20px',
    fontSize: '0.95rem',
    fontWeight: '800',
  }
};
