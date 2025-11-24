
// main.js - Conceptual Snippet

import * as World from './world.js';
import * as Player from './player.js';
import * as Inventory from './inventory.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Game Setup ---
function initializeGame() {
    World.generate(Date.now()); // Use current time as a simple seed for now
    Player.initialize(World.getSpawnPoint());
    Inventory.setupListeners();
    gameLoop();
}

// --- Main Game Loop ---
function gameLoop(timestamp) {
    // 1. Update Game State
    Player.update();
    // (Other updates like block physics, animation, etc.)

    // 2. Clear and Draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    World.draw(ctx, Player.getCameraPosition());
    Player.draw(ctx);
    Inventory.drawHotbar(ctx);
    Inventory.drawInventory(ctx); // Only draws if Inventory.isOpen is true

    requestAnimationFrame(gameLoop);
}

// Start the game
window.onload = initializeGame;
