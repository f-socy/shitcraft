// /js/player.js - UPDATED
import { getBlockAt, updateBlockBreak, startBlockBreak, stopBlockBreak, placeBlock } from './world.js';
import * as Inventory from './inventory.js'; 

let player = {
    x: 0, y: 0, width: 20, height: 40,
    moveSpeed: 200, velX: 0, velY: 0,
    isJumping: false, gravity: 800, jumpForce: 400,
    health: 20
};

let keyState = {};
let TILE_SIZE = 32;
let isBreaking = false;
let targetBlock = null;

export function initPlayer(startX, startY, tileSize) {
    player.x = startX;
    player.y = startY;
    TILE_SIZE = tileSize;
    document.onmousedown = handleMouseInput;
    document.onmouseup = handleMouseInput;
}

export function getPlayerState() { return player; }
export function loadPlayerState(state) { player = state; }

export function handleInput(event) {
    keyState[event.key.toLowerCase()] = (event.type === 'keydown');

    if (event.type === 'keydown') {
        if (event.key.toLowerCase() === ' ') { // Jump
            if (!player.isJumping) {
                player.velY = -player.jumpForce;
                player.isJumping = true;
            }
        }
        if (event.key.toLowerCase() === 'e') {
            Inventory.toggleInventory();
        }
    }
}

function handleMouseInput(event) {
    const worldX = player.x + (event.clientX - window.innerWidth / 2);
    const worldY = player.y + (event.clientY - window.innerHeight / 2);
    const block = getBlockAt(worldX, worldY);
    targetBlock = block; // Store the block for continuous breaking in updatePlayer

    if (!block) return;

    if (event.type === 'mousedown') {
        if (event.button === 0) { // Left Click (Start Breaking)
            isBreaking = true;
            startBlockBreak(block.x, block.y);
        } else if (event.button === 2) { // Right Click (Placing/Interacting)
            event.preventDefault(); // Stop context menu
            const item = Inventory.getSelectedItem();
            if (item && item.type === 'BLOCK') {
                placeBlock(block.x, block.y, item.id);
                // Deduct item (TODO: implement in Inventory)
            } else if (item && item.type === 'INTERACTABLE') {
                // E.g., Open furnace or crafting table UI
            }
        }
    } else if (event.type === 'mouseup') {
        if (event.button === 0) { // Left Click (Stop Breaking)
            isBreaking = false;
            stopBlockBreak(block.x, block.y);
        }
    }
}

export function updatePlayer(deltaTime) {
    // --- Movement Physics (Same as before) ---
    player.velX = 0;
    if (keyState['a']) player.velX = -player.moveSpeed;
    if (keyState['d']) player.velX = player.moveSpeed;
    if (player.isJumping || player.velY < 0) player.velY += player.gravity * deltaTime;

    const newX = player.x + player.velX * deltaTime;
    const newY = player.y + player.velY * deltaTime;
    
    // Basic Collision Checks (You need full-featured collision logic here)
    // Horizontal Check
    if (!getBlockAt(newX + player.width / 2, player.y + player.height / 2)) {
        player.x = newX;
    }
    // Vertical Check
    let blockBelow = getBlockAt(player.x, player.y + player.height + 1);
    if (blockBelow && blockBelow.id !== 'AIR') {
        player.y = blockBelow.y * TILE_SIZE - player.height;
        player.velY = 0;
        player.isJumping = false;
    } else {
        player.y = newY;
        player.isJumping = true;
    }

    // --- Block Breaking Update ---
    if (isBreaking && targetBlock) {
        updateBlockBreak(targetBlock.x, targetBlock.y, deltaTime);
    }
}

export function drawPlayer(ctx, tileSize, cameraX, cameraY) {
    const screenX = player.x + cameraX;
    const screenY = player.y + cameraY;
    
    ctx.fillStyle = 'red'; 
    ctx.fillRect(screenX, screenY, player.width, player.height);
}
