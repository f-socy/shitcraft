// /js/utils.js - COMPLETE SCRIPT

// --- Perlin Noise Generator (Simplified) ---
function random(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

export function generateNoiseMap(seed, count, scale, octaves, amplitude, persistence = 0.5) {
    const noiseMap = new Array(count).fill(0);
    
    for (let i = 0; i < count; i++) {
        let total = 0;
        let frequency = 1;
        let amp = amplitude;
        
        for (let j = 0; j < octaves; j++) {
            const sampleX = i * scale * frequency;
            const intX = Math.floor(sampleX);
            const fracX = sampleX - intX;
            const v1 = random(seed + intX);
            const v2 = random(seed + intX + 1);
            const noise = lerp(v1, v2, fracX);
            
            total += noise * amp;
            amp *= persistence;
            frequency *= 2;
        }
        noiseMap[i] = total;
    }
    return noiseMap;
}

// --- Tool Definitions (for durability/efficiency) ---
export const TOOL_DEFINITIONS = {
    // Type: PICKAXE, AXE, SHOVEL
    // Efficiency: Multiplier for break time (lower = faster break time)
    // MaxDurability: How many times it can be used before breaking
    'PICKAXE_WOOD': { toolType: 'PICKAXE', efficiency: 0.5, maxDurability: 60, color: 'brown' },
    'PICKAXE_STONE': { toolType: 'PICKAXE', efficiency: 0.3, maxDurability: 132, color: 'gray' },
    'AXE_WOOD': { toolType: 'AXE', efficiency: 0.5, maxDurability: 60, color: 'brown' },
    'SHOVEL_WOOD': { toolType: 'SHOVEL', efficiency: 0.5, maxDurability: 60, color: 'brown' },
};

// --- Block & Item Definitions ---
export const WORLD_BLOCKS = {
    'AIR': { color: '#87CEEB', name: 'Air', hardness: 0, bestTool: null, type: 'AIR' },
    'WATER': { color: '#00BFFF', name: 'Water', hardness: 100, bestTool: null, type: 'LIQUID' }, 
    'GRASS': { color: '#00AA00', name: 'Grass', hardness: 1.0, bestTool: 'SHOVEL', type: 'BLOCK', drops: [{ id: 'DIRT', count: 1 }] },
    'DIRT': { color: '#8B4513', name: 'Dirt', hardness: 0.8, bestTool: 'SHOVEL', type: 'BLOCK' },
    'STONE': { color: '#778899', name: 'Stone', hardness: 3.0, bestTool: 'PICKAXE', type: 'BLOCK', drops: [{ id: 'COBBLESTONE', count: 1 }] },
    'WOOD': { color: '#964B00', name: 'Wood Log', hardness: 2.0, bestTool: 'AXE', type: 'BLOCK', drops: [{ id: 'WOOD', count: 1 }] },
    'COAL_ORE': { color: '#444444', name: 'Coal Ore', hardness: 4.0, bestTool: 'PICKAXE', type: 'BLOCK', drops: [{ id: 'COAL', count: 1 }] },
    'IRON_ORE': { 
        color: '#B5A642', name: 'Iron Ore', hardness: 5.0, bestTool: 'PICKAXE', type: 'BLOCK', 
        smeltingRecipe: { // Smelting recipe defined on the raw ore
            fuel: ['COAL', 'PLANK'], 
            output: { id: 'IRON_INGOT', count: 1 }, 
            time: 5.0 
        } 
    },
    'FURNACE': { color: '#696969', name: 'Furnace', hardness: 3.5, bestTool: 'PICKAXE', type: 'INTERACTABLE' },
    'CRAFTING_TABLE': { color: '#A0522D', name: 'Crafting Table', hardness: 2.5, bestTool: 'AXE', type: 'INTERACTABLE' },
    
    // Items
    'PLANK': { color: '#D2B48C', name: 'Wooden Plank', hardness: 0, bestTool: null, type: 'BLOCK' },
    'STICK': { color: '#8B4513', name: 'Stick', hardness: 0, bestTool: null, type: 'ITEM' },
    'COBBLESTONE': { color: '#A9A9A9', name: 'Cobblestone', hardness: 0, bestTool: null, type: 'BLOCK' },
    'IRON_INGOT': { color: '#F0F8FF', name: 'Iron Ingot', hardness: 0, bestTool: null, type: 'ITEM' },
    'MUTTON': { color: '#FFFACD', name: 'Mutton', hardness: 0, bestTool: null, type: 'FOOD' },
    'ROTTEN_FLESH': { color: '#808000', name: 'Rotten Flesh', hardness: 0, bestTool: null, type: 'FOOD' },

    // Armor 
    'HELMET_IRON': { color: '#C0C0C0', name: 'Iron Helmet', defense: 2, type: 'ARMOR', slot: 'helmet' },
};

export function getBlockInfo(id) {
    // If ID is a tool ID, merge item data with tool definitions
    if (TOOL_DEFINITIONS[id]) {
        return { 
            id: id, 
            type: 'TOOL', 
            color: TOOL_DEFINITIONS[id].color,
            ...TOOL_DEFINITIONS[id] 
        };
    }
    return WORLD_BLOCKS[id] || WORLD_BLOCKS['AIR'];
}
