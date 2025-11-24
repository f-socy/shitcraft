// /js/player.js - COMPLETE SCRIPT (Hunger, Health, Armor)
import * as World from './world.js';
import * as Inventory from './inventory.js'; 
import { getBlockAt, updateBlockBreak, startBlockBreak, stopBlockBreak, placeBlock } from './world.js';
import { getBlockInfo } from './utils.js';

let player = {
    x: 0, y: 0, width: 20, height: 40,
    moveSpeed: 200, velX: 0, velY: 0,
    isJumping: false, gravity: 800, jumpForce: 400,
    maxHealth: 20, health: 20, 
    maxHunger: 20, hunger: 20, // NEW: Hunger variables
    hungerDrainTimer: 0,
    armor: { helmet: null, chestplate: null, leggings: null, boots: null } // Armor Slots
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
        if (event.key.toLowerCase() === 'q') { // Quick consume food (PoC)
            consumeItem();
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
                World.openFurnace(block.x, block.y); 
                Inventory.setCraftingMode(block.id === 'CRAFTING_TABLE' ? 3 : 2); // Set to 3x3 if Crafting Table
                Inventory.toggleInventory(); // Open the UI with the right mode
                return;
            }
            
            const item = Inventory.getSelectedItem();
            if (item) {
                if (item.type === 'BLOCK') {
                    // Placing block logic
                    const placeX = block.x;
                    const placeY = block.y;
                    placeBlock(placeX, placeY, item.id);
                    // TODO: Deduct item
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
        // For PoC: assume it restores 4 health too, or heals over time
        player.health = Math.min(player.maxHealth, player.health + 4); 
        console.log(`Ate ${item.id}. Hunger: ${player.hunger}`);
        // TODO: Remove item from inventory
    }
}

export function equipArmor(armorItem) {
    if (armorItem.type !== 'ARMOR') return;
    const slot = armorItem.slot; // e.g., 'helmet'
    
    // Swap: put old armor back in inventory (PoC: ignore overflow)
    const oldItem = player.armor[slot];
    if (oldItem) {
        Inventory.addItem(oldItem.id, 1);
    }

    // Equip new armor
    player.armor[slot] = armorItem;
    console.log(`Equipped ${armorItem.id} in ${slot} slot.`);
}


export function updatePlayer(deltaTime) {
    let currentMoveSpeed = player.moveSpeed;
    let currentJumpForce = player.jumpForce;
    
    // --- Hunger and Health Update ---
    player.hungerDrainTimer += deltaTime;
    if (player.hungerDrainTimer >= 10.0) { // Drain 1 hunger every 10 seconds
        player.hunger = Math.max(0, player.hunger - 1);
        player.hungerDrainTimer = 0;
        console.log(`Hunger drained. Current: ${player.hunger}`);
    }

    if (player.hunger >= 18 && player.health < player.maxHealth) {
        // Regeneration when full (PoC: 1 health per 5 seconds when full)
        if (player.healthRegenTimer >= 5.0) {
            player.health = Math.min(player.maxHealth, player.health + 1);
            player.healthRegenTimer = 0;
        } else {
            player.healthRegenTimer = (player.healthRegenTimer || 0) + deltaTime;
        }
    } else if (player.hunger === 0) {
        // Slow damage when starving (1 damage every 10 seconds)
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

    // ... (Movement logic remains the same)
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
    
    // Basic Collision Checks
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
        console.log("Player Died! Needs Respawn.");
    }
}

export function drawPlayer(ctx, tileSize, cameraX, cameraY) {
    const screenX = player.x + cameraX;
    const screenY = player.y + cameraY;
    
    ctx.fillStyle = 'red'; 
    ctx.fillRect(screenX, screenY, player.width, player.height);
    
    // --- Draw Health and Hunger Bars (Screen Space) ---
    
    // Health Bar
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

    // Hunger Bar (below Health)
    const hungerBarY = barY + barHeight + 5;
    const currentHungerRatio = player.hunger / player.maxHunger;
    
    ctx.strokeStyle = 'black';
    ctx.strokeRect(barX, hungerBarY, barWidth, barHeight);
    ctx.fillStyle = 'orange';
    ctx.fillRect(barX, hungerBarY, barWidth * currentHungerRatio, barHeight);
    ctx.fillStyle = 'white';
    ctx.fillText(`Food: ${player.hunger}/${player.maxHunger}`, barX, hungerBarY - 5);
}
