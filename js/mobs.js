// /js/mobs.js - COMPLETE SCRIPT (Pathfinding and Loot Drops)
import { getBlockAt, WORLD_HEIGHT, WORLD_WIDTH, TILE_SIZE } from './world.js';
import { getMobInfo, PathNode } from './utils.js';
import * as Player from './player.js';
import * as Inventory from './inventory.js';

let mobs = [];

export function spawnMobs(worldW, worldH, tileSize) {
    // Simple initial mob spawn (e.g., 5 passive mobs)
    for (let i = 0; i < 5; i++) {
        const def = getMobInfo('SHEEP');
        const x = Math.floor(Math.random() * worldW);
        const y = 0; // Will fall to surface
        mobs.push({
            id: 'SHEEP',
            x: x * tileSize,
            y: y * tileSize,
            velX: 0, velY: 0,
            width: 30, height: 30,
            health: def.health, // Current health
            maxHealth: def.health,
            // NEW: Pathfinding data
            path: [], 
            pathTimer: 0 // Timer to recalculate path
        });
    }
}

export function getAllMobs() { return mobs; }
export function loadMobState(state) { mobs = state; }

function handleMobDeath(mob) {
    const def = getMobInfo(mob.id);
    
    // 1. Give Player XP
    Player.addXP(def.xp || 0);
    
    // 2. Drop Loot
    if (def.drops) {
        for (const drop of def.drops) {
            if (Math.random() <= (drop.chance || 1.0)) {
                // Determine actual count (up to max count)
                const count = Math.ceil(Math.random() * drop.count);
                Inventory.addItem(drop.id, count);
                console.log(`Mob dropped ${count} x ${drop.id}`);
            }
        }
    }
}

export function updateMobs(deltaTime, cycleProgress, playerState) {
    const isNight = cycleProgress > 0.5 && cycleProgress < 0.95;

    // Mob Spawning Logic (If it's night, spawn hostile mobs in dark areas)
    if (isNight && Math.random() < 0.005) {
        const mobDef = getMobInfo('ZOMBIE');
        mobs.push({
            id: 'ZOMBIE',
            x: playerState.x + (Math.random() > 0.5 ? 500 : -500),
            y: playerState.y - 100,
            velX: 0, velY: 0,
            width: 30, height: 45,
            health: mobDef.health,
            maxHealth: mobDef.health,
            path: [],
            pathTimer: 0
        });
    }

    for (let mob of mobs) {
        const def = getMobInfo(mob.id);
        
        // --- Physics (Gravity) ---
        mob.velY += 800 * deltaTime; 
        
        let blockBelow = getBlockAt(mob.x, mob.y + mob.height + 1);
        if (blockBelow && blockBelow.id !== 'AIR' && blockBelow.id !== 'WATER') {
            mob.y = blockBelow.y * TILE_SIZE - mob.height;
            mob.velY = 0;
        } else {
            mob.y += mob.velY * deltaTime;
        }

        // --- AI & Pathfinding ---
        
        if (def.type === 'hostile' && isNight) {
            mob.pathTimer -= deltaTime;
            
            const mobCol = Math.floor(mob.x / TILE_SIZE);
            const mobRow = Math.floor(mob.y / TILE_SIZE);
            const playerCol = Math.floor(playerState.x / TILE_SIZE);
            const playerRow = Math.floor(playerState.y / TILE_SIZE);

            // Recalculate path every 1 second or if path is empty
            if (mob.pathTimer <= 0 || mob.path.length === 0) {
                // Assume World.worldMap is accessible for PathNode
                mob.path = PathNode.findPath(
                    { x: mobCol, y: mobRow }, 
                    { x: playerCol, y: playerRow }, 
                    World.worldMap
                );
                mob.pathTimer = 1.0; // Recalculate every second
            }
            
            if (mob.path && mob.path.length > 1) {
                // Target the next block in the path
                const nextStep = mob.path[1]; 
                
                const targetX = nextStep.x * TILE_SIZE + TILE_SIZE / 2;
                const dx = targetX - (mob.x + mob.width / 2);

                // Movement towards next node
                mob.velX = Math.sign(dx) * 100;

                // Check for jump condition (if path requires moving up a block)
                if (nextStep.y < mobRow) {
                    // Simple jump logic when next step is higher (up a single block)
                    if (blockBelow && blockBelow.id !== 'AIR') {
                         mob.velY = -300; // Jump force
                    }
                }
                
                // If mob reaches the center of the next block, pop it from path
                if (Math.abs(dx) < 5) {
                    mob.path.shift();
                }

                // Attack check (simple proximity attack)
                if (Math.abs(playerState.x - mob.x) < 50 && Math.abs(playerState.y - mob.y) < mob.height) {
                    Player.takeDamage(def.damage);
                }
            } else {
                 mob.velX = 0;
            }

        } else if (def.type === 'passive') {
            if (Math.random() < 0.01) mob.velX = (Math.random() - 0.5) * 50; 
        }
        
        // Apply Horizontal movement
        mob.x += mob.velX * deltaTime;
    }
    
    // Remove dead mobs and handle drops
    const aliveMobs = [];
    for (const mob of mobs) {
        if (mob.health > 0) {
            aliveMobs.push(mob);
        } else {
            handleMobDeath(mob); // Trigger death handler
        }
    }
    mobs = aliveMobs;
}

export function takeDamage(mob, damage) {
    mob.health -= damage;
}

export function drawMobs(ctx, tileSize, cameraX, cameraY) {
    for (const mob of mobs) {
        const def = getMobInfo(mob.id);
        const screenX = mob.x + cameraX;
        const screenY = mob.y + cameraY;
        
        ctx.fillStyle = def.color;
        ctx.fillRect(screenX, screenY, mob.width, mob.height);
        
        // Draw Mob Health Bar
        const healthBarW = mob.width + 10;
        const healthBarH = 5;
        const healthX = screenX - 5;
        const healthY = screenY - 10;
        
        ctx.fillStyle = 'black';
        ctx.fillRect(healthX, healthY, healthBarW, healthBarH);
        
        const healthRatio = mob.health / mob.maxHealth;
        ctx.fillStyle = healthRatio > 0.5 ? 'green' : (healthRatio > 0.2 ? 'yellow' : 'red');
        ctx.fillRect(healthX, healthY, healthBarW * healthRatio, healthBarH);
        
        // OPTIONAL: Draw Path for debugging
        if (mob.path && mob.path.length > 0) {
            ctx.strokeStyle = 'cyan';
            ctx.lineWidth = 1;
            ctx.beginPath();
            let first = true;
            for(const step of mob.path) {
                const px = step.x * tileSize + tileSize / 2 + cameraX;
                const py = step.y * tileSize + tileSize / 2 + cameraY;
                if (first) {
                    ctx.moveTo(px, py);
                    first = false;
                } else {
                    ctx.lineTo(px, py);
                }
                ctx.fillRect(px - 1, py - 1, 2, 2); // Draw dot
            }
            ctx.stroke();
        }
    }
}
