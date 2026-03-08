// =============================================
// CONFIGURATION
// =============================================
var MODE_SWITCH_COOLDOWN = 1200;
var ERASER_RADIUS = 10;
var SMOOTHING = 0.45;
var SLASH_TRAIL_DURATION = 300;
var FN_INITIAL_SPAWN_INTERVAL = 1800;
var FN_MIN_SPAWN_INTERVAL = 700;
var FN_MISS_LIMIT = 3;

// Colors
var GOLD = '#F5D061';
var CYAN = '#61D4F5';
var RED_ACCENT = '#F56161';
var GREEN_ACCENT = '#61F590';

var FRUIT_TYPES = [
  { color: '#FF4444', light: '#FF8888' },
  { color: '#FF8800', light: '#FFBB44' },
  { color: '#44BB44', light: '#77DD77' },
  { color: '#9944CC', light: '#CC77FF' },
  { color: '#FFDD00', light: '#FFEE66' },
  { color: '#FF6688', light: '#FF99AA' }
];

var TTT_WIN_PATTERNS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];
