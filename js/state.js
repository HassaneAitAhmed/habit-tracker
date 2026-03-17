const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const EMOJIS = [
  '⏰','🧘','💪','🚿','💼','📚','🎯','🚫','🍵','📝',
  '😴','🏃','🎵','✍️','🌿','💧','🧹','🍎','🌅','🦷',
  '🧠','☕','🎨','🤸','🌙'
];

const COLORS = [
  '#C4924A','#3B6D11','#4A3F2F','#185FA5','#993556',
  '#3B6D8A','#8A3B6D','#6D8A3B','#D85A30','#5B4A8A'
];

const QUOTES = [
  "The man who wakes up at 5AM owns the day before anyone else opens their eyes.",
  "Cold water. Hot iron. Clear mind. That's the formula.",
  "You don't rise to the level of your goals. You fall to the level of your systems.",
  "Every rep you skip, someone else didn't.",
  "Discipline is freedom. Chaos is a cage.",
  "The shower is cold for a reason. So are your mornings.",
  "Your future self is watching you right now. Don't embarrass him.",
  "Motivation is a lie. Build the habit. Then you don't need it.",
  "Pain today. Power tomorrow.",
  "While they sleep, you grind. While they doubt, you build.",
  "The only bad workout is the one that didn't happen.",
  "Hard choices, easy life. Easy choices, hard life.",
  "The gym doesn't care how you feel. Neither should you.",
  "Iron doesn't negotiate. Neither does your alarm clock.",
  "Small wins compound. Show up every single day.",
];

let today      = new Date();
let viewYear   = today.getFullYear();
let viewMonth  = today.getMonth();
let jYear      = today.getFullYear();
let jMonth     = today.getMonth();
let jDay       = today.getDate();
let quoteIdx   = Math.floor(Math.random() * QUOTES.length);

let currentUser = null;
let authMode    = 'login';

let selectedEmoji     = EMOJIS[0];
let selectedColor     = COLORS[0];
let editingHabitId    = null;
let noteModalHabitId  = null;

let habits     = [];
let categories = [];
let checks     = {};   
let moods      = {};   
let notes      = {};   
let settings   = { dark: false, theme: 'light', reminder: false, reminderTime: '20:00' };
