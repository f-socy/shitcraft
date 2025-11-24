// /js/player.js

import { getBlockAt, removeBlock } from './world.js';

let player = {
    x: 0,
    y: 0,
    width: 20,
    height: 40,
    moveSpeed: 200, // pixels per second
    velX: 0,
    velY: 0,
    isJumping: false,
    gravity: 800,
    jumpForce: 400
};

let keyState = {};
let TILE_SIZE = 32;

export function initPlayer(startX, startY, tileSize) {
    player.x = startX;
    player.y = startY;
    TILE_SIZE = tileSize;
}

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
            // Placeholder for inventory toggle
            console.log("Inventory Toggled (Not Implemented Yet)");
        }
    }
}

export function updatePlayer(deltaTime) {
    // --- Movement ---
    player.velX = 0;
    if (keyState['a']) {
        player.velX = -player.moveSpeed;
    }
    if (keyState['d']) {
        player.velX = player.moveSpeed;
    }

    // Apply Gravity
    if (player.isJumping || player.velY < 0) {
         player.velY += player.gravity * deltaTime;
    }
    
    // Apply velocity to position
    player.x += player.velX * deltaTime;
    player.y += player.velY * deltaTime;
    
    // --- Collision Detection (Simplified) ---
    let blockBelow = getBlockAt(player.x, player.y + player.height + 1);
    
    if (blockBelow && blockBelow.id !== '0') {
        // Simple grounding logic: snap to the top of the block
        player.y = blockBelow.y * TILE_SIZE - player.height;
        player.velY = 0;
        player.isJumping = false;
    } else {
        // Check if player should start falling if not on the ground
        player.isJumping = true;
    }
    
    // --- Block Breaking/Placing (Left/Right Click) ---
    document.onmousedown = function(event) {
        const worldX = player.x + (event.clientX - window.innerWidth / 2);
        const worldY = player.y + (event.clientY - window.innerHeight / 2);
        
        const targetBlock = getBlockAt(worldX, worldY);
        
        if (targetBlock && event.button === 0) { // Left Click (Break)
            console.log(`Broke block: ${targetBlock.properties.name}`);
            removeBlock(targetBlock.x, targetBlock.y);
        }
        // Right click (Place) would be implemented here
    };

    return player;
}

export function drawPlayer(ctx, tileSize, cameraX, cameraY) {
    const screenX = player.x + cameraX;
    const screenY = player.y + cameraY;
    
    ctx.fillStyle = 'red'; // Player color
    ctx.fillRect(screenX, screenY, player.width, player.height);
}

export function updatePlayer() {
    // ... (rest of the update logic)
    return player; // Must return the player object for the main loop to get camera position
}
