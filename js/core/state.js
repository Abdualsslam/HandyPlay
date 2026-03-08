// =============================================
// STATE VARIABLES
// =============================================
var vid = document.getElementById('vid');
var c = document.getElementById('c');
var ctx = c.getContext('2d');

var MODE = 'MENU'; // DRAWING, MENU, FRUIT_NINJA, TIC_TAC_TOE
var modeSwitchTime = 0;

// Cursors (support up to 2 hands)
var numHands = 0;
var handDetected = false;
var P = [
    { sx: null, sy: null, isPinching: false, wasPinching: false, pinchJustPressed: false, isDraw: false, drawCur: [] },
    { sx: null, sy: null, isPinching: false, wasPinching: false, pinchJustPressed: false, isDraw: false, drawCur: [] }
];

// Drawing state
var drawStrokes = [];
var drawColor = '#F5D061'; // Defaults to GOLD

// Fruit Ninja state
var fnFruits = [];
var fnParticles = [];
var fnSlashTrail = [];
var fnScore = 0;
var fnLives = 3;
var fnLevel = 1;
var fnScoreToNext = 10;
var fnMissCount = 0;
var fnGameOver = false;
var fnLastSpawn = 0;
var fnStartTime = 0;
var fnSpawnInterval = FN_INITIAL_SPAWN_INTERVAL;
var fnStarted = false;
var fnCountdown = 0;
var fnCountdownStart = 0;

// Tic-Tac-Toe state
var tttBoard = [null, null, null, null, null, null, null, null, null];
var tttPlayer = 'X';
var tttWinner = null;
var tttWinPattern = null;
var tttDraw = false;
var tttGameOver = false;
var tttHoveredCell = -1;
var tttLastPlaceTime = 0;
var tttPlaceAnim = [];

// Buttons
var buttons = {};

// Target Shooter state
var tsTargets = [];
var tsParticles = [];
var tsScore = 0;
var tsLives = 5;
var tsGameOver = false;
var tsStarted = false;
var tsCountdownStart = 0;
var tsStartTime = 0;
var tsLastSpawn = 0;
var tsCombo = 0;
var tsBestCombo = 0;
var tsLevel = 1;
var tsTargetsHit = 0;

// Pictionary state
var picStrokes = [];
var picCurStroke = [];
var picWord = '';
var picWordRevealed = false;
var picPhase = 'LOBBY';
var picTimer = 0;
var picTimerStart = 0;
var picRoundTime = 60;
var picCorrect = false;
var picDrawerHand = 0;

// AI Draw & Guess state
var aiStrokes = [];
var aiCurStroke = [];
var aiGuess = '';
var aiGuessIcon = '';
var aiConfidence = 0;
var aiGuesses = [];
var aiScore = 0;
var aiRound = 0;
var aiMaxRounds = 10;
var aiPhase = 'READY';
var aiTarget = '';
var aiTargetIcon = '';
var aiRoundStart = 0;
var aiDrawTime = 10;
var aiCorrectCount = 0;
var aiUsedTargets = [];

// Air Band state
var abInstrument = 'drums';
var abPadHits = [];
var abRipples = [];
var abPhase = 'PLAYING';

// Pong state
var pongBallX = 0, pongBallY = 0;
var pongBallVX = 0, pongBallVY = 0;
var pongPaddle1Y = 0, pongPaddle2Y = 0;
var pongScore1 = 0, pongScore2 = 0;
var pongGameOver = false;
var pongWinner = 0;
var pongStarted = false;
var pongCountdownStart = 0;
var pongParticles = [];
var pongBallTrail = [];
var pongLastTime = 0;
var pongServeDir = 1;
