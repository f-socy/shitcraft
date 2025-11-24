// /js/player.js - COMPLETE SCRIPT

import * as World from './world.js';
import * as Inventory from './inventory.js';
import * as Mobs from './mobs.js';
import { getBlockInfo, TOOL_DEFINITIONS } from './utils.js';

// --- GAME STATE VARIABLES ---
let canvas;
let ctx;

// Player Position and Dimensions
let player = {
    x: 0,
    y: 0,
    width: 28, // Slightly smaller than TILE_SIZE for movement
    height: 30,
    vy: 0,      // Vertical velocity (for jumping/falling)
    isJumping: false,
    onGround: false,
    
    // Core Progression and Status
    health: 20,
    maxHealth: 20,
    level: 3, // Start at level 3 to test Iron/Diamond tools
};

// Inventory State
let currentHotbarSlot = 0;
let isInventoryOpen = false;

// Time and Rendering
let lastTime = 0;
let FPS = 60;
let frameTime = 1000 / FPS;

// --- INITIALIZATION ---

/**
 * Public function called to set up the game environment.
 * Exported to be called from index.html.
 */
export function initGame() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error("Canvas element 'gameCanvas' not found!");
        return;
    }
    
    // Calculate size based on world dimensions
    const CANVAS_WIDTH = World.WORLD_WIDTH * World.TILE_SIZE;
    const CANVAS_HEIGHT = World.WORLD_HEIGHT * World.TILE_SIZE;
    
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    ctx = canvas.getContext('2d');
    
    // 1. Generate the world
    World.generateWorld(1234, CANVAS_WIDTH, CANVAS_HEIGHT, World.TILE_SIZE);
    
    // 2. Set starting position (above the first piece of air)
    const startX = Math.floor(World.WORLD_WIDTH / 2);
    player.x = startX * World.TILE_SIZE;
    player.y = World.findSurfaceY(startX) * World.TILE_SIZE;
    
    // 3. Initialize Inventory (Give starting items for testing)
    // NOTE: Inventory.initInventory() must be a function in inventory.js
    Inventory.initInventory();
    Inventory.addItemToInventory('PICKAXE_WOOD', 1);
    Inventory.addItemToInventory('AXE_WOOD', 1);
    Inventory.addItemToInventory('DIAMOND', 10);
    Inventory.addItemToInventory('IRON_INGOT', 20);
    Inventory.addItemToInventory('COAL', 5);

    // 4. Set up Input Listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('contextmenu', e => e.preventDefault()); // Prevent right-click menu

    // 5. Start the main game loop
    console.log(`Game initialized. Player starting at X:${player.x}, Y:${player.y}`);
    requestAnimationFrame(gameLoop);
}

// --- GAME LOOP ---

function gameLoop(timestamp) {
    if (timestamp < lastTime + frameTime) {
        requestAnimationFrame(gameLoop);
        return;
    }
    const delta = (timestamp - lastTime) / 1000; // Time in seconds
    lastTime = timestamp;

    // 1. Update Game State
    updatePlayer(delta);
    World.updateBlockBreaks(delta);
    World.updateFurnaces(delta);
    Mobs.updateMobs(delta);

    // 2. Render everything
    render();
    
    requestAnimationFrame(gameLoop);
}

// --- UPDATE LOGIC ---

function updatePlayer(delta) {
    // 1. Apply Gravity
    const gravity = 1200; // Pixels per second squared
    player.vy += gravity * delta;
    
    // 2. Calculate New Position
    const newY = player.y + player.vy * delta;
    const newX = player.x;

    // 3. Collision Detection (Y-axis)
    const blockBottomY = Math.floor((newY + player.height) / World.TILE_SIZE);
    const blockMidX = Math.floor((player.x + player.width / 2) / World.TILE_SIZE);
    
    const blockBelow = World.worldMap[blockMidX] ? getBlockInfo(World.worldMap[blockMidX][blockBottomY]) : null;

    if (blockBelow && blockBelow.type === 'BLOCK' && newY + player.height > blockBottomY * World.TILE_SIZE) {
        player.onGround = true;
        player.vy = 0;
        player.y = (blockBottomY * World.TILE_SIZE) - player.height;
    } else {
        player.onGround = false;
        player.y = newY;
    }
    
    // Temporary Screen Bounds Check
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
        player.vy = 0;
        player.onGround = true;
    }
    
    // Horizontal Movement (Simple implementation)
    // NOTE: This should ideally be moved to an input buffer and updated with delta time
    // For now, we only update position in handleKeyDown
}

// --- RENDERING ---

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw World
    drawWorld();

    // 2. Draw Mobs
    // NOTE: Mobs.drawMobs(ctx, World.TILE_SIZE) must be defined in mobs.js
    if (Mobs.drawMobs) Mobs.drawMobs(ctx, World.TILE_SIZE);

    // 3. Draw Player
    drawPlayer();

    // 4. Draw HUD/UI (Health, Hotbar, Inventory)
    drawHUD();
}

function drawWorld() {
    const T = World.TILE_SIZE;
    
    for (let x = 0; x < World.WORLD_WIDTH; x++) {
        for (let y = 0; y < World.WORLD_HEIGHT; y++) {
            const blockId = World.worldMap[x][y];
            const info = getBlockInfo(blockId);

            if (blockId !== 'AIR' && blockId !== 'WATER') {
                ctx.fillStyle = info.color;
                ctx.fillRect(x * T, y * T, T, T);

                // Draw breaking animation
                const breakState = World.getBreakState(x, y);
                if (breakState > 0) {
                    ctx.globalAlpha = breakState * 0.7; // Fade effect
                    ctx.fillStyle = 'rgba(255, 255, 255)';
                    ctx.fillRect(x * T, y * T, T, T);
                    ctx.globalAlpha = 1.0;
                }
            } else if (blockId === 'WATER') {
                ctx.fillStyle = info.color;
                ctx.fillRect(x * T, y * T, T, T * 0.7); 
            }
        }
    }
}

function drawPlayer() {
    // Player body
    ctx.fillStyle = '#FF0000'; // Red for the player cube
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Player center dot
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(player.x + player.width/2 - 2, player.y + player.height/2 - 2, 4, 4);

    // Draw the currently selected tool (Simple visualization)
    const selectedItem = Inventory.getHotbarItem(currentHotbarSlot);
    if (selectedItem && getBlockInfo(selectedItem.id).type === 'TOOL') {
        const toolInfo = TOOL_DEFINITIONS[selectedItem.id];
        ctx.fillStyle = toolInfo.color;
        // Draw a small icon near the player's hand
        ctx.fillRect(player.x + player.width, player.y + player.height/4, 8, 8);
    }
}

function drawHUD() {
    const T = World.TILE_SIZE;
    
    // --- Draw Health Bar (Top Left) ---
    const healthBarWidth = 150;
    const healthPercent = player.health / player.maxHealth;
    ctx.fillStyle = '#000000';
    ctx.fillRect(10, 10, healthBarWidth, 20);
    ctx.fillStyle = healthPercent > 0.3 ? '#00FF00' : '#FFD700';
    ctx.fillRect(10, 10, healthBarWidth * healthPercent, 20);
    ctx.strokeStyle = '#FFFFFF';
    ctx.strokeRect(10, 10, healthBarWidth, 20);
    
    // --- Draw Hotbar (Bottom Center) ---
    const hotbarY = canvas.height - T * 1.5;
    const hotbarStart = (canvas.width / 2) - (9 * T / 2);
    
    for (let i = 0; i < 9; i++) {
        const x = hotbarStart + i * T;
        const item = Inventory.getHotbarItem(i);
        const info = item ? getBlockInfo(item.id) : null;
        
        // Slot Background
        ctx.fillStyle = '#333333';
        ctx.fillRect(x, hotbarY, T - 2, T - 2);
        ctx.strokeStyle = i === currentHotbarSlot ? '#FFD700' : '#888888';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, hotbarY, T - 2, T - 2);
        
        // Item Icon and Count
        if (info) {
            ctx.fillStyle = info.color;
            ctx.fillRect(x + 4, hotbarY + 4, T - 10, T - 10);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '10px Arial';
            ctx.fillText(item.count, x + T - 15, hotbarY + T - 5);
        }
    }
    
    // --- Draw Inventory Screen (if open) ---
    if (isInventoryOpen) {
        // NOTE: Inventory.drawInventoryScreen must be defined in inventory.js
        if (Inventory.drawInventoryScreen) Inventory.drawInventoryScreen(ctx, canvas.width, canvas.height, player.level);
    }
}

// --- INPUT HANDLERS ---

function handleKeyDown(e) {
    // 1. Inventory Toggle (E)
    if (e.key === 'e' || e.key === 'E') {
        isInventoryOpen = !isInventoryOpen;
        // NOTE: Inventory.openInventory must be defined in inventory.js
        if (isInventoryOpen && Inventory.openInventory) {
            Inventory.openInventory(player.level);
        }
        return;
    }

    if (isInventoryOpen) {
        return;
    }
    
    // 2. Movement (WASD)
    const moveSpeed = 10; // Simple pixel movement per key press (for demo)
    
    if (e.key === 'a' || e.key === 'A') {
        player.x -= moveSpeed; 
    }
    if (e.key === 'd' || e.key === 'D') {
        player.x += moveSpeed;
    }
    
    // 3. Jump (Spacebar)
    if (e.key === ' ' && player.onGround) {
        player.vy = -500;
        player.isJumping = true;
        player.onGround = false;
    }
    
    // 4. Hotbar Selection (1-9)
    const slot = parseInt(e.key);
    if (!isNaN(slot) && slot >= 1 && slot <= 9) {
        currentHotbarSlot = slot - 1;
    }
}

function handleKeyUp(e) {
    // Left empty for simple movement control
}

function handleMouseDown(e) {
    if (isInventoryOpen) {
        // NOTE: Inventory.handleClick must be defined in inventory.js
        if (Inventory.handleClick) Inventory.handleClick(e.offsetX, e.offsetY, player.level);
        return;
    }
    
    const clickX = e.offsetX;
    const clickY = e.offsetY;
    const blockGridX = Math.floor(clickX / World.TILE_SIZE);
    const blockGridY = Math.floor(clickY / World.TILE_SIZE);
    const selectedItem = Inventory.getHotbarItem(currentHotbarSlot);
    
    if (e.button === 0) { // Left Click (Mine/Break)
        World.startBlockBreak(blockGridX, blockGridY, selectedItem, player.level);
    } else if (e.button === 2) { // Right Click (Place/Interact)
        World.placeOrInteract(blockGridX, blockGridY, selectedItem);
    }
}

function handleMouseUp(e) {
    if (e.button === 0) {
        World.stopBlockBreak();
    }
}

// --- EXPORTS ---
export { player, currentHotbarSlot };
