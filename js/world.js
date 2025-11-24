// /js/world.js - UPDATED
import * as Player from './player.js'; 
import * as Inventory from './inventory.js'; 
import { generateNoiseMap, getBlockInfo, WORLD_BLOCKS } from './utils.js';

export let worldMap = [];
export let TILE_SIZE = 32;
export const WORLD_WIDTH = 256; 
export const WORLD_HEIGHT = 128; 

// --- World Generation (Procedural) ---

export function generateWorld(seed, canvasW, canvasH, tileSize) {
    TILE_SIZE = tileSize;
    const cols = WORLD_WIDTH;
    const rows = WORLD_HEIGHT;

    // Generate terrain height map using Perlin Noise
    const heightMap = generateNoiseMap(seed, cols, 0.05, 10, rows / 4); // Scale, Octaves, Amplitude
    const caveMap = generateNoiseMap(seed + 1, cols * 2, 0.1, 8, 1, 0.5); // Used for cave generation

    for (let x = 0; x < cols; x++) {
        worldMap[x] = [];
        const surfaceY = Math.floor(rows * 0.7 - heightMap[x]); // Surface level
        
        for (let y = 0; y < rows; y++) {
            if (y < surfaceY) {
                worldMap[x][y] = 'AIR'; // Sky
            } else if (y === surfaceY) {
                worldMap[x][y] = 'GRASS'; // Top layer
            } else if (y < surfaceY + 4) {
                worldMap[x][y] = 'DIRT'; // Sub-surface
            } else {
                // Determine if it's rock or an open cave
                const caveNoise = caveMap[x * 2][y] || 0;
                if (caveNoise < 0.2) {
                    worldMap[x][y] = 'AIR'; // Cave opening
                } else {
                    worldMap[x][y] = 'STONE'; // Solid rock
                    // Basic Ore generation
                    if (y > surfaceY + 10 && Math.random() < 0.03) {
                        worldMap[x][y] = (Math.random() < 0.5) ? 'COAL_ORE' : 'IRON_ORE';
                    }
                }
            }
        }
    }
    // TODO: Add tree and structure generation passes
}

export function findSurfaceY(col) {
    for (let y = 0; y < WORLD_HEIGHT; y++) {
        if (worldMap[col] && worldMap[col][y] !== 'AIR') {
            return y - 1; 
        }
    }
    return WORLD_HEIGHT / 2;
}

// --- Drawing and Day/Night Cycle ---

export function drawWorld(ctx, tileSize, cameraX, cameraY, cycleProgress) {
    // Calculate ambient light based on cycleProgress (0=noon, 0.5=midnight, 1.0=noon)
    // Use a cosine wave for smooth transition: 1.0 at 0 and 1.0 (day), 0.5 at 0.5 (night)
    const lightLevel = 0.5 * (Math.cos(2 * Math.PI * (cycleProgress - 0.5)) + 1); // 0.0 to 1.0
    const tint = Math.max(0.3, 0.6 + lightLevel * 0.4); // Min brightness 0.3, Max 1.0

    // Set Sky Color based on time
    const skyColor = cycleProgress < 0.5 ? '#87CEEB' : '#101030'; // Day vs Night Sky
    ctx.fillStyle = skyColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (let x = 0; x < worldMap.length; x++) {
        for (let y = 0; y < worldMap[x].length; y++) {
            const blockId = worldMap[x][y];
            const info = getBlockInfo(blockId);
            
            if (blockId !== 'AIR') {
                const screenX = x * tileSize + cameraX;
                const screenY = y * tileSize + cameraY;
                
                // Only draw blocks visible on screen
                if (screenX + tileSize > 0 && screenX < ctx.canvas.width &&
                    screenY + tileSize > 0 && screenY < ctx.canvas.height) {

                    // Draw block color
                    ctx.fillStyle = info.color;
                    ctx.fillRect(screenX, screenY, tileSize, tileSize);
                    
                    // Apply Day/Night Tint
                    ctx.fillStyle = `rgba(0, 0, 0, ${1 - tint})`;
                    ctx.fillRect(screenX, screenY, tileSize, tileSize);

                    // Draw breaking progress animation
                    const breakingState = getBlockBreakingState(x, y);
                    if (breakingState > 0) {
                        ctx.strokeStyle = 'red';
                        ctx.lineWidth = 4;
                        const progress = breakingState / 100; // 0 to 1
                        ctx.strokeRect(screenX, screenY, tileSize * progress, 4); // Simple bar
                    }
                }
            }
        }
    }
}

// --- Block Interaction (Time-Based Breaking) ---

let blocksBeingBroken = {}; // { 'x,y': damage_progress (0-100), 'x2,y2': ... }

export function getBlockAt(worldX, worldY) {
    const col = Math.floor(worldX / TILE_SIZE);
    const row = Math.floor(worldY / TILE_SIZE);
    if (worldMap[col] && worldMap[col][row]) {
        return { 
            id: worldMap[col][row], 
            info: getBlockInfo(worldMap[col][row]),
            x: col, y: row
        };
    }
    return null;
}

export function startBlockBreak(col, row) {
    if (worldMap[col][row] === 'AIR') return;
    const key = `${col},${row}`;
    blocksBeingBroken[key] = blocksBeingBroken[key] || 0;
}

export function updateBlockBreak(col, row, deltaTime) {
    const key = `${col},${row}`;
    if (!blocksBeingBroken[key]) return;

    const blockInfo = getBlockInfo(worldMap[col][row]);
    const tool = Inventory.getSelectedItem();
    
    // Calculate break speed based on tool and material
    let breakTime = blockInfo.hardness; // Base time (e.g., in seconds)
    
    // Simple tool effectiveness logic (e.g., Wood Axe is fast on wood)
    if (tool && tool.toolType === blockInfo.bestTool) {
        breakTime /= 5; // 5x faster with the right tool
    } else if (tool && tool.toolType) {
        // Penalty for wrong tool (e.g., pickaxe on dirt)
        breakTime *= 2; 
    }

    // Convert time to a damage rate (100 is max damage)
    const damageRate = (100 / breakTime) * deltaTime;
    blocksBeingBroken[key] += damageRate;

    if (blocksBeingBroken[key] >= 100) {
        removeBlock(col, row);
        // Add block drops to inventory (needs Inventory implementation)
        const blockDrops = blockInfo.drops || [{ id: blockInfo.id, count: 1 }];
        for (const drop of blockDrops) {
            Inventory.addItem(drop.id, drop.count);
        }
        delete blocksBeingBroken[key];
        return true; // Broken
    }
    return false; // Still breaking
}

export function stopBlockBreak(col, row) {
    const key = `${col},${row}`;
    delete blocksBeingBroken[key]; // Reset progress
}

export function getBlockBreakingState(col, row) {
    const key = `${col},${row}`;
    return blocksBeingBroken[key] || 0;
}

export function removeBlock(col, row) {
    if (worldMap[col] && worldMap[col][row] && worldMap[col][row] !== 'AIR') {
        worldMap[col][row] = 'AIR'; // Replace with air
    }
}

export function placeBlock(col, row, blockId) {
    if (worldMap[col] && worldMap[col][row] && worldMap[col][row] === 'AIR') {
        worldMap[col][row] = blockId;
    }
}


// --- Progress Saving (Local Storage) ---

export function saveGameState(playerState, mobState) {
    try {
        const gameState = {
            world: worldMap,
            player: playerState,
            mobs: mobState,
            time: Date.now() 
        };
        localStorage.setItem('blockWorldSave', JSON.stringify(gameState));
    } catch (e) {
        console.error("Could not save game state:", e);
    }
}

export function loadGameState() {
    try {
        const savedData = localStorage.getItem('blockWorldSave');
        if (savedData) {
            const gameState = JSON.parse(savedData);
            worldMap = gameState.world;
            Player.loadPlayerState(gameState.player);
            Mobs.loadMobState(gameState.mobs);
            return true;
        }
    } catch (e) {
        console.error("Could not load game state:", e);
        return false;
    }
    return false;
}
