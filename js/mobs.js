// /js/mobs.js - NEW FILE
import { getBlockAt, WORLD_HEIGHT, WORLD_WIDTH, TILE_SIZE } from './world.js';
import { getBlockInfo } from './utils.js';

let mobs = [];

const MOB_DEFINITIONS = {
    'SHEEP': { type: 'passive', color: '#FFFFFF', health: 10, drops: [{id: 'MUTTON', count: 1}] },
    'ZOMBIE': { type: 'hostile', color: '#006400', health: 20, damage: 2, drops: [{id: 'ROTTEN_FLESH', count: 1}] }
};

export function spawnMobs(worldW, worldH, tileSize) {
    // Simple initial mob spawn (e.g., 5 passive mobs)
    for (let i = 0; i < 5; i++) {
        const x = Math.floor(Math.random() * worldW);
        const y = 0; // Will fall to surface
        mobs.push({
            id: 'SHEEP',
            x: x * tileSize,
            y: y * tileSize,
            velX: 0, velY: 0,
            width: 30, height: 30
        });
    }
    console.log(`Spawned ${mobs.length} initial mobs.`);
}

export function getAllMobs() { return mobs; }
export function loadMobState(state) { mobs = state; }

export function updateMobs(deltaTime, cycleProgress, playerState) {
    const isNight = cycleProgress > 0.5 && cycleProgress < 0.95; // Night time window

    // Mob Spawning Logic (If it's night, spawn hostile mobs in dark areas)
    if (isNight && Math.random() < 0.005) {
        // Spawn a zombie randomly near the player (TODO: improve spawning logic)
        const mobDef = MOB_DEFINITIONS['ZOMBIE'];
        mobs.push({
            id: 'ZOMBIE',
            x: playerState.x + (Math.random() > 0.5 ? 500 : -500),
            y: playerState.y - 100,
            velX: 0, velY: 0,
            width: 30, height: 45
        });
    }

    for (let mob of mobs) {
        const def = MOB_DEFINITIONS[mob.id];
        
        // --- Physics (Gravity) ---
        mob.velY += 800 * deltaTime; // Basic gravity
        
        // Check ground collision (simple)
        let blockBelow = getBlockAt(mob.x, mob.y + mob.height + 1);
        if (blockBelow && blockBelow.id !== 'AIR') {
            mob.y = blockBelow.y * TILE_SIZE - mob.height;
            mob.velY = 0;
        } else {
            mob.y += mob.velY * deltaTime;
        }

        // --- AI ---
        if (def.type === 'passive') {
            // Simple random wandering
            if (Math.random() < 0.01) mob.velX = (Math.random() - 0.5) * 50; 
        } else if (def.type === 'hostile' && isNight) {
            // Chase Player (simple pursuit)
            const dx = playerState.x - mob.x;
            const dy = playerState.y - mob.y;
            mob.velX = Math.sign(dx) * 100; // Move towards player
            
            // Attack check
            if (Math.abs(dx) < 50 && Math.abs(dy) < mob.height) {
                // TODO: Implement damage to player
                // playerState.health -= def.damage;
                console.log(`${mob.id} attacked! Player health: ${playerState.health}`);
            }
        }
        
        // Apply Horizontal movement
        mob.x += mob.velX * deltaTime;
    }
    
    // Remove dead/off-screen mobs (TODO: cleanup logic)
    mobs = mobs.filter(m => m.health > 0);
}

export function drawMobs(ctx, tileSize, cameraX, cameraY) {
    for (const mob of mobs) {
        const def = MOB_DEFINITIONS[mob.id];
        const screenX = mob.x + cameraX;
        const screenY = mob.y + cameraY;
        
        ctx.fillStyle = def.color;
        ctx.fillRect(screenX, screenY, mob.width, mob.height);
        
        // Optional: Draw name/health
        ctx.fillStyle = 'black';
        ctx.fillText(mob.id, screenX, screenY - 5);
    }
}
