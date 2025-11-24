// /js/utils.js - COMPLETE SCRIPT 

// --- A* Pathfinding Helpers (Simplified) ---
class PriorityQueue {
    constructor() {
        this.values = [];
    }
    enqueue(element, priority) {
        this.values.push({element, priority});
        this.sort();
    }
    sort() {
        this.values.sort((a, b) => a.priority - b.priority);
    }
    dequeue() {
        return this.values.shift();
    }
    isEmpty() {
        return this.values.length === 0;
    }
}

export class PathNode {
    constructor(x, y, g = 0, h = 0, parent = null) {
        this.x = x;
        this.y = y;
        this.g = g; 
        this.h = h; 
        this.f = g + h; 
        this.parent = parent;
    }

    static findPath(start, end, worldMap) {
        const openList = new PriorityQueue();
        const startNode = new PathNode(start.x, start.y, 0, PathNode.heuristic(start, end));
        openList.enqueue(startNode, startNode.f);
        
        const closedList = new Map();
        
        while (!openList.isEmpty()) {
            const currentEntry = openList.dequeue();
            const currentNode = currentEntry.element;
            
            if (currentNode.x === end.x && currentNode.y === end.y) {
                const path = [];
                let temp = currentNode;
                while (temp) {
                    path.push({ x: temp.x, y: temp.y });
                    temp = temp.parent;
                }
                return path.reverse();
            }

            closedList.set(`${currentNode.x},${currentNode.y}`, currentNode);

            const neighbors = [
                { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }
            ];

            for (const move of neighbors) {
                const neighborX = currentNode.x + move.x;
                const neighborY = currentNode.y + move.y;
                const key = `${neighborX},${neighborY}`;

                if (neighborX < 0 || neighborX >= worldMap.length || 
                    neighborY < 0 || neighborY >= worldMap[0].length) continue;
                
                const blockId = worldMap[neighborX][neighborY];
                const blockInfo = getBlockInfo(blockId);
                
                if (blockInfo.type === 'BLOCK' || blockInfo.type === 'INTERACTABLE') continue;
                
                if (closedList.has(key)) continue;

                const g = currentNode.g + 1; 
                const h = PathNode.heuristic({ x: neighborX, y: neighborY }, end);
                const neighborNode = new PathNode(neighborX, neighborY, g, h, currentNode);
                
                openList.enqueue(neighborNode, neighborNode.f);
            }
        }
        return null; 
    }

    static heuristic(pos1, pos2) {
        return Math.abs(pos1.x - pos2.x) + Math.abs(pos2.y - pos2.y);
    }
}

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
    // Wood Tier
    'PICKAXE_WOOD': { toolType: 'PICKAXE', efficiency: 0.5, maxDurability: 60, color: '#A0522D', requiredLevel: 0 },
    'AXE_WOOD': { toolType: 'AXE', efficiency: 0.5, maxDurability: 60, color: '#A0522D', requiredLevel: 0 },
    'SHOVEL_WOOD': { toolType: 'SHOVEL', efficiency: 0.5, maxDurability: 60, color: '#A0522D', requiredLevel: 0 },
    
    // Stone Tier
    'PICKAXE_STONE': { toolType: 'PICKAXE', efficiency: 0.3, maxDurability: 132, color: '#778899', requiredLevel: 1 },
    'AXE_STONE': { toolType: 'AXE', efficiency: 0.3, maxDurability: 132, color: '#778899', requiredLevel: 1 },
    
    // Iron Tier
    'PICKAXE_IRON': { toolType: 'PICKAXE', efficiency: 0.15, maxDurability: 250, color: '#D3D3D3', requiredLevel: 2 },
    'AXE_IRON': { toolType: 'AXE', efficiency: 0.15, maxDurability: 250, color: '#D3D3D3', requiredLevel: 2 },
    
    // Diamond Tier 💎
    'PICKAXE_DIAMOND': { toolType: 'PICKAXE', efficiency: 0.05, maxDurability: 1561, color: '#00FFFF', requiredLevel: 3 },
};

// --- Mob Definitions (Remain the same) ---
export const MOB_DEFINITIONS = {
    'SHEEP': { 
        type: 'passive', color: '#FFFFFF', health: 10, damage: 0, 
        drops: [{id: 'MUTTON', count: 1, chance: 1.0}], 
        xp: 3 
    },
    'ZOMBIE': { 
        type: 'hostile', color: '#006400', health: 20, damage: 2, 
        drops: [{id: 'ROTTEN_FLESH', count: 2, chance: 0.7}], 
        xp: 5 
    }
};

// --- Block & Item Definitions ---
export const WORLD_BLOCKS = {
    'AIR': { color: '#87CEEB', name: 'Air', hardness: 0, bestTool: null, type: 'AIR' },
    'WATER': { color: '#00BFFF', name: 'Water', hardness: 100, bestTool: null, type: 'LIQUID' }, 
    'GRASS': { color: '#00AA00', name: 'Grass', hardness: 1.0, bestTool: 'SHOVEL', type: 'BLOCK', drops: [{ id: 'DIRT', count: 1 }] },
    'DIRT': { color: '#8B4513', name: 'Dirt', hardness: 0.8, bestTool: 'SHOVEL', type: 'BLOCK' },
    'STONE': { color: '#778899', name: 'Stone', hardness: 3.0, bestTool: 'PICKAXE', type: 'BLOCK', drops: [{ id: 'COBBLESTONE', count: 1 }] },
    'WOOD': { color: '#964B00', name: 'Wood Log', hardness: 2.0, bestTool: 'AXE', type: 'BLOCK', drops: [{ id: 'WOOD', count: 1 }] },
    'LEAVES': { color: '#228B22', name: 'Leaves', hardness: 0.2, bestTool: 'AXE', type: 'BLOCK', drops: [{ id: 'STICK', count: 0.2 }] }, 

    // ORE Definitions
    'COAL_ORE': { color: '#444444', name: 'Coal Ore', hardness: 4.0, bestTool: 'PICKAXE', type: 'BLOCK', drops: [{ id: 'COAL', count: 1 }] },
    'IRON_ORE': { 
        color: '#B5A642', name: 'Iron Ore', hardness: 5.0, bestTool: 'PICKAXE', type: 'BLOCK', requiredLevel: 1, 
        smeltingRecipe: { fuel: ['COAL', 'PLANK'], output: { id: 'IRON_INGOT', count: 1 }, time: 5.0 } 
    },
    'GOLD_ORE': { 
        color: '#FFD700', name: 'Gold Ore', hardness: 7.0, bestTool: 'PICKAXE', type: 'BLOCK', requiredLevel: 2, 
        smeltingRecipe: { fuel: ['COAL', 'PLANK'], output: { id: 'GOLD_INGOT', count: 1 }, time: 7.0 } 
    },
    'DIAMOND_ORE': { 
        color: '#00FFFF', name: 'Diamond Ore', hardness: 10.0, bestTool: 'PICKAXE', type: 'BLOCK', requiredLevel: 3, 
        drops: [{ id: 'DIAMOND', count: 1, chance: 1.0 }] 
    },
    
    // Deep Layer Block
    'DEEP_STONE': { color: '#4F4F4F', name: 'Deep Stone', hardness: 15.0, bestTool: 'PICKAXE', type: 'BLOCK', requiredLevel: 3 },

    // Structure & Interactables
    'FURNACE': { color: '#696969', name: 'Furnace', hardness: 3.5, bestTool: 'PICKAXE', type: 'INTERACTABLE' },
    'CRAFTING_TABLE': { color: '#A0522D', name: 'Crafting Table', hardness: 2.5, bestTool: 'AXE', type: 'INTERACTABLE' },
    'DUNGEON_STONE': { color: '#36454F', name: 'Dungeon Stone', hardness: 10.0, bestTool: 'PICKAXE', type: 'BLOCK', requiredLevel: 3 }, 
    'LOOT_CHEST': { color: '#FFA500', name: 'Loot Chest', hardness: 1.0, bestTool: 'AXE', type: 'INTERACTABLE', drops: [{id: 'IRON_INGOT', count: 5, chance: 1.0}] },
    'MOB_SPAWNER': { color: '#555555', name: 'Mob Spawner', hardness: 1000.0, bestTool: 'PICKAXE', type: 'INTERACTABLE' },
    'TORCH': { color: '#FFD700', name: 'Torch', hardness: 0, bestTool: null, type: 'BLOCK' }, 
    
    // Crafting Items
    'PLANK': { color: '#D2B48C', name: 'Wooden Plank', hardness: 0, bestTool: null, type: 'BLOCK' },
    'STICK': { color: '#8B4513', name: 'Stick', hardness: 0, bestTool: null, type: 'ITEM' },
    'COBBLESTONE': { color: '#A9A9A9', name: 'Cobblestone', hardness: 0, bestTool: null, type: 'BLOCK' },
    'IRON_INGOT': { color: '#F0F8FF', name: 'Iron Ingot', hardness: 0, bestTool: null, type: 'ITEM' },
    'COAL': { color: '#101010', name: 'Coal', hardness: 0, bestTool: null, type: 'ITEM' }, 
    'GOLD_INGOT': { color: '#FFD700', name: 'Gold Ingot', hardness: 0, bestTool: null, type: 'ITEM' },
    'DIAMOND': { color: '#00FFFF', name: 'Diamond', hardness: 0, bestTool: null, type: 'ITEM' },
    
    // Food & Armor
    'MUTTON': { color: '#FFFACD', name: 'Mutton', hardness: 0, bestTool: null, type: 'FOOD', restoresHunger: 5 },
    'ROTTEN_FLESH': { color: '#808000', name: 'Rotten Flesh', hardness: 0, bestTool: null, type: 'FOOD', restoresHunger: 2 },
    
    // Iron Armor
    'HELMET_IRON': { color: '#C0C0C0', name: 'Iron Helmet', defense: 2, type: 'ARMOR', slot: 'helmet' },
    'CHESTPLATE_IRON': { color: '#C0C0C0', name: 'Iron Chestplate', defense: 5, type: 'ARMOR', slot: 'chestplate' },
    'LEGGINGS_IRON': { color: '#C0C0C0', name: 'Iron Leggings', defense: 4, type: 'ARMOR', slot: 'leggings' },
    'BOOTS_IRON': { color: '#C0C0C0', name: 'Iron Boots', defense: 2, type: 'ARMOR', slot: 'boots' },
    
    // Diamond Armor 💎
    'HELMET_DIAMOND': { color: '#00BFFF', name: 'Diamond Helmet', defense: 3, type: 'ARMOR', slot: 'helmet' },
    'CHESTPLATE_DIAMOND': { color: '#00BFFF', name: 'Diamond Chestplate', defense: 8, type: 'ARMOR', slot: 'chestplate' },
    'LEGGINGS_DIAMOND': { color: '#00BFFF', name: 'Diamond Leggings', defense: 6, type: 'ARMOR', slot: 'leggings' },
    'BOOTS_DIAMOND': { color: '#00BFFF', name: 'Diamond Boots', defense: 3, type: 'ARMOR', slot: 'boots' },
};

export function getMobInfo(id) {
    return MOB_DEFINITIONS[id];
}

export function getBlockInfo(id) {
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
