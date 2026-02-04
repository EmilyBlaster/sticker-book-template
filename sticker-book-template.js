// ============================================
// STICKER BOOK - CUSTOMIZABLE TEMPLATE
// Version: 1.0
// Author: Emily Green (emilygreendesign.com)
// 
// A quiz-gated gamification system for eLearning.
// Learners prove what they learned to earn stickers.
//
// FEATURES:
// - Quiz gating (answer correctly to earn)
// - Sequential unlocking (must complete in order)
// - Time delays between stickers (prevents speedrunning)
// - Lesson targeting (only shows on specific page)
// - Sound effects & confetti celebrations
// - Printable certificate on completion
//
// WORKS WITH: Rise + Mighty, Storyline, Captivate,
// any LMS with HTML support, or plain HTML pages.
//
// HOW IT WORKS:
// - Uses localStorage to persist progress
// - Polls every 500ms to detect page changes (for SPAs)
// - Shows/hides based on TARGET_LESSON match
// ============================================

(function () {

// ============================================
// ⚙️ CONFIGURATION - CUSTOMIZE THIS SECTION
// ============================================

// TIME DELAY: Minutes between earning stickers (0 = no delay)
var TIME_DELAY_MINUTES = 1;

// TARGET LESSON: Only show sticker book when this text appears in page title or h1
// Set to '' (empty string) to show on all pages
var TARGET_LESSON = 'Your Lesson Title Here';

// STICKERS: Add/remove/edit your stickers here
// Each sticker needs:
//   - id: unique identifier (lowercase, no spaces)
//   - name: display name
//   - image: URL to your sticker image
//   - quiz: question, answers (a/b/c/d), and correctAnswer
var STICKERS = [
  {
    id: 'sticker_1',
    name: 'First Sticker',
    image: 'https://your-image-url.com/sticker1.png',
    quiz: {
      question: "Your first quiz question goes here?",
      answers: {
        a: 'First answer option',
        b: 'Second answer option',
        c: 'Third answer option (correct one)',
        d: 'Fourth answer option'
      },
      correctAnswer: 'c'
    }
  },
  {
    id: 'sticker_2',
    name: 'Second Sticker',
    image: 'https://your-image-url.com/sticker2.png',
    quiz: {
      question: "Your second quiz question goes here?",
      answers: {
        a: 'First answer option',
        b: 'Second answer option (correct one)',
        c: 'Third answer option',
        d: 'Fourth answer option'
      },
      correctAnswer: 'b'
    }
  },
  {
    id: 'sticker_3',
    name: 'Third Sticker',
    image: 'https://your-image-url.com/sticker3.png',
    quiz: {
      question: "Your third quiz question goes here?",
      answers: {
        a: 'First answer option (correct one)',
        b: 'Second answer option',
        c: 'Third answer option',
        d: 'Fourth answer option'
      },
      correctAnswer: 'a'
    }
  }
  // Add more stickers by copying the pattern above!
  // The grid adjusts automatically.
];

// BRANDING: Customize text that appears in the sticker book
var BRANDING = {
  tabText: 'Stickers',                          // Text on the side tab
  bookTitle: 'My Sticker Collection',           // Title inside the book
  bookSubtitle: 'Your Course Name',             // Subtitle inside the book
  instructions: 'Tap a slot and prove what you learned!',
  footerText: 'Collect them all to unlock a special reward!',
  completeBadge: 'COMPLETE! ⭐',
  unlockTitle: '🎉 You Did It!',
  unlockMessage: 'You\'ve mastered all the content. Congratulations!',
  certificateTitle: 'Certificate of Completion',
  certificateText: 'This certifies that the bearer has successfully completed all assessments.',
  certificateFooter: 'Congratulations!'
};

// COMPLETION IMAGE: Shows when all stickers collected (optional)
// Set to '' to hide
var COMPLETION_IMAGE = 'https://your-image-url.com/congrats.png';

// COLORS: Customize the color scheme
var COLORS = {
  primary: '#ff6b9d',        // Main accent color (tab, buttons)
  primaryHover: '#d64d65',   // Hover state
  success: '#4CAF50',        // Correct answer, completion
  error: '#e85d75',          // Incorrect answer
  background: '#f5f0e6',     // Book background (paper color)
  panelBg: '#e8e0d5',        // Side panel background
  text: '#2a2a2a',           // Main text
  textLight: '#666',         // Secondary text
  textMuted: '#999',         // Muted text
  border: '#ccc'             // Borders and dividers
};

// STORAGE KEY: Change this if you want separate progress tracking
// (e.g., different courses on the same domain)
var STORAGE_KEY = 'sticker_book_v1';
var CELEBRATED_KEY = 'sticker_book_celebrated_v1';
var LAST_CLAIM_KEY = 'sticker_book_last_claim_v1';

// ============================================
// 🎨 STYLES - Edit if you want different aesthetics
// ============================================

var css = `
/* TAB - The torn paper bookmark on the side */
.pp-tab{position:fixed;right:0;top:50%;transform:translateY(-50%);z-index:99999;cursor:pointer;transition:transform .3s}
.pp-tab:hover{transform:translateY(-50%) translateX(-5px)}
.pp-tab-inner{background:${COLORS.primary};padding:15px 12px 15px 18px;display:flex;flex-direction:column;align-items:center;gap:6px;box-shadow:-3px 3px 10px rgba(0,0,0,.2);clip-path:polygon(8px 0%,100% 0%,100% 100%,8px 100%,5px 97%,8px 94%,3px 90%,7px 86%,4px 82%,8px 78%,5px 74%,7px 70%,3px 66%,8px 62%,4px 58%,7px 54%,5px 50%,8px 46%,3px 42%,7px 38%,5px 34%,8px 30%,4px 26%,7px 22%,3px 18%,8px 14%,5px 10%,7px 6%,4px 3%)}
.pp-tab-icon{font-size:1.5rem}
.pp-tab-text{font-family:'Permanent Marker',cursive;font-size:.7rem;color:#fff;writing-mode:vertical-rl;letter-spacing:1px}
.pp-tab-badge{background:#fff;color:${COLORS.primary};font-size:.6rem;font-weight:700;padding:3px 5px;border-radius:8px}
.pp-tab-badge.complete{background:${COLORS.success};color:#fff}

/* OVERLAY & PANEL */
.pp-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);z-index:100000;opacity:0;visibility:hidden;transition:opacity .3s}
.pp-overlay.open{opacity:1;visibility:visible}
.pp-panel{position:absolute;right:0;top:0;bottom:0;width:100%;max-width:480px;background:${COLORS.panelBg};transform:translateX(100%);transition:transform .4s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;overflow-y:auto;padding:30px 25px}
.pp-overlay.open .pp-panel{transform:translateX(0)}
.pp-panel-edge{position:absolute;left:0;top:0;bottom:0;width:15px;background:${COLORS.panelBg};clip-path:polygon(100% 0%,100% 100%,0% 100%,3px 97%,0% 94%,5px 91%,2px 88%,4px 85%,0% 82%,3px 79%,1px 76%,5px 73%,2px 70%,4px 67%,0% 64%,3px 61%,1px 58%,5px 55%,2px 52%,4px 49%,0% 46%,3px 43%,1px 40%,5px 37%,2px 34%,4px 31%,0% 28%,3px 25%,1px 22%,5px 19%,2px 16%,4px 13%,0% 10%,3px 7%,1px 4%,4px 1%,0% 0%);box-shadow:-3px 0 8px rgba(0,0,0,.1)}
.pp-close{margin-top:20px;padding:14px 28px;background:transparent;border:2px dashed ${COLORS.border};border-radius:8px;font-family:'Courier Prime',monospace;font-size:1rem;color:${COLORS.textLight};cursor:pointer;align-self:center}
.pp-close:hover{border-color:${COLORS.primary};color:${COLORS.primary}}

/* BOOK */
.pp-book{font-family:'Courier Prime',monospace;background:${COLORS.background};border-radius:8px;padding:30px 30px 30px 55px;position:relative;box-shadow:0 2px 4px rgba(0,0,0,.1),0 8px 24px rgba(0,0,0,.12)}
.pp-spiral{position:absolute;left:18px;top:25px;bottom:25px;width:22px;display:flex;flex-direction:column;justify-content:space-between}
.pp-ring{width:22px;height:22px;border:3px solid ${COLORS.text};border-radius:50%;background:linear-gradient(135deg,#888,#aaa 50%,#888)}
.pp-header{text-align:center;margin-bottom:25px;padding-bottom:15px;border-bottom:2px dashed ${COLORS.border}}
.pp-title{font-family:'Permanent Marker',cursive;font-size:1.8rem;color:${COLORS.text};transform:rotate(-1deg);margin:0}
.pp-subtitle{font-size:1.15rem;color:${COLORS.textLight};margin-top:8px}
.pp-instructions{font-size:1rem;color:${COLORS.textMuted};margin-top:10px;font-style:italic}
.pp-progress{font-size:1.1rem;color:${COLORS.textMuted};margin-top:12px;font-weight:700}
.pp-progress span{color:${COLORS.primary};font-size:1.4rem}

/* STICKER GRID */
.pp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}
.pp-slot{display:flex;flex-direction:column;align-items:center;gap:8px}
.pp-box{aspect-ratio:1;width:100%;display:flex;align-items:center;justify-content:center;border-radius:12px;overflow:hidden}
.pp-slot.empty .pp-box{background:radial-gradient(ellipse at center,rgba(0,0,0,.04) 0%,transparent 70%);border:2px dashed ${COLORS.border};cursor:pointer;transition:all .2s}
.pp-slot.empty .pp-box:hover{border-color:${COLORS.primary};background:radial-gradient(ellipse at center,rgba(232,93,117,.08) 0%,transparent 70%)}
.pp-slot.empty.locked .pp-box{cursor:not-allowed;opacity:.6}
.pp-slot.empty.locked .pp-box:hover{border-color:${COLORS.border};background:radial-gradient(ellipse at center,rgba(0,0,0,.04) 0%,transparent 70%)}
.pp-box-inner{display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px;text-align:center}
.pp-box-icon{font-size:2.2rem;opacity:.4}
.pp-slot.empty:hover .pp-box-icon{opacity:.7}
.pp-box-text{font-size:.8rem;color:${COLORS.textMuted};font-weight:700;text-transform:uppercase}
.pp-slot.empty:hover .pp-box-text{color:${COLORS.primary}}
.pp-slot.collected .pp-box{animation:stickerPlace .4s ease-out}
.pp-slot.collected .pp-box img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(2px 3px 4px rgba(0,0,0,.2));transition:transform .2s}
.pp-slot.collected:hover .pp-box img{transform:scale(1.08) rotate(-3deg)}
@keyframes stickerPlace{0%{transform:scale(1.3) rotate(10deg);opacity:0}60%{transform:scale(.95) rotate(-2deg)}100%{transform:scale(1) rotate(0deg);opacity:1}}
.pp-label{font-size:.9rem;font-weight:700;text-transform:uppercase;text-align:center}
.pp-slot.empty .pp-label{color:#bbb}
.pp-slot.collected .pp-label{color:${COLORS.textLight}}

/* DECORATIVE DOODLES */
.pp-doodle{position:absolute;font-size:1.2rem;opacity:.15}
.pp-doodle-1{top:50px;right:20px;transform:rotate(15deg)}
.pp-doodle-2{bottom:70px;right:25px;transform:rotate(-10deg)}
.pp-doodle-3{bottom:35px;left:60px;transform:rotate(5deg)}

/* FOOTER */
.pp-footer{margin-top:25px;padding-top:15px;border-top:2px dashed ${COLORS.border};text-align:center}
.pp-footer-text{font-size:1rem;color:${COLORS.textMuted};font-style:italic}
.pp-cooldown{font-size:1rem;color:${COLORS.primary};margin-top:8px;font-weight:700;display:none}
.pp-complete-badge{display:none;position:absolute;top:-8px;right:-8px;background:${COLORS.primary};color:#fff;font-family:'Permanent Marker',cursive;padding:8px 15px;border-radius:4px;transform:rotate(12deg);box-shadow:2px 3px 8px rgba(0,0,0,.2);font-size:.85rem;z-index:5}
.pp-book.all-collected .pp-complete-badge{display:block;animation:badgePop .5s ease-out}
@keyframes badgePop{0%{transform:rotate(12deg) scale(0)}60%{transform:rotate(12deg) scale(1.2)}100%{transform:rotate(12deg) scale(1)}}

/* QUIZ MODAL */
.pp-quiz{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.8);z-index:100002;display:none;align-items:center;justify-content:center;padding:20px;box-sizing:border-box}
.pp-quiz.open{display:flex}
.pp-quiz-box{background:${COLORS.background};border-radius:12px;width:95%;max-width:650px;padding:30px;position:relative;box-shadow:0 10px 40px rgba(0,0,0,.3);animation:quizPop .3s ease-out}
@keyframes quizPop{0%{transform:scale(.9);opacity:0}100%{transform:scale(1);opacity:1}}
.pp-quiz-close{position:absolute;top:12px;right:15px;background:none;border:none;color:${COLORS.textMuted};font-size:1.8rem;cursor:pointer;line-height:1}
.pp-quiz-close:hover{color:${COLORS.primary}}
.pp-quiz-instruction{font-size:.85rem;color:${COLORS.textMuted};margin:0 0 15px;font-family:'Courier Prime',monospace}
.pp-quiz-question{font-family:'Courier Prime',monospace;font-size:1.1rem;color:${COLORS.text};padding:18px;background:#fff;border:2px solid ${COLORS.text};border-radius:8px;margin-bottom:18px;line-height:1.5}
.pp-quiz-answers{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.pp-quiz-answer{position:relative;background:#fff;border:2px solid ${COLORS.text};border-radius:8px;padding:14px 14px 14px 42px;cursor:pointer;transition:all .2s;font-family:'Courier Prime',monospace;font-size:.9rem;line-height:1.4;text-align:left}
.pp-quiz-answer:hover{border-color:${COLORS.primary};background:#fff5f5}
.pp-quiz-letter{position:absolute;left:-2px;top:-2px;width:28px;height:28px;background:#f4d03f;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.8rem;color:${COLORS.text}}
.pp-quiz-answer.correct{border-color:${COLORS.success};background:#e8f5e9}
.pp-quiz-answer.correct .pp-quiz-letter{background:${COLORS.success};color:#fff}
.pp-quiz-answer.incorrect{border-color:${COLORS.error};background:#ffebee;animation:shake .4s ease}
@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.pp-quiz-feedback{margin-top:18px;padding:14px;border-radius:8px;text-align:center;font-family:'Courier Prime',monospace;font-size:1rem;display:none}
.pp-quiz-feedback.show{display:block}
.pp-quiz-feedback.correct{background:#e8f5e9;color:#2e7d32}
.pp-quiz-feedback.incorrect{background:#ffebee;color:#c62828}
.pp-confetti{position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;overflow:hidden;border-radius:12px}
.pp-confetti-piece{position:absolute;opacity:0}
@keyframes confettiFall{0%{transform:translateY(-10px) rotate(0);opacity:1}100%{transform:translateY(250px) rotate(720deg);opacity:0}}

/* UNLOCK SECTION */
.pp-unlock{display:none;margin-top:25px}
.pp-book.all-collected .pp-unlock{display:block;animation:unlockReveal .6s ease-out .3s both}
@keyframes unlockReveal{0%{opacity:0;transform:translateY(20px)}100%{opacity:1;transform:translateY(0)}}
.pp-unlock-divider{text-align:center;margin-bottom:20px;position:relative}
.pp-unlock-divider::before,.pp-unlock-divider::after{content:'';position:absolute;top:50%;width:25%;height:2px;background:linear-gradient(90deg,transparent,${COLORS.primary},transparent)}
.pp-unlock-divider::before{left:0}
.pp-unlock-divider::after{right:0}
.pp-unlock-divider span{background:${COLORS.background};padding:0 15px;font-family:'Permanent Marker',cursive;font-size:.9rem;color:${COLORS.primary}}
.pp-unlock-content{background:linear-gradient(135deg,#fff9e6,#fff5f5);border:2px solid ${COLORS.primary};border-radius:12px;padding:25px 20px;text-align:center}
.pp-unlock-title{font-family:'Permanent Marker',cursive;font-size:1.7rem;color:${COLORS.text};margin:0 0 10px}
.pp-unlock-message{font-size:1rem;color:#555;line-height:1.5;margin-bottom:20px}
.pp-congrats-sticker{margin-bottom:20px}
.pp-congrats-sticker img{max-width:180px;height:auto;filter:drop-shadow(2px 4px 6px rgba(0,0,0,0.2));animation:stickerPlace .5s ease-out}
.pp-print-btn{background:${COLORS.primary};color:#fff;border:none;padding:14px 28px;font-family:'Courier Prime',monospace;font-size:1rem;font-weight:700;border-radius:8px;cursor:pointer;box-shadow:0 4px 12px rgba(232,93,117,.3)}
.pp-print-btn:hover{background:${COLORS.primaryHover};transform:translateY(-2px)}

/* CELEBRATION MODAL */
.pp-celebrate{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.85);z-index:100003;display:none;align-items:center;justify-content:center}
.pp-celebrate.show{display:flex}
.pp-celebrate-inner{text-align:center;padding:40px}
.pp-celebrate-sticker{max-width:200px;height:auto;display:block;margin:0 auto 25px;animation:bounce .6s ease infinite alternate;filter:drop-shadow(0 0 30px rgba(255,215,0,0.4))}
@keyframes bounce{0%{transform:translateY(0) rotate(-3deg)}100%{transform:translateY(-15px) rotate(3deg)}}
.pp-celebrate h2{font-family:'Permanent Marker',cursive;font-size:2.5rem;color:#fff;margin:0 0 15px}
.pp-celebrate p{font-family:'Courier Prime',monospace;font-size:1.1rem;color:rgba(255,255,255,.9);margin-bottom:30px}
.pp-celebrate-btn{background:#FFD700;color:${COLORS.text};border:none;padding:15px 30px;font-family:'Permanent Marker',cursive;font-size:1.1rem;border-radius:8px;cursor:pointer;box-shadow:0 4px 20px rgba(255,215,0,.4)}
.pp-celebrate-btn:hover{transform:scale(1.05)}

/* PRINT CERTIFICATE */
.pp-print{display:none;font-family:'Courier Prime',monospace;max-width:600px;margin:0 auto;padding:40px;background:#fff}
.pp-print.printing{display:block;position:fixed;top:0;left:0;right:0;bottom:0;z-index:999999;overflow:auto}
.pp-print-header{text-align:center;margin-bottom:30px;padding-bottom:20px;border-bottom:3px double ${COLORS.text}}
.pp-print-header h1{font-family:'Permanent Marker',cursive;font-size:2rem;margin:0 0 5px}
.pp-print-header p{color:${COLORS.textLight};margin:5px 0}
.pp-print-cert{border:3px solid ${COLORS.text};padding:30px;margin-bottom:30px;text-align:center}
.pp-print-cert h2{font-family:'Permanent Marker',cursive;font-size:1.3rem;margin:0 0 10px}
.pp-print-cert p{font-size:.9rem;color:#555;line-height:1.5}
.pp-print-congrats{margin-top:20px}
.pp-print-congrats img{max-width:150px;height:auto}
.pp-print-stickers{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:30px}
.pp-print-sticker{text-align:center}
.pp-print-sticker img{width:100%;max-width:120px}
.pp-print-sticker-name{font-size:.75rem;font-weight:700;text-transform:uppercase;margin-top:8px;color:#333}
.pp-print-footer{text-align:center;padding-top:20px;border-top:1px dashed ${COLORS.border};font-size:.8rem;color:${COLORS.textMuted}}
.pp-print-close{position:fixed;top:20px;right:20px;background:${COLORS.primary};color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;z-index:1000000}
@media print{body *{visibility:hidden}.pp-print,.pp-print *{visibility:visible}.pp-print{position:absolute;left:0;top:0;width:100%}.pp-print-close{display:none}}

/* MOBILE RESPONSIVE */
@media(max-width:500px){
  .pp-panel{padding:20px 15px}
  .pp-book{padding:25px 20px 25px 45px}
  .pp-title{font-size:1.2rem}
  .pp-grid{gap:10px}
  .pp-spiral{left:14px}
  .pp-ring{width:18px;height:18px}
  .pp-tab{top:auto;bottom:20px;transform:none}
  .pp-tab:hover{transform:translateX(-5px)}
  .pp-quiz-answers{grid-template-columns:1fr}
  .pp-quiz-box{width:95%;padding:20px}
  .pp-quiz-question{font-size:1rem}
  .pp-quiz-answer{font-size:.85rem;padding:12px 12px 12px 38px}
}

/* HIDDEN STATE */
.pp-container-hidden{display:none !important}
`;

// ============================================
// 🔧 INTERNAL CODE - No need to edit below
// ============================================

var currentQuizSticker = null;
var cooldownTimer = null;

// Inject styles
var styleEl = document.createElement('style');
styleEl.textContent = css;
document.head.appendChild(styleEl);

// Load fonts
var link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Permanent+Marker&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

// Storage functions
function getCollected() { 
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } 
  catch (e) { return []; } 
}
function saveCollected(arr) { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }
function getLastClaim() { return parseInt(localStorage.getItem(LAST_CLAIM_KEY) || '0', 10); }
function setLastClaim() { localStorage.setItem(LAST_CLAIM_KEY, Date.now().toString()); }
function getTimeLeft() { 
  var last = getLastClaim(); 
  if (!last) return 0; 
  var left = (TIME_DELAY_MINUTES * 60 * 1000) - (Date.now() - last); 
  return left > 0 ? left : 0; 
}
function formatTime(ms) { 
  var s = Math.ceil(ms / 1000); 
  var m = Math.floor(s / 60); 
  s = s % 60; 
  return m + ':' + (s < 10 ? '0' : '') + s; 
}

// Sound effects using Web Audio API
function playSound(freqs) {
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    freqs.forEach(function (f, i) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = f;
      var t = ctx.currentTime + i * 0.12;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.25, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      o.start(t); o.stop(t + 0.3);
    });
  } catch (e) { }
}

// Confetti animation
function confetti(container) {
  container.innerHTML = '';
  var colors = [COLORS.primary, COLORS.success, '#FFD700', '#00BCD4', '#9C27B0'];
  for (var i = 0; i < 30; i++) {
    var c = document.createElement('div');
    c.className = 'pp-confetti-piece';
    c.style.cssText = 'left:' + Math.random() * 100 + '%;top:-10px;width:' + (4 + Math.random() * 6) + 'px;height:' + (4 + Math.random() * 6) + 'px;background:' + colors[Math.floor(Math.random() * colors.length)] + ';border-radius:' + (Math.random() > 0.5 ? '50%' : '2px') + ';animation:confettiFall ' + (0.6 + Math.random() * 0.4) + 's ease-out ' + Math.random() * 0.2 + 's forwards';
    container.appendChild(c);
  }
}

// Quiz functions
function openQuiz(sticker) {
  currentQuizSticker = sticker;
  var modal = document.getElementById('ppQuiz');
  document.getElementById('ppQuizQuestion').textContent = sticker.quiz.question;
  document.getElementById('ppQuizFeedback').className = 'pp-quiz-feedback';

  var ans = document.getElementById('ppQuizAnswers');
  ans.innerHTML = '';
  ['a', 'b', 'c', 'd'].forEach(function (l) {
    if (sticker.quiz.answers[l]) {
      var btn = document.createElement('button');
      btn.className = 'pp-quiz-answer';
      btn.innerHTML = '<span class="pp-quiz-letter">' + l.toUpperCase() + '</span>' + sticker.quiz.answers[l];
      btn.onclick = function () { handleAnswer(l, btn); };
      ans.appendChild(btn);
    }
  });
  modal.classList.add('open');
}

function closeQuiz() {
  document.getElementById('ppQuiz').classList.remove('open');
  currentQuizSticker = null;
}

function handleAnswer(letter, btn) {
  if (!currentQuizSticker) return;
  var btns = document.querySelectorAll('.pp-quiz-answer');
  var fb = document.getElementById('ppQuizFeedback');
  btns.forEach(function (b) { b.style.pointerEvents = 'none'; });

  if (letter === currentQuizSticker.quiz.correctAnswer) {
    btn.classList.add('correct');
    playSound([523.25, 659.25, 783.99]);
    confetti(document.getElementById('ppQuizConfetti'));
    fb.textContent = '🎉 Correct! Sticker unlocked!';
    fb.className = 'pp-quiz-feedback correct show';
    var col = getCollected();
    col.push(currentQuizSticker.id);
    saveCollected(col);
    setLastClaim();
    setTimeout(function () {
      closeQuiz();
      render();
      updateBadge();
      if (col.length === STICKERS.length && !localStorage.getItem(CELEBRATED_KEY)) {
        setTimeout(showCelebrate, 500);
      }
    }, 1400);
  } else {
    btn.classList.add('incorrect');
    playSound([200]);
    fb.textContent = '😐 Not quite—try again!';
    fb.className = 'pp-quiz-feedback incorrect show';
    setTimeout(function () {
      btns.forEach(function (b) { b.style.pointerEvents = 'auto'; b.classList.remove('incorrect'); });
      fb.className = 'pp-quiz-feedback';
    }, 900);
  }
}

// Panel functions
function openPanel() {
  document.getElementById('ppOverlay').classList.add('open');
  render();
  document.body.style.overflow = 'hidden';
}

function closePanel() {
  document.getElementById('ppOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// Celebration functions
function showCelebrate() {
  playSound([523.25, 659.25, 783.99, 1046.5]);
  document.getElementById('ppCelebrate').classList.add('show');
  localStorage.setItem(CELEBRATED_KEY, 'true');
}

function closeCelebrate() {
  document.getElementById('ppCelebrate').classList.remove('show');
  render();
}

// Print certificate
function printCert() {
  var p = document.getElementById('ppPrint');
  document.getElementById('ppPrintDate').textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  var grid = document.getElementById('ppPrintStickers');
  grid.innerHTML = '';
  STICKERS.forEach(function (s) {
    grid.innerHTML += '<div class="pp-print-sticker"><img src="' + s.image + '" alt="' + s.name + '"><div class="pp-print-sticker-name">' + s.name + '</div></div>';
  });
  p.classList.add('printing');
  document.body.style.overflow = 'hidden';
  setTimeout(function () { window.print(); }, 300);
}

function closePrint() {
  document.getElementById('ppPrint').classList.remove('printing');
  document.body.style.overflow = '';
}

// Render the sticker grid
function render() {
  var grid = document.getElementById('ppGrid');
  var cooldown = document.getElementById('ppCooldown');
  var collected = getCollected();
  var timeLeft = getTimeLeft();
  var isOnCooldown = timeLeft > 0 && collected.length > 0 && collected.length < STICKERS.length;

  if (cooldown) {
    cooldown.style.display = isOnCooldown ? 'block' : 'none';
    cooldown.textContent = 'Next sticker in: ' + formatTime(timeLeft);
  }

  grid.innerHTML = '';
  STICKERS.forEach(function (s, index) {
    var slot = document.createElement('div');
    slot.className = 'pp-slot';
    var isCollected = collected.indexOf(s.id) !== -1;
    var isNext = index === collected.length;

    if (isCollected) {
      slot.classList.add('collected');
      slot.innerHTML = '<div class="pp-box"><img src="' + s.image + '" alt="' + s.name + '"></div><span class="pp-label">' + s.name + '</span>';
    } else if (isOnCooldown) {
      slot.classList.add('empty', 'locked');
      slot.innerHTML = '<div class="pp-box"><div class="pp-box-inner"><span class="pp-box-icon">⏳</span><span class="pp-box-text">Wait...</span></div></div><span class="pp-label">' + s.name + '</span>';
    } else if (isNext) {
      slot.classList.add('empty');
      slot.innerHTML = '<div class="pp-box"><div class="pp-box-inner"><span class="pp-box-icon">🏆</span><span class="pp-box-text">Prove it!</span></div></div><span class="pp-label">' + s.name + '</span>';
      slot.querySelector('.pp-box').onclick = function () { openQuiz(s); };
    } else {
      slot.classList.add('empty', 'locked');
      slot.innerHTML = '<div class="pp-box"><div class="pp-box-inner"><span class="pp-box-icon">🔒</span><span class="pp-box-text">Complete previous</span></div></div><span class="pp-label">' + s.name + '</span>';
    }
    grid.appendChild(slot);
  });

  document.getElementById('ppCollected').textContent = collected.length;
  document.getElementById('ppTotal').textContent = STICKERS.length;
  var book = document.getElementById('ppBook');
  book.classList.toggle('all-collected', collected.length === STICKERS.length);

  if (isOnCooldown && !cooldownTimer) {
    cooldownTimer = setInterval(function () {
      var left = getTimeLeft();
      if (left <= 0) { clearInterval(cooldownTimer); cooldownTimer = null; render(); }
      else if (cooldown) cooldown.textContent = 'Next sticker in: ' + formatTime(left);
    }, 1000);
  }
}

function updateBadge() {
  var collected = getCollected();
  var badge = document.getElementById('ppBadge');
  if (badge) {
    badge.classList.toggle('complete', collected.length === STICKERS.length);
    badge.textContent = collected.length === STICKERS.length ? '✓' : collected.length + '/' + STICKERS.length;
  }
}

// Lesson targeting
function isTargetLesson() {
  if (!TARGET_LESSON) return true; // Show everywhere if no target set
  
  if (document.title && document.title.indexOf(TARGET_LESSON) !== -1) return true;
  
  var h1s = document.querySelectorAll('h1');
  for (var i = 0; i < h1s.length; i++) {
    if (h1s[i].innerText && h1s[i].innerText.indexOf(TARGET_LESSON) !== -1) return true;
  }
  
  var lessonTitles = document.querySelectorAll('.lesson-title, .block-title, [data-testid="lesson-title"]');
  for (var j = 0; j < lessonTitles.length; j++) {
    if (lessonTitles[j].innerText && lessonTitles[j].innerText.indexOf(TARGET_LESSON) !== -1) return true;
  }
  
  return false;
}

function updateVisibility() {
  var container = document.getElementById('ppContainer');
  if (!container) return;

  if (isTargetLesson()) {
    container.classList.remove('pp-container-hidden');
  } else {
    container.classList.add('pp-container-hidden');
    closePanel();
    closeQuiz();
  }
}

// Build the HTML
function init() {
  if (document.getElementById('ppContainer')) return;
  
  // Build completion image HTML
  var congratsImageHtml = COMPLETION_IMAGE ? 
    '<div class="pp-congrats-sticker"><img src="' + COMPLETION_IMAGE + '" alt="Congratulations!"></div>' : '';
  var celebrateImageHtml = COMPLETION_IMAGE ?
    '<img src="' + COMPLETION_IMAGE + '" alt="Congratulations!" class="pp-celebrate-sticker">' : '';
  var printCongratsHtml = COMPLETION_IMAGE ?
    '<div class="pp-print-congrats"><img src="' + COMPLETION_IMAGE + '" alt="Congratulations!"></div>' : '';
  
  // Build spiral rings based on sticker count
  var spiralRings = '';
  var ringCount = Math.max(6, STICKERS.length + 3);
  for (var i = 0; i < ringCount; i++) {
    spiralRings += '<div class="pp-ring"></div>';
  }
  
  var c = document.createElement('div');
  c.id = 'ppContainer';
  c.className = 'pp-container-hidden';
  c.innerHTML =
    '<div class="pp-tab" id="ppTab"><div class="pp-tab-inner"><span class="pp-tab-icon">📓</span><span class="pp-tab-text">' + BRANDING.tabText + '</span><span class="pp-tab-badge" id="ppBadge">0/' + STICKERS.length + '</span></div></div>' +
    '<div class="pp-overlay" id="ppOverlay"><div class="pp-panel"><div class="pp-panel-edge"></div>' +
    '<div class="pp-book" id="ppBook"><div class="pp-complete-badge">' + BRANDING.completeBadge + '</div>' +
    '<div class="pp-spiral">' + spiralRings + '</div>' +
    '<span class="pp-doodle pp-doodle-1">✦</span><span class="pp-doodle pp-doodle-2">★</span><span class="pp-doodle pp-doodle-3">✧</span>' +
    '<div class="pp-header"><h1 class="pp-title">' + BRANDING.bookTitle + '</h1><p class="pp-subtitle">' + BRANDING.bookSubtitle + '</p><p class="pp-instructions">' + BRANDING.instructions + '</p><p class="pp-progress"><span id="ppCollected">0</span> of <span id="ppTotal">' + STICKERS.length + '</span> collected</p></div>' +
    '<div class="pp-grid" id="ppGrid"></div>' +
    '<div class="pp-footer"><p class="pp-footer-text">' + BRANDING.footerText + '</p><p class="pp-cooldown" id="ppCooldown"></p></div>' +
    '<div class="pp-unlock"><div class="pp-unlock-divider"><span>✦ SECRET UNLOCKED ✦</span></div><div class="pp-unlock-content"><h2 class="pp-unlock-title">' + BRANDING.unlockTitle + '</h2><p class="pp-unlock-message">' + BRANDING.unlockMessage + '</p>' + congratsImageHtml + '<button class="pp-print-btn" id="ppPrintBtn">🖨 Print My Collection</button></div></div>' +
    '</div><button class="pp-close" id="ppCloseBtn">× Close</button></div></div>' +
    '<div class="pp-quiz" id="ppQuiz"><div class="pp-quiz-box"><div class="pp-confetti" id="ppQuizConfetti"></div><button class="pp-quiz-close" id="ppQuizClose">×</button><p class="pp-quiz-instruction">Tap the answer you think is correct</p><div class="pp-quiz-question" id="ppQuizQuestion"></div><div class="pp-quiz-answers" id="ppQuizAnswers"></div><div class="pp-quiz-feedback" id="ppQuizFeedback"></div></div></div>' +
    '<div class="pp-celebrate" id="ppCelebrate"><div class="pp-celebrate-inner">' + celebrateImageHtml + '<h2>Collection Complete!</h2><p>You\'ve unlocked something special…</p><button class="pp-celebrate-btn" id="ppCelebrateBtn">See My Reward →</button></div></div>' +
    '<div class="pp-print" id="ppPrint"><button class="pp-print-close" id="ppPrintClose">× Close</button><div class="pp-print-header"><h1>' + BRANDING.bookSubtitle + '</h1><p>' + BRANDING.certificateTitle + '</p><p id="ppPrintDate"></p></div><div class="pp-print-cert"><h2>' + BRANDING.certificateTitle + '</h2><p>' + BRANDING.certificateText + '</p>' + printCongratsHtml + '</div><div class="pp-print-stickers" id="ppPrintStickers"></div><div class="pp-print-footer"><p>' + BRANDING.certificateFooter + '</p></div></div>';
  document.body.appendChild(c);

  // Event listeners
  document.getElementById('ppTab').onclick = openPanel;
  document.getElementById('ppOverlay').onclick = function (e) { if (e.target === this) closePanel(); };
  document.getElementById('ppCloseBtn').onclick = closePanel;
  document.getElementById('ppQuizClose').onclick = closeQuiz;
  document.getElementById('ppQuiz').onclick = function (e) { if (e.target === this) closeQuiz(); };
  document.getElementById('ppCelebrateBtn').onclick = closeCelebrate;
  document.getElementById('ppPrintBtn').onclick = printCert;
  document.getElementById('ppPrintClose').onclick = closePrint;
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeQuiz(); closePanel(); closePrint(); } });

  updateBadge();
  updateVisibility();
  console.log('Sticker Book loaded! Stickers:', STICKERS.length);
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Continuously check visibility for SPA navigation
setInterval(function() {
  var container = document.getElementById('ppContainer');
  if (container) {
    updateVisibility();
  } else {
    init();
  }
}, 500);

// Reset function for testing
window.resetStickerBook = function () {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CELEBRATED_KEY);
  localStorage.removeItem(LAST_CLAIM_KEY);
  if (cooldownTimer) { clearInterval(cooldownTimer); cooldownTimer = null; }
  render(); 
  updateBadge();
  console.log('Sticker book reset!');
};

})();
