// /js/player.js - COMPLETE SCRIPT

import * as World from './world.js';
import * as Inventory from './inventory.js';
import * as Mobs from './mobs.js';
import { getBlockInfo, TOOL_DEFINITIONS } from './utils.js';

// --- GAME STATE VARIABLES ---
let canvas;
let ctx;
// ... (Player definition and game state variables are the same)
let player = {
    x: 0,
    y: 0,
    width: 28, 
    height: 30,
    vy: 0,     
    isJumping: false,
    onGround: false,
    health: 20,
    maxHealth: 20,
    level: 3, 
};
let currentHotbarSlot = 0;
let isInventoryOpen = false;
let lastTime = 0;
let FPS = 60;
let frameTime = 1000 / FPS;


// --- INITIALIZATION ---

export function initGame() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error("Canvas element 'gameCanvas' not found!");
        return;
    }
    
    const CANVAS_WIDTH = World.WORLD_WIDTH * World.TILE_SIZE;
    const CANVAS_HEIGHT = World.WORLD_HEIGHT * World.TILE_SIZE;
    
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    ctx = canvas.getContext('2d');
    
    // 1. Generate the world
    World.generateWorld(1234, CANVAS_WIDTH, CANVAS_HEIGHT, World.TILE_SIZE);
    
    // 2. Set starting position
    const startX = Math.floor(World.WORLD_WIDTH / 2);
    player.x = startX * World.TILE_SIZE;
    player.y = World.findSurfaceY(startX) * World.TILE_SIZE;
    
    // 3. Initialize Inventory (This is the line that was failing!)
    Inventory.initInventory(); // <-- NOW IT SHOULD WORK

    // Give starting items for testing
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
    canvas.addEventListener('contextmenu', e => e.preventDefault()); 

    // 5. Start the main game loop
    console.log(`Game initialized. Player starting at X:${player.x}, Y:${player.y}`);
    requestAnimationFrame(gameLoop);
}

// --- GAME LOOP (Same as before) ---
function gameLoop(timestamp) {
    if (timestamp < lastTime + frameTime) {
        requestAnimationFrame(gameLoop);
        return;
    }
    const delta = (timestamp - lastTime) / 1000; 
    lastTime = timestamp;

    updatePlayer(delta);
    World.updateBlockBreaks(delta);
    World.updateFurnaces(delta);
    if (Mobs.updateMobs) Mobs.updateMobs(delta); // Check for existence
    
    render();
    
    requestAnimationFrame(gameLoop);
}

// --- UPDATE LOGIC (Same as before) ---
function updatePlayer(delta) {
    const gravity = 1200; 
    player.vy += gravity * delta;
    const newY = player.y + player.vy * delta;
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
    
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
        player.vy = 0;
        player.onGround = true;
    }
}

// --- RENDERING (Same as before) ---
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawWorld();
    if (Mobs.drawMobs) Mobs.drawMobs(ctx, World.TILE_SIZE);
    drawPlayer();
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
                const breakState = World.getBreakState(x, y);
                if (breakState > 0) {
                    ctx.globalAlpha = breakState * 0.7; 
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
    ctx.fillStyle = '#FF0000'; 
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(player.x + player.width/2 - 2, player.y + player.height/2 - 2, 4, 4);
    const selectedItem = Inventory.getHotbarItem(currentHotbarSlot);
    if (selectedItem && getBlockInfo(selectedItem.id).type === 'TOOL') {
        const toolInfo = TOOL_DEFINITIONS[selectedItem.id];
        ctx.fillStyle = toolInfo.color;
        ctx.fillRect(player.x + player.width, player.y + player.height/4, 8, 8);
    }
}

function drawHUD() {
    const T = World.TILE_SIZE;
    const healthBarWidth = 150;
    const healthPercent = player.health / player.maxHealth;
    ctx.fillStyle = '#000000';
    ctx.fillRect(10, 10, healthBarWidth, 20);
    ctx.fillStyle = healthPercent > 0.3 ? '#00FF00' : '#FFD700';
    ctx.fillRect(10, 10, healthBarWidth * healthPercent, 20);
    ctx.strokeStyle = '#FFFFFF';
    ctx.strokeRect(10, 10, healthBarWidth, 20);
    const hotbarY = canvas.height - T * 1.5;
    const hotbarStart = (canvas.width / 2) - (9 * T / 2);
    
    for (let i = 0; i < 9; i++) {
        const x = hotbarStart + i * T;
        const item = Inventory.getHotbarItem(i);
        const info = item ? getBlockInfo(item.id) : null;
        ctx.fillStyle = '#333333';
        ctx.fillRect(x, hotbarY, T - 2, T - 2);
        ctx.strokeStyle = i === currentHotbarSlot ? '#FFD700' : '#888888';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, hotbarY, T - 2, T - 2);
        if (info) {
            ctx.fillStyle = info.color;
            ctx.fillRect(x + 4, hotbarY + 4, T - 10, T - 10);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '10px Arial';
            ctx.fillText(item.count, x + T - 15, hotbarY + T - 5);
        }
    }
    
    if (isInventoryOpen) {
        if (Inventory.drawInventoryScreen) Inventory.drawInventoryScreen(ctx, canvas.width, canvas.height, player.level);
    }
}

// --- INPUT HANDLERS (Same as before) ---
function handleKeyDown(e) {
    if (e.key === 'e' || e.key === 'E') {
        isInventoryOpen = !isInventoryOpen;
        if (isInventoryOpen && Inventory.openInventory) {
            Inventory.openInventory(player.level);
        }
        return;
    }
    if (isInventoryOpen) return;
    
    const moveSpeed = 10;
    if (e.key === 'a' || e.key === 'A') {
        player.x -= moveSpeed; 
    }
    if (e.key === 'd' || e.key === 'D') {
        player.x += moveSpeed;
    }
    
    if (e.key === ' ' && player.onGround) {
        player.vy = -500;
        player.isJumping = true;
        player.onGround = false;
    }
    
    const slot = parseInt(e.key);
    if (!isNaN(slot) && slot >= 1 && slot <= 9) {
        currentHotbarSlot = slot - 1;
    }
}

function handleKeyUp(e) {}

function handleMouseDown(e) {
    if (isInventoryOpen) {
        if (Inventory.handleClick) Inventory.handleClick(e.offsetX, e.offsetY, player.level);
        return;
    }
    
    const clickX = e.offsetX;
    const clickY = e.offsetY;
    const blockGridX = Math.floor(clickX / World.TILE_SIZE);
    const blockGridY = Math.floor(clickY / World.TILE_SIZE);
    const selectedItem = Inventory.getHotbarItem(currentHotbarSlot);
    
    if (e.button === 0) { 
        World.startBlockBreak(blockGridX, blockGridY, selectedItem, player.level);
    } else if (e.button === 2) { 
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
