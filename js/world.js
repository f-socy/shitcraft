// /js/world.js - COMPLETE SCRIPT (Includes fixes for getBlockAt and tree generation)
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

// --- World Content Generation ---

function generateDungeon(startX, depthY) { 
    // Minimal dungeon implementation (A simple chamber)
    for (let x = startX - 5; x < startX + 5; x++) {
        for (let y = depthY - 3; y < depthY + 3; y++) {
            // Convert STONE blocks to AIR to create a room
            if (worldMap[x] && worldMap[x][y] === 'STONE') {
                worldMap[x][y] = 'AIR';
            }
        }
    }
    // Place a loot chest
    placeBlockSafe(startX, depthY + 2, 'LOOT_CHEST');
}

function generateTrees(cols) { 
    const treeTrunkHeight = 5;
    const canopyWidth = 3;
    
    // Iterate through columns to plant trees
    for (let x = 5; x < cols - 5; x += 15 + Math.floor(Math.random() * 10)) {
        
        // Find the surface Y coordinate
        const surfaceY = findSurfaceY(x); 
        
        // Ensure we are on a grass block
        if (worldMap[x] && worldMap[x][surfaceY + 1] === 'GRASS') { 
            
            // Draw the trunk
            for (let i = 0; i < treeTrunkHeight; i++) {
                placeBlockSafe(x, surfaceY - i, 'WOOD');
            }
            
            // Draw leaves (canopy starts one block above the trunk)
            const canopyTopY = surfaceY - treeTrunkHeight;
            for (let y = canopyTopY - 2; y < canopyTopY + 1; y++) {
                for (let dx = -canopyWidth; dx <= canopyWidth; dx++) {
                    if (Math.random() > 0.1) { // 90% chance of a leaf block
                        placeBlockSafe(x + dx, y, 'LEAVES');
                    }
                }
            }
        }
    }
    console.log(`Generated trees and dungeons.`); 
}

// --- Core World Generation ---

export function generateWorld(seed, canvasW, canvasH, tileSize) {
    TILE_SIZE = tileSize;
    const cols = WORLD_WIDTH;
    const rows = WORLD_HEIGHT;

    // Generate terrain height map using Perlin Noise
    const heightMap = generateNoiseMap(seed, cols, 0.05, 10, rows / 4); 
    const caveMap = generateNoiseMap(seed + 1, cols * 2, 0.1, 8, 1, 0.5); 

    const surfaceRow = Math.floor(rows * 0.7); 

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

                if (y > rows * 0.85) {
                    baseBlock = 'DEEP_STONE';
                }

                if (caveNoise < 0.2) {
                    worldMap[x][y] = 'AIR'; // This creates the caves
                } else {
                    worldMap[x][y] = baseBlock; 
                    
                    // 3. ORE DISTRIBUTION LOGIC
                    const depthRatio = (y - surfaceY) / (rows - surfaceY); 
                    let ore = null;

                    if (depthRatio > 0.1 && Math.random() < 0.02) { 
                        ore = (Math.random() < 0.7) ? 'COAL_ORE' : 'IRON_ORE';
                    }

                    if (depthRatio > 0.4 && Math.random() < 0.01) { 
                        ore = 'GOLD_ORE';
                    }
                    
                    if (depthRatio > 0.7 && Math.random() < 0.005) { 
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

// Fix for Uncaught SyntaxError: getBlockAt not exported.
export function getBlockAt(x, y) {
    if (x >= 0 && x < WORLD_WIDTH && y >= 0 && y < WORLD_HEIGHT) {
        return worldMap[x][y];
    }
    return 'DEEP_STONE'; 
}

// --- Dummy Functions for Update Loop (Necessary exports) ---
export function updateBlockBreaks(delta) { /* Placeholder */ }
export function updateFurnaces(delta) { /* Placeholder */ }
export function getBreakState(x, y) { return 0; }
export function startBlockBreak(x, y, item, level) { /* Placeholder */ }
export function stopBlockBreak() { /* Placeholder */ }
export function placeOrInteract(x, y, item) { /* Placeholder */ }
