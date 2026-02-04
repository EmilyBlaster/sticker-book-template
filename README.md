# 📓 Quiz-Gated Sticker Book

A gamification system for eLearning where learners **prove what they learned** to earn stickers. No paid tools or LMS integrations required—just HTML, CSS, and JavaScript.


## ✨ Features

| Feature | Description |
|---------|-------------|
| 🏆 **Quiz Gating** | Learners must answer a question correctly to earn each sticker |
| 🔒 **Sequential Unlock** | Must complete stickers in order—no skipping ahead |
| ⏳ **Time Delays** | Configurable cooldown between stickers prevents speedrunning |
| 🎯 **Lesson Targeting** | Only shows on specific pages (handles SPA navigation) |
| 🎉 **Celebrations** | Confetti bursts, sound effects, and a special unlock when complete |
| 🖨️ **Printable Certificate** | Learners can print their completed collection |
| 💾 **Persistent Progress** | Uses localStorage to save progress across sessions |

## 🎮 Live Demo

**[Try the interactive demo →](https://emilyblaster.github.io/sticker-book-template/sticker-book-showcase.html))**

Click the pink "Stickers" tab on the right side of the page to see it in action!

## 🎓 See It In a Real Course

This sticker book was built for **The People's Professors**, a course about how TikTok creators use sophisticated teaching strategies. 

**[View the full course →](https://www.emilygreendesign.com/interactives))**

## 🛠️ Installation

### Articulate Rise + Mighty

1. Open your Rise course
2. Open the Mighty extension
3. Go to the **JavaScript** tab (global level)
4. Paste the contents of `sticker-book-template.js`
5. Update the configuration section at the top
6. Save and preview

### Storyline / Captivate

1. Create a new slide or layer for the sticker book
2. Add a "Execute JavaScript" trigger
3. Paste the contents of `sticker-book-template.js`
4. Set `TARGET_LESSON = ''` to show on all slides, or use slide detection logic

### LMS with HTML Support (Canvas, Moodle, Blackboard)

1. Go to the page where you want the sticker book
2. Edit the page and switch to HTML view
3. Add a `<script>` tag and paste the code inside
4. Update the configuration section

### Plain HTML Pages

```html
<script src="sticker-book-template.js"></script>
```

Or paste the entire script inside a `<script>` tag.

## ⚙️ Configuration

All customizable settings are at the top of the file. Here's what you can change:

### Stickers

```javascript
var STICKERS = [
  {
    id: 'communication',           // Unique ID (lowercase, no spaces)
    name: 'Communication',          // Display name
    image: 'https://your-url.com/sticker.png',  // Your sticker image
    quiz: {
      question: "Your quiz question here?",
      answers: {
        a: 'First option',
        b: 'Second option (correct)',
        c: 'Third option',
        d: 'Fourth option'
      },
      correctAnswer: 'b'
    }
  },
  // Add more stickers...
];
```

### Target Lesson

```javascript
// Only show on pages containing this text in the title or h1
var TARGET_LESSON = 'Your Lesson Title Here';

// Or leave empty to show on ALL pages
var TARGET_LESSON = '';
```

### Time Delay

```javascript
// Minutes between earning stickers (0 = no delay)
var TIME_DELAY_MINUTES = 1;
```

### Branding

```javascript
var BRANDING = {
  tabText: 'Stickers',                    // Text on the side tab
  bookTitle: 'My Sticker Collection',     // Title inside the book
  bookSubtitle: 'Your Course Name',       // Subtitle
  instructions: 'Tap a slot and prove what you learned!',
  footerText: 'Collect them all to unlock a special reward!',
  completeBadge: 'COMPLETE! ⭐',
  unlockTitle: '🎉 You Did It!',
  unlockMessage: 'Your custom completion message here.',
  certificateTitle: 'Certificate of Completion',
  certificateText: 'Your certificate text here.',
  certificateFooter: 'Congratulations!'
};
```

### Colors

```javascript
var COLORS = {
  primary: '#ff6b9d',        // Main accent (tab, buttons)
  primaryHover: '#d64d65',   // Hover state
  success: '#4CAF50',        // Correct answer
  error: '#e85d75',          // Incorrect answer
  background: '#f5f0e6',     // Book background
  panelBg: '#e8e0d5',        // Side panel
  text: '#2a2a2a',           // Main text
  textLight: '#666',         // Secondary text
  textMuted: '#999',         // Muted text
  border: '#ccc'             // Borders
};
```

### Completion Image (Optional)

```javascript
// Shows when all stickers collected
var COMPLETION_IMAGE = 'https://your-url.com/congrats.png';

// Or leave empty to hide
var COMPLETION_IMAGE = '';
```

## 🧪 Testing

Open your browser console and use these commands:

```javascript
// Reset all progress (start fresh)
resetStickerBook()

// Check current progress
localStorage.getItem('sticker_book_v1')
```

## 🤔 How It Works

### The localStorage Pattern

The sticker book uses **localStorage** to persist progress. Any page on the same domain can read/write to it, which is how progress carries across pages.

### The Visibility Pattern

For single-page apps (like Articulate Rise), the code loads globally but checks every 500ms: "Am I on the target lesson?"

```javascript
setInterval(function() {
  if (isTargetLesson()) {
    container.classList.remove('pp-container-hidden');
  } else {
    container.classList.add('pp-container-hidden');
  }
}, 500);
```

This polling approach handles SPA navigation where pages don't fully reload.

## 📁 Files

| File | Description |
|------|-------------|
| `sticker-book-template.js` | The main template—customize and add to your project |
| `sticker-book-showcase.html` | Interactive demo page |
| `README.md` | You're reading it! |

## 🎨 Customizing the Design

The default styling uses a "zine" aesthetic with torn paper edges, a spiral-bound notebook look, and playful typography. To change this:

1. Find the `var css = \`...\`` section in the code
2. Modify the CSS to match your brand
3. Key classes to customize:
   - `.pp-tab` — The side bookmark tab
   - `.pp-book` — The main sticker book container
   - `.pp-quiz-box` — The quiz modal
   - `.pp-celebrate` — The completion celebration

## 🙋 FAQ

**Q: Will progress sync across devices?**  
A: No. localStorage is browser-specific. If a learner starts on their laptop and switches to their phone, progress won't carry over.

**Q: Can I have more than 5 stickers?**  
A: Yes! Just add more objects to the `STICKERS` array. The grid adjusts automatically.

**Q: Can I remove the quiz requirement?**  
A: The quiz is core to the design (it's what makes it "prove it" vs "claim it"), but you could modify the code to award stickers on click instead.

**Q: Does this report to my LMS?**  
A: Not by default. It's self-contained. You'd need to add xAPI or SCORM calls if you want LMS tracking.

## 📝 License

MIT License — use it, modify it, share it. Attribution appreciated but not required.

## 🙌 Credits

Created by **[Emily Green](https://emilygreendesign.com)** as part of **The People's Professors** capstone project at Full Sail University.

Built through "vibe coding" — trial and error, browser console debugging, and a lot of help from Claude.

---

**Questions or improvements?** Open an issue or submit a PR!
