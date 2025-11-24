// /js/utils.js - NEW FILE
// --- Block & Item Definitions ---
export const WORLD_BLOCKS = {
    'AIR': { color: '#87CEEB', name: 'Air', hardness: 0, bestTool: null, type: 'AIR' },
    'GRASS': { color: '#00AA00', name: 'Grass', hardness: 1.0, bestTool: 'SHOVEL', type: 'BLOCK', drops: [{ id: 'DIRT', count: 1 }] },
    'DIRT': { color: '#8B4513', name: 'Dirt', hardness: 0.8, bestTool: 'SHOVEL', type: 'BLOCK' },
    'STONE': { color: '#778899', name: 'Stone', hardness: 3.0, bestTool: 'PICKAXE', type: 'BLOCK', drops: [{ id: 'COBBLESTONE', count: 1 }] },
    'WOOD': { color: '#964B00', name: 'Wood Log', hardness: 2.0, bestTool: 'AXE', type: 'BLOCK', drops: [{ id: 'WOOD', count: 1 }] },
    'COAL_ORE': { color: '#444444', name: 'Coal Ore', hardness: 4.0, bestTool: 'PICKAXE', type: 'BLOCK', drops: [{ id: 'COAL', count: 1 }] },
    'IRON_ORE': { color: '#B5A642', name: 'Iron Ore', hardness: 5.0, bestTool: 'PICKAXE', type: 'BLOCK', drops: [{ id: 'IRON_ORE', count: 1 }] },
    
    // Items (Not blocks to be placed, but they are used in the inventory)
    'PLANK': { color: '#D2B48C', name: 'Wooden Plank', hardness: 0, bestTool: null, type: 'BLOCK' },
    'STICK': { color: '#8B4513', name: 'Stick', hardness: 0, bestTool: null, type: 'ITEM' },
    'CRAFTING_TABLE': { color: '#A0522D', name: 'Crafting Table', hardness: 2.5, bestTool: 'AXE', type: 'INTERACTABLE' },
};

export function getBlockInfo(id) {
    return WORLD_BLOCKS[id] || WORLD_BLOCKS['AIR'];
}

// --- Perlin Noise Generator (Simplified) ---
// This is required for smooth, random terrain generation.

// Simple implementation of Pseudo-random number generator for a seed
function random(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

// Simple interpolation function (Cubic/Smootherstep is better but complex)
function lerp(a, b, t) {
    return a + (b - a) * t;
}

// Generates a 1D noise array (used for heightmap)
export function generateNoiseMap(seed, count, scale, octaves, amplitude, persistence = 0.5) {
    const noiseMap = new Array(count).fill(0);
    
    for (let i = 0; i < count; i++) {
        let total = 0;
        let frequency = 1;
        let amp = amplitude;
        
        for (let j = 0; j < octaves; j++) {
            const sampleX = i * scale * frequency;
            
            // Simple value noise calculation (better than nothing)
            const intX = Math.floor(sampleX);
            const fracX = sampleX - intX;
            
            // Random values based on seed + integer coordinate
            const v1 = random(seed + intX);
            const v2 = random(seed + intX + 1);
            
            // Interpolate the random values
            const noise = lerp(v1, v2, fracX);
            
            total += noise * amp;
            amp *= persistence;
            frequency *= 2;
        }
        noiseMap[i] = total;
    }
    return noiseMap;
}
