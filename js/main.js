// /js/main.js - COMPLETE SCRIPT
import * as World from './world.js';
import * as Player from './player.js';
import * as Inventory from './inventory.js';
import * as Mobs from './mobs.js';

// --- Constants ---
const TILE_SIZE = 32;
const GAME_SPEED = 60; // FPS target

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let lastTime = 0;
let deltaTime = 0;
let gameTime = 0; // Total seconds the game has been running
const DAY_LENGTH_SECONDS = 300; // 5 minutes for a full day/night cycle

// Set up canvas dimensions and resize listener
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// --- Initialization ---
function initializeGame() {
    // 1. Load or Generate World
    if (World.loadGameState()) {
        console.log("Game state loaded from local storage.");
    } else {
        // Generate a new world based on a random seed
        const seed = Math.floor(Math.random() * 1000000); 
        World.generateWorld(seed, canvas.width, canvas.height, TILE_SIZE);
        
        // Initial spawn (find a safe spot)
        const startX = Math.floor(World.WORLD_WIDTH / 2);
        const startY = World.findSurfaceY(startX);
        Player.initPlayer(startX * TILE_SIZE, startY * TILE_SIZE, TILE_SIZE);
        
        // Populate initial mobs (for a new world)
        Mobs.spawnMobs(World.WORLD_WIDTH, World.WORLD_HEIGHT, TILE_SIZE); 
        console.log(`New world generated with seed: ${seed}`);
    }

    Inventory.setupListeners();
    window.addEventListener('keydown', Player.handleInput);
    window.addEventListener('keyup', Player.handleInput);
    
    requestAnimationFrame(gameLoop);
}

// --- Main Game Loop ---
function gameLoop(currentTime) {
    if (currentTime) {
        deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;
        gameTime += deltaTime;
    }

    // --- 1. Update Game State ---
    
    // Day/Night Cycle calculation
    const cycleProgress = (gameTime % DAY_LENGTH_SECONDS) / DAY_LENGTH_SECONDS; // 0.0 to 1.0
    
    Player.updatePlayer(deltaTime);
    Mobs.updateMobs(deltaTime, cycleProgress, Player.getPlayerState());
    World.updateFurnaces(deltaTime); 
    
    // Save game state periodically (e.g., every 10 seconds)
    if (Math.floor(gameTime) % 10 === 0 && Math.floor(gameTime) !== Math.floor(gameTime - deltaTime)) {
        World.saveGameState(Player.getPlayerState(), Mobs.getAllMobs());
    }

    // --- 2. Render ---
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const playerState = Player.getPlayerState();
    const cameraX = -playerState.x + canvas.width / 2; 
    const cameraY = -playerState.y + canvas.height / 2;
    
    World.drawWorld(ctx, TILE_SIZE, cameraX, cameraY, cycleProgress); // Pass cycle for tinting
    Mobs.drawMobs(ctx, TILE_SIZE, cameraX, cameraY);
    Player.drawPlayer(ctx, TILE_SIZE, cameraX, cameraY);
    Inventory.drawUI(ctx, canvas.width, canvas.height); // Draw hotbar/inventory

    requestAnimationFrame(gameLoop);
}

initializeGame();
