// /js/player.js - COMPLETE SCRIPT
import * as World from './world.js';
import * as Inventory from './inventory.js'; 
import { getBlockAt, updateBlockBreak, startBlockBreak, stopBlockBreak, placeBlock } from './world.js';

let player = {
    x: 0, y: 0, width: 20, height: 40,
    moveSpeed: 200, velX: 0, velY: 0,
    isJumping: false, gravity: 800, jumpForce: 400,
    maxHealth: 20, health: 20, 
    armor: { helmet: null, chestplate: null, leggings: null, boots: null } // Added Armor Slots
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
    // Set up right-click prevention for placing blocks
    document.oncontextmenu = (e) => e.preventDefault();
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
    targetBlock = block; 

    if (!block) return;

    if (event.type === 'mousedown') {
        if (event.button === 0) { // Left Click (Start Breaking)
            isBreaking = true;
            startBlockBreak(block.x, block.y);
        } else if (event.button === 2) { // Right Click (Placing/Interacting)
            event.preventDefault(); 
            
            if (block.id === 'FURNACE' || block.id === 'CRAFTING_TABLE') {
                // Open the interactable block's UI/state
                World.openFurnace(block.x, block.y); 
                console.log(`${block.id} opened.`);
                return;
            }
            
            const item = Inventory.getSelectedItem();
            if (item && item.type === 'BLOCK') {
                // Find block position slightly away from current block if player is inside it
                const placeX = block.x;
                const placeY = block.y;
                placeBlock(placeX, placeY, item.id);
                // TODO: Deduct item from inventory
            }
        }
    } else if (event.type === 'mouseup') {
        if (event.button === 0) { // Left Click (Stop Breaking)
            isBreaking = false;
            World.stopBlockBreak(block.x, block.y);
        }
    }
}

export function updatePlayer(deltaTime) {
    let currentMoveSpeed = player.moveSpeed;
    let currentJumpForce = player.jumpForce;
    
    // Check if player is submerged in water
    const blockAtHead = getBlockAt(player.x, player.y);
    const blockAtChest = getBlockAt(player.x, player.y + player.height / 2);
    
    if (blockAtHead && blockAtHead.id === 'WATER' || blockAtChest && blockAtChest.id === 'WATER') {
        currentMoveSpeed *= 0.3; // 70% speed reduction in water
        currentJumpForce *= 0.5; // Reduced jump height
        player.gravity = 400; // Half gravity in water
        player.velY *= 0.9; // Friction
    } else {
        player.gravity = 800; // Normal gravity
    }

    // --- Movement Physics ---
    player.velX = 0;
    if (keyState['a']) player.velX = -currentMoveSpeed;
    if (keyState['d']) player.velX = currentMoveSpeed;

    if (keyState[' '] && !player.isJumping) {
        player.velY = -currentJumpForce;
        player.isJumping = true;
    }

    if (player.isJumping || player.velY < 0) {
        player.velY += player.gravity * deltaTime;
    }

    // Apply velocity to new position
    const newX = player.x + player.velX * deltaTime;
    const newY = player.y + player.velY * deltaTime;
    
    // Basic Collision Checks
    // ... (This logic is complex and needs refinement, but we reuse the old logic here)
    player.x = newX;
    
    let blockBelow = getBlockAt(player.x, player.y + player.height + 1);
    if (blockBelow && blockBelow.id !== 'AIR' && blockBelow.id !== 'WATER') {
        player.y = blockBelow.y * TILE_SIZE - player.height;
        player.velY = 0;
        player.isJumping = false;
    } else {
        player.y = newY;
        player.isJumping = true;
    }

    // --- Block Breaking Update ---
    if (isBreaking && targetBlock) {
        World.updateBlockBreak(targetBlock.x, targetBlock.y, deltaTime);
    }
}

export function takeDamage(damage) {
    // Basic damage reduction based on armor
    let defense = 0;
    const armorPieces = Object.values(player.armor).filter(a => a);
    
    for (const piece of armorPieces) {
        defense += piece.defense || 0;
    }
    
    // Simple damage formula: damage reduced by defense value
    const finalDamage = Math.max(1, damage - defense);
    
    player.health -= finalDamage;
    if (player.health <= 0) {
        player.health = 0;
        console.log("Player Died! Needs Respawn.");
    }
}

export function drawPlayer(ctx, tileSize, cameraX, cameraY) {
    const screenX = player.x + cameraX;
    const screenY = player.y + cameraY;
    
    ctx.fillStyle = 'red'; 
    ctx.fillRect(screenX, screenY, player.width, player.height);
    
    // --- Draw Health Bar (Screen Space) ---
    const barWidth = 100;
    const barHeight = 10;
    const barX = ctx.canvas.width - barWidth - 20;
    const barY = 20;
    const currentHealthRatio = player.health / player.maxHealth;
    
    ctx.strokeStyle = 'black';
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    ctx.fillStyle = 'red';
    ctx.fillRect(barX, barY, barWidth * currentHealthRatio, barHeight);
    
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText(`HP: ${player.health}/${player.maxHealth}`, barX, barY - 5);
}
