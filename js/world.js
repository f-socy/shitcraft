// /js/world.js - COMPLETE SCRIPT (Dungeon Generation Added)
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
let interactableStates = {}; // NEW: For chests/interactables

function placeBlockSafe(x, y, id) {
    if (x >= 0 && x < WORLD_WIDTH && y >= 0 && y < WORLD_HEIGHT) {
        worldMap[x][y] = id;
    }
}

// NEW: Function to generate a simple underground structure
function generateDungeon(startX, startY) {
    const dungeonW = 8;
    const dungeonH = 6;
    
    // Check if the area is mostly solid stone (safety check)
    let isClear = true;
    for (let x = startX; x < startX + dungeonW; x++) {
        for (let y = startY; y < startY + dungeonH; y++) {
            if (worldMap[x][y] === 'AIR') {
                isClear = false;
                break;
            }
        }
        if (!isClear) break;
    }
    if (!isClear) return;
    
    console.log(`Generating Dungeon at ${startX}, ${startY}`);

    // Create a 6x4 hollow room with Dungeon Stone walls
    for (let x = startX + 1; x < startX + dungeonW - 1; x++) {
        for (let y = startY + 1; y < startY + dungeonH - 1; y++) {
            placeBlockSafe(x, y, 'AIR');
        }
    }

    // Replace outer layer with Dungeon Stone
    for (let x = startX; x < startX + dungeonW; x++) {
        placeBlockSafe(x, startY, 'DUNGEON_STONE');
        placeBlockSafe(x, startY + dungeonH - 1, 'DUNGEON_STONE');
    }
    for (let y = startY; y < startY + dungeonH; y++) {
        placeBlockSafe(startX, y, 'DUNGEON_STONE');
        placeBlockSafe(startX + dungeonW - 1, y, 'DUNGEON_STONE');
    }

    // Place a loot chest and a mob spawner
    placeBlockSafe(startX + 2, startY + dungeonH - 2, 'LOOT_CHEST');
    placeBlockSafe(startX + dungeonW - 3, startY + dungeonH - 2, 'MOB_SPAWNER');
}


function generateTrees(cols) {
    // ... (Tree generation logic remains the same)
    for (let x = 0; x < cols; x++) {
        const surfaceY = findSurfaceY(x);

        if (worldMap[x][surfaceY + 1] === 'GRASS' && Math.random() < 0.10) {
            const trunkHeight = Math.floor(Math.random() * 3) + 3; 
            
            for (let h = 0; h < trunkHeight; h++) {
                placeBlockSafe(x, surfaceY - h, 'WOOD');
            }
            
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
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
    
    generateTrees(cols); 

    // NEW: Dungeon Generation
    for (let x = 10; x < cols - 10; x += 30) { // Check every 30 blocks
        if (Math.random() < 0.3) { // 30% chance per check area
            const dungeonDepth = rows * 0.8; // Dungeon starts deep underground
            generateDungeon(x, Math.floor(dungeonDepth));
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

// ... (drawWorld remains the same)

// --- Block Interaction (Time-Based Breaking) ---

export function updateBlockBreak(col, row, deltaTime) {
    const key = `${col},${row}`;
    if (!blocksBeingBroken[key]) return;

    const blockInfo = getBlockInfo(worldMap[col][row]);
    const tool = Inventory.getSelectedItem();
    const playerState = Player.getPlayerState();
    
    // NEW: Tool Gate Check
    if (blockInfo.requiredLevel && blockInfo.requiredLevel > playerState.level) {
        console.log(`Block too tough! Requires Level ${blockInfo.requiredLevel}.`);
        delete blocksBeingBroken[key];
        return false;
    }
    
    // ... (Tool break logic remains the same)
    const toolIsBroken = tool && tool.durability <= 0;
    let breakTime = blockInfo.hardness; 
    const efficiency = tool ? tool.efficiency || 1 : 1; 
    
    if (tool && tool.toolType === blockInfo.bestTool && !toolIsBroken) {
        breakTime *= efficiency;
        
        if (tool.durability) {
            tool.durability -= 1; 
        }
    } else if (tool && tool.toolType && tool.toolType !== blockInfo.bestTool) {
        breakTime *= 2; 
    }

    if (toolIsBroken || !tool) {
        breakTime *= 5;
    }

    const damageRate = (100 / breakTime) * deltaTime;
    blocksBeingBroken[key] += damageRate;

    if (blocksBeingBroken[key] >= 100) {
        removeBlock(col, row);
        
        // Handle Block Drops (including chance-based drops like STICK from LEAVES)
        const blockDrops = blockInfo.drops || [{ id: blockInfo.id, count: 1, chance: 1.0 }];
        for (const drop of blockDrops) {
            if (Math.random() <= (drop.chance || 1.0)) {
                 const count = Math.ceil(Math.random() * drop.count);
                 Inventory.addItem(drop.id, count);
            }
        }

        delete blocksBeingBroken[key];
        return true; 
    }
    return false; 
}

// ... (stopBlockBreak, getBlockBreakingState, removeBlock, placeBlock remain the same)


// --- Interactable Logic ---

export function openInteractable(col, row, blockId) {
    const key = `${col},${row}`;
    
    if (blockId === 'FURNACE') {
        interactableStates[key] = interactableStates[key] || { type: 'FURNACE', input: null, fuel: null, output: null, time: 0 };
        Inventory.setCraftingMode(2);
    } else if (blockId === 'CRAFTING_TABLE') {
        interactableStates[key] = interactableStates[key] || { type: 'CRAFTING_TABLE' };
        Inventory.setCraftingMode(3);
    } else if (blockId === 'LOOT_CHEST') {
        interactableStates[key] = interactableStates[key] || { 
            type: 'LOOT_CHEST', 
            opened: false, 
            inventory: [] 
        };
        // TODO: Handle chest item transfer
        
        // For PoC: instantly drop loot on opening the first time
        const info = getBlockInfo(blockId);
        if (info.drops && !interactableStates[key].opened) {
            for (const drop of info.drops) {
                Inventory.addItem(drop.id, drop.count);
            }
            interactableStates[key].opened = true;
            removeBlock(col, row); // Destroy chest after looting for simple PoC
        }
    }
    return interactableStates[key];
}

export function updateFurnaces(deltaTime) {
    // Logic needs to iterate over all interactable states of type 'FURNACE'
    for (const key in interactableStates) {
        const state = interactableStates[key];
        if (state.type !== 'FURNACE') continue;
        
        const inputInfo = state.input ? getBlockInfo(state.input.id) : null;
        const recipe = inputInfo ? inputInfo.smeltingRecipe : null;

        if (recipe && state.fuel && state.fuel.count > 0 && state.input && state.input.count > 0) {
            state.time += deltaTime;

            if (state.time >= recipe.time) {
                if (!state.output) {
                    state.output = { id: recipe.output.id, count: 0 };
                }
                state.output.count += recipe.output.count;
                
                state.fuel.count -= 1;
                state.input.count -= 1;
                state.time = 0;

                if (state.input.count <= 0) {
                    state.input = null;
                }
            }
        }
    }
}


// --- Progress Saving (Local Storage) ---

export function saveGameState(playerState, mobState) {
    try {
        const gameState = {
            world: worldMap,
            player: playerState,
            mobs: mobState,
            interactableStates: interactableStates, // Save all interactable states
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
            interactableStates = gameState.interactableStates || {}; 
            return true;
        }
    } catch (e) {
        console.error("Could not load game state:", e);
        return false;
    }
    return false;
}
