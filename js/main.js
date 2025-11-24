// /js/main.js
import { initWorld, drawWorld, generateWorld } from './world.js';
import { initPlayer, updatePlayer, drawPlayer, handleInput } from './player.js';

// --- Constants ---
const TILE_SIZE = 32;
const GAME_SPEED = 60; // FPS target

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let lastTime = 0;
let deltaTime = 0;

// Set up canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- Initialization ---
function initializeGame() {
    const seed = 12345; // Fixed seed for reproducible terrain
    generateWorld(seed, canvas.width, canvas.height, TILE_SIZE);
    
    // Player starts near the center top
    const startX = Math.floor(canvas.width / 2 / TILE_SIZE);
    const startY = 10; 
    initPlayer(startX * TILE_SIZE, startY * TILE_SIZE, TILE_SIZE);
    
    window.addEventListener('keydown', handleInput);
    window.addEventListener('keyup', handleInput);
    
    requestAnimationFrame(gameLoop);
}

// --- Main Loop ---
function gameLoop(currentTime) {
    if (currentTime) {
        deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;
    }

    // 1. Update
    updatePlayer(deltaTime);
    
    // 2. Render
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const cameraX = -updatePlayer().x + canvas.width / 2; // Simple camera follow
    const cameraY = -updatePlayer().y + canvas.height / 2;
    
    drawWorld(ctx, TILE_SIZE, cameraX, cameraY);
    drawPlayer(ctx, TILE_SIZE, cameraX, cameraY);
    
    requestAnimationFrame(gameLoop);
}

initializeGame();
