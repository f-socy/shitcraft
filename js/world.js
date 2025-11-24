// /js/world.js - COMPLETE SCRIPT
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
            if (y < surfaceY) {
                // Add static water bodies above the surface line sometimes
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
                    // Basic Ore generation
                    if (y > surfaceY + 10 && Math.random() < 0.03) {
                        worldMap[x][y] = (Math.random() < 0.5) ? 'COAL_ORE' : 'IRON_ORE';
                    }
                }
            }
        }
    }
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

export function drawWorld(ctx, tileSize, cameraX, cameraY, cycleProgress) {
    // Calculate ambient light based on cycleProgress
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
    
    // Check if the tool exists and has durability
    const toolIsBroken = tool && tool.durability <= 0;
    
    // Calculate break speed based on tool and material
    let breakTime = blockInfo.hardness; 
    
    // Get tool efficiency from the item data (if tool is equipped)
    const efficiency = tool ? tool.efficiency || 1 : 1; 
    
    // Apply efficiency and tool match
    if (tool && tool.toolType === blockInfo.bestTool && !toolIsBroken) {
        breakTime *= efficiency; // Faster break time (efficiency is a fractional value, e.g., 0.5)
        
        // Decrease tool durability
        if (tool.durability) {
            // Note: In a real game, you must update the tool object in the Inventory module
            // For this PoC, we will assume durability is mutable on the returned item object
            tool.durability -= 1; // 1 point of damage per successful hit
            if (tool.durability <= 0) {
                console.log(`${tool.id} broke!`);
                // TODO: Remove tool from inventory hotbar/slot
            }
        }
    } else if (tool && tool.toolType && tool.toolType !== blockInfo.bestTool) {
        breakTime *= 2; // Penalty for wrong tool
    }

    // If tool is broken or no tool, it's slow
    if (toolIsBroken || !tool) {
        breakTime *= 5; // Very slow breaking
    }

    const damageRate = (100 / breakTime) * deltaTime;
    blocksBeingBroken[key] += damageRate;

    if (blocksBeingBroken[key] >= 100) {
        removeBlock(col, row);
        // Add block drops to inventory
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
    // In a full game, this would trigger a UI overlay
}

// --- Progress Saving (Local Storage) ---

export function saveGameState(playerState, mobState) {
    try {
        const gameState = {
            world: worldMap,
            player: playerState,
            mobs: mobState,
            furnaceStates: furnaceStates, // Save furnace state
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
            furnaceStates = gameState.furnaceStates || {}; // Load furnace state
            return true;
        }
    } catch (e) {
        console.error("Could not load game state:", e);
        return false;
    }
    return false;
}
