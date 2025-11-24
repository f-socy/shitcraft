// /js/player.js - COMPLETE SCRIPT (Leveling and XP)
import * as World from './world.js';
import * as Inventory from './inventory.js'; 
import { getBlockAt, updateBlockBreak, startBlockBreak, stopBlockBreak, placeBlock } from './world.js';
import { getBlockInfo } from './utils.js';

let player = {
    x: 0, y: 0, width: 20, height: 40,
    moveSpeed: 200, velX: 0, velY: 0,
    isJumping: false, gravity: 800, jumpForce: 400,
    maxHealth: 20, health: 20, 
    maxHunger: 20, hunger: 20, 
    hungerDrainTimer: 0,
    armor: { helmet: null, chestplate: null, leggings: null, boots: null },
    // NEW: Leveling System
    level: 0,
    xp: 0,
    xpToNextLevel: 10 // Start with 10 XP needed
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
            
            if (block.id === 'FURNACE' || block.id === 'CRAFTING_TABLE' || block.id === 'LOOT_CHEST') {
                World.openInteractable(block.x, block.y, block.id);
                Inventory.toggleInventory();
                return;
            }
            
            const item = Inventory.getSelectedItem();
            if (item) {
                // Check for tool level gate (prevents placing blocks that act as tools)
                if (item.type === 'TOOL' && item.requiredLevel > player.level) {
                     console.log(`Requires Level ${item.requiredLevel} to use this tool!`);
                     return;
                }
                
                if (item.type === 'BLOCK') {
                    const placeX = block.x;
                    const placeY = block.y;
                    placeBlock(placeX, placeY, item.id);
                    // TODO: Deduct item from inventory
                } else if (item.type === 'FOOD') {
                    consumeItem();
                } else if (item.type === 'ARMOR') {
                    equipArmor(item);
                    // TODO: Deduct item from inventory
                }
            }
        }
    } else if (event.type === 'mouseup') {
        if (event.button === 0) { // Left Click (Stop Breaking)
            isBreaking = false;
            World.stopBlockBreak(block.x, block.y);
        }
    }
}

function consumeItem() {
    const item = Inventory.getSelectedItem();
    if (item && item.type === 'FOOD') {
        player.hunger = Math.min(player.maxHunger, player.hunger + item.restoresHunger);
        player.health = Math.min(player.maxHealth, player.health + 4); 
        // TODO: Remove item from inventory
    }
}

export function equipArmor(armorItem) {
    if (armorItem.type !== 'ARMOR') return;
    const slot = armorItem.slot;
    
    const oldItem = player.armor[slot];
    if (oldItem) {
        Inventory.addItem(oldItem.id, 1);
    }

    player.armor[slot] = armorItem;
}

// NEW: Function to add XP and handle leveling
export function addXP(amount) {
    player.xp += amount;
    console.log(`Gained ${amount} XP. Total: ${player.xp}`);

    while (player.xp >= player.xpToNextLevel) {
        player.xp -= player.xpToNextLevel;
        player.level += 1;
        
        // Formula for next level: XP_to_Level = 10 * (Level + 1)^2
        player.xpToNextLevel = 10 * Math.pow(player.level + 1, 2);
        
        console.log(`PLAYER LEVELED UP! New Level: ${player.level}. Next XP: ${player.xpToNextLevel}`);
        // Optionally, give player health boost or stat increase here
        player.maxHealth += 2;
        player.health = player.maxHealth;
    }
}


export function updatePlayer(deltaTime) {
    // ... (Hunger and Movement Physics logic remains the same)
    let currentMoveSpeed = player.moveSpeed;
    let currentJumpForce = player.jumpForce;
    
    // --- Hunger and Health Update ---
    player.hungerDrainTimer += deltaTime;
    if (player.hungerDrainTimer >= 10.0) { 
        player.hunger = Math.max(0, player.hunger - 1);
        player.hungerDrainTimer = 0;
    }

    if (player.hunger >= 18 && player.health < player.maxHealth) {
        if (player.healthRegenTimer >= 5.0) {
            player.health = Math.min(player.maxHealth, player.health + 1);
            player.healthRegenTimer = 0;
        } else {
            player.healthRegenTimer = (player.healthRegenTimer || 0) + deltaTime;
        }
    } else if (player.hunger === 0) {
        if (player.starveDamageTimer >= 10.0) {
            takeDamage(1);
            player.starveDamageTimer = 0;
        } else {
            player.starveDamageTimer = (player.starveDamageTimer || 0) + deltaTime;
        }
    }

    // --- Movement Physics (Same as before, using water logic) ---
    const blockAtHead = getBlockAt(player.x, player.y);
    const blockAtChest = getBlockAt(player.x, player.y + player.height / 2);
    
    if (blockAtHead && blockAtHead.id === 'WATER' || blockAtChest && blockAtChest.id === 'WATER') {
        currentMoveSpeed *= 0.3;
        currentJumpForce *= 0.5;
        player.gravity = 400;
        player.velY *= 0.9;
    } else {
        player.gravity = 800;
    }

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

    const newX = player.x + player.velX * deltaTime;
    const newY = player.y + player.velY * deltaTime;
    
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
    let defense = 0;
    const armorPieces = Object.values(player.armor).filter(a => a);
    
    for (const piece of armorPieces) {
        defense += piece.defense || 0;
    }
    
    const finalDamage = Math.max(1, damage - defense);
    
    player.health -= finalDamage;
    if (player.health <= 0) {
        player.health = 0;
        // console.log("Player Died! Needs Respawn.");
    }
}

export function drawPlayer(ctx, tileSize, cameraX, cameraY) {
    const screenX = player.x + cameraX;
    const screenY = player.y + cameraY;
    
    ctx.fillStyle = 'red'; 
    ctx.fillRect(screenX, screenY, player.width, player.height);
    
    // --- Draw Health, Hunger, and XP Bars (Screen Space) ---
    const barWidth = 100;
    const barHeight = 10;
    const barX = ctx.canvas.width - barWidth - 20;
    
    // 1. Health Bar
    let barY = 20;
    const currentHealthRatio = player.health / player.maxHealth;
    ctx.strokeStyle = 'black';
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = 'red';
    ctx.fillRect(barX, barY, barWidth * currentHealthRatio, barHeight);
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText(`HP: ${player.health}/${player.maxHealth}`, barX, barY - 5);

    // 2. Hunger Bar
    barY += barHeight + 5;
    const currentHungerRatio = player.hunger / player.maxHunger;
    ctx.strokeStyle = 'black';
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = 'orange';
    ctx.fillRect(barX, barY, barWidth * currentHungerRatio, barHeight);
    ctx.fillStyle = 'white';
    ctx.fillText(`Food: ${player.hunger}/${player.maxHunger}`, barX, barY - 5);

    // 3. XP Bar
    const xpBarY = ctx.canvas.height - 15;
    const xpBarW = ctx.canvas.width;
    const currentXPRatio = player.xp / player.xpToNextLevel;
    
    ctx.fillStyle = '#00FF00'; // Lime green for XP
    ctx.fillRect(0, xpBarY, xpBarW * currentXPRatio, 5);
    
    ctx.fillStyle = 'white';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Level ${player.level}`, xpBarW / 2, xpBarY - 5);
    ctx.textAlign = 'left';
}
