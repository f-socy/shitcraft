// /js/world.js - COMPLETE SCRIPT (Updated Mineral and Deep Layer Generation)
import * as Player from './player.js'; 
import * as Inventory from './inventory.js'; 
import * as Mobs from './mobs.js';
import { generateNoiseMap, getBlockInfo, WORLD_BLOCKS } from './utils.js';

export let worldMap = [];
export let TILE_SIZE = 32;
export const WORLD_WIDTH = 256; 
export const WORLD_HEIGHT = 128; 
let furnaceStates = {}; 
let blocksBeingBroken = {}; 
let interactableStates = {}; 

function placeBlockSafe(x, y, id) {
    if (x >= 0 && x < WORLD_WIDTH && y >= 0 && y < WORLD_HEIGHT) {
        worldMap[x][y] = id;
    }
}

// --- Dummy Functions for Missing Files/Logic ---
// (These are just placeholders to prevent errors if the files don't have these exports)
function generateDungeon(x, y) { console.log(`Dungeon generated at ${x}, ${y}`); }
function generateTrees(cols) { console.log(`Trees generated across ${cols} columns`); }
export function updateBlockBreaks(delta) { console.log('Block breaks updated.'); }
export function updateFurnaces(delta) { console.log('Furnaces updated.'); }
export function getBreakState(x, y) { return 0; }
export function startBlockBreak(x, y, item, level) { console.log(`Started breaking block at ${x}, ${y}`); }
export function stopBlockBreak() { console.log('Stopped breaking block'); }
export function placeOrInteract(x, y, item) { console.log(`Place or interact at ${x}, ${y}`); }
// --- End Dummy Functions ---


export function generateWorld(seed, canvasW, canvasH, tileSize) {
    TILE_SIZE = tileSize;
    const cols = WORLD_WIDTH;
    const rows = WORLD_HEIGHT;

    // Generate terrain height map using Perlin Noise
    const heightMap = generateNoiseMap(seed, cols, 0.05, 10, rows / 4); 
    const caveMap = generateNoiseMap(seed + 1, cols * 2, 0.1, 8, 1, 0.5); 

    const surfaceRow = Math.floor(rows * 0.7); // Approximate row where surface starts

    for (let x = 0; x < cols; x++) {
        worldMap[x] = [];
        const surfaceY = Math.floor(surfaceRow - heightMap[x]); 
        
        for (let y = 0; y < rows; y++) {
            
            // 1. Air, Grass, Dirt
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
                
                // 2. Cave Generation (Base Layer)
                const caveNoise = caveMap[x * 2][y] || 0;
                let baseBlock = 'STONE';

                // Use DEEP_STONE for the bottom 15% of the world (rows * 0.85)
                if (y > rows * 0.85) {
                    baseBlock = 'DEEP_STONE';
                }

                if (caveNoise < 0.2) {
                    worldMap[x][y] = 'AIR'; 
                } else {
                    worldMap[x][y] = baseBlock; 
                    
                    // 3. ORE DISTRIBUTION LOGIC (Depth-Based)
                    const depthRatio = (y - surfaceY) / (rows - surfaceY); // 0.0 (near surface) to 1.0 (deepest)
                    let ore = null;

                    if (depthRatio > 0.1 && Math.random() < 0.02) { // 10% below surface
                        ore = (Math.random() < 0.7) ? 'COAL_ORE' : 'IRON_ORE';
                    }

                    if (depthRatio > 0.4 && Math.random() < 0.01) { // Deeper (40% down)
                        ore = 'GOLD_ORE';
                    }
                    
                    if (depthRatio > 0.7 && Math.random() < 0.005) { // Deepest (70% down)
                        ore = 'DIAMOND_ORE';
                    }
                    
                    if (ore) {
                        worldMap[x][y] = ore;
                    }
                }
            }
        }
    }
    
    generateTrees(cols); 

    // Dungeon Generation
    for (let x = 10; x < cols - 10; x += 30) { 
        if (Math.random() < 0.3) { 
            const dungeonDepth = rows * 0.8; 
            generateDungeon(x, Math.floor(dungeonDepth));
        }
    }

    console.log(`Generated world map with tiered ore distribution: ${cols}x${rows}`);
}

export function findSurfaceY(col) {
    for (let y = 0; y < WORLD_HEIGHT; y++) {
        if (worldMap[col] && worldMap[col][y] !== 'AIR') {
            return y - 1; 
        }
    }
    return WORLD_HEIGHT / 2;
}
// Add this function near the bottom of /js/world.js
// It safely returns the ID of the block at a given coordinate.
export function getBlockAt(x, y) {
    if (x >= 0 && x < WORLD_WIDTH && y >= 0 && y < WORLD_HEIGHT) {
        return worldMap[x][y];
    }
    // Return a solid block type outside the bounds to prevent mobs/player from falling forever
    return 'DEEP_STONE'; 
}
