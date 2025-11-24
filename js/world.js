// /js/world.js - COMPLETE SCRIPT (Tree Generation Added)
import * as Player from './player.js'; 
import * as Inventory from './inventory.js'; 
import * as Mobs from './mobs.js';
import { generateNoiseMap, getBlockInfo, WORLD_BLOCKS } from './utils.js';

export let worldMap = [];
export let TILE_SIZE = 32;
export const WORLD_WIDTH = 256; 
export const WORLD_HEIGHT = 128; 
let furnaceStates = {}; // { 'x,y': { input: null, fuel: null, output: null, time: 0 } }
let blocksBeingBroken = {}; // { 'x,y': damage_progress (0-100) }

// --- World Generation (Procedural) ---

function placeBlockSafe(x, y, id) {
    if (x >= 0 && x < WORLD_WIDTH && y >= 0 && y < WORLD_HEIGHT) {
        worldMap[x][y] = id;
    }
}

function generateTrees(cols) {
    for (let x = 0; x < cols; x++) {
        const surfaceY = findSurfaceY(x);

        // 10% chance to spawn a tree on a grass block
        if (worldMap[x][surfaceY + 1] === 'GRASS' && Math.random() < 0.10) {
            const trunkHeight = Math.floor(Math.random() * 3) + 3; // 3 to 5 blocks tall
            
            // Draw Trunk
            for (let h = 0; h < trunkHeight; h++) {
                placeBlockSafe(x, surfaceY - h, 'WOOD');
            }
            
            // Draw Leaves (Simple 3x3 square at the top)
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    // Place leaves one block above the trunk top
                    placeBlockSafe(x + dx, surfaceY - trunkHeight + dy, 'LEAVES'); 
                }
            }
        }
    }
}

export function generateWorld(seed, canvasW, canvasH, tileSize) {
    TILE_SIZE = tileSize;
    const cols = WORLD_WIDTH;
    const rows = WORLD_HEIGHT;

    // Generate terrain height map using Perlin Noise
    const heightMap = generateNoiseMap(seed, cols, 0.05, 10, rows / 4); 
    const caveMap = generateNoiseMap(seed + 1, cols * 2, 0.1, 8, 1, 0.5); 

    for (let x = 0; x < cols; x++) {
        worldMap[x] = [];
        const surfaceY = Math.floor(rows * 0.7 - heightMap[x]); 
        
        for (let y = 0; y < rows; y++) {
            // ... (Terrain generation remains the same)
            if (y < surfaceY) {
                if (Math.random() < 0.005 && y > surfaceY - 5 && y < surfaceY - 1) {
                    worldMap[x][y] = 'WATER'; 
                } else {
                    worldMap[x][y] = 'AIR'; 
                }
            } else if (y === surfaceY) {
                worldMap[x][y] = 'GRASS'; 
            } else if (y < surfaceY + 4) {
                worldMap[x][y] = 'DIRT'; 
            } else {
                const caveNoise = caveMap[x * 2][y] || 0;
                if (caveNoise < 0.2) {
                    worldMap[x][y] = 'AIR'; 
                } else {
                    worldMap[x][y] = 'STONE'; 
                    if (y > surfaceY + 10 && Math.random() < 0.03) {
                        worldMap[x][y] = (Math.random() < 0.5) ? 'COAL_ORE' : 'IRON_ORE';
                    }
                }
            }
        }
    }
    
    generateTrees(cols); // NEW: Add trees after terrain is set
    console.log(`Generated world map: ${cols}x${rows}`);
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
// ... (drawWorld remains the same)

// --- Block Interaction (Time-Based Breaking) ---
// ... (getBlockAt, startBlockBreak, updateBlockBreak, stopBlockBreak, getBlockBreakingState remain the same)

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

// --- Furnace and Smelting Logic ---

export function updateFurnaces(deltaTime) {
    for (const key in furnaceStates) {
        const state = furnaceStates[key];
        const inputInfo = state.input ? getBlockInfo(state.input.id) : null;
        const recipe = inputInfo ? inputInfo.smeltingRecipe : null;

        if (recipe && state.fuel && state.fuel.count > 0 && state.input && state.input.count > 0) {
            state.time += deltaTime;

            if (state.time >= recipe.time) {
                // Smelting complete
                if (!state.output) {
                    state.output = { id: recipe.output.id, count: 0 };
                }
                state.output.count += recipe.output.count;
                
                // Consume 1 fuel item and 1 input item
                state.fuel.count -= 1;
                state.input.count -= 1;
                state.time = 0; // Reset time for next item

                if (state.input.count <= 0) {
                    state.input = null; // Clear input
                }
            }
        }
    }
}

export function openFurnace(col, row) {
    const key = `${col},${row}`;
    furnaceStates[key] = furnaceStates[key] || { input: null, fuel: null, output: null, time: 0 };
    return furnaceStates[key];
}


// --- Progress Saving (Local Storage) ---

export function saveGameState(playerState, mobState) {
    try {
        const gameState = {
            world: worldMap,
            player: playerState,
            mobs: mobState,
            furnaceStates: furnaceStates,
            time: Date.now() 
        };
        localStorage.setItem('blockWorldSave', JSON.stringify(gameState));
        console.log("Game saved successfully.");
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
            furnaceStates = gameState.furnaceStates || {};
            return true;
        }
    } catch (e) {
        console.error("Could not load game state:", e);
        return false;
    }
    return false;
}
