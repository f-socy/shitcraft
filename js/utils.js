// /js/utils.js - COMPLETE SCRIPT (Finalized with Diamond Items)

// --- Tool Definitions (Updated with Diamond Pickaxe) ---
export const TOOL_DEFINITIONS = {
    // ... (Wood, Stone, Iron tools remain the same)
    'PICKAXE_WOOD': { toolType: 'PICKAXE', efficiency: 0.5, maxDurability: 60, color: '#A0522D', requiredLevel: 0 },
    'AXE_WOOD': { toolType: 'AXE', efficiency: 0.5, maxDurability: 60, color: '#A0522D', requiredLevel: 0 },
    'SHOVEL_WOOD': { toolType: 'SHOVEL', efficiency: 0.5, maxDurability: 60, color: '#A0522D', requiredLevel: 0 },
    'PICKAXE_STONE': { toolType: 'PICKAXE', efficiency: 0.3, maxDurability: 132, color: '#778899', requiredLevel: 1 },
    'AXE_STONE': { toolType: 'AXE', efficiency: 0.3, maxDurability: 132, color: '#778899', requiredLevel: 1 },
    'PICKAXE_IRON': { toolType: 'PICKAXE', efficiency: 0.15, maxDurability: 250, color: '#D3D3D3', requiredLevel: 2 },
    'AXE_IRON': { toolType: 'AXE', efficiency: 0.15, maxDurability: 250, color: '#D3D3D3', requiredLevel: 2 },
    
    // Diamond Tier 💎
    'PICKAXE_DIAMOND': { toolType: 'PICKAXE', efficiency: 0.05, maxDurability: 1561, color: '#00FFFF', requiredLevel: 3 },
};

// --- Block & Item Definitions (Updated with Diamond Armor) ---
export const WORLD_BLOCKS = {
    // ... (All existing blocks/items remain the same)
    'AIR': { color: '#87CEEB', name: 'Air', hardness: 0, bestTool: null, type: 'AIR' },
    'WATER': { color: '#00BFFF', name: 'Water', hardness: 100, bestTool: null, type: 'LIQUID' }, 
    'GRASS': { color: '#00AA00', name: 'Grass', hardness: 1.0, bestTool: 'SHOVEL', type: 'BLOCK', drops: [{ id: 'DIRT', count: 1 }] },
    'DIRT': { color: '#8B4513', name: 'Dirt', hardness: 0.8, bestTool: 'SHOVEL', type: 'BLOCK' },
    'STONE': { color: '#778899', name: 'Stone', hardness: 3.0, bestTool: 'PICKAXE', type: 'BLOCK', drops: [{ id: 'COBBLESTONE', count: 1 }] },
    'WOOD': { color: '#964B00', name: 'Wood Log', hardness: 2.0, bestTool: 'AXE', type: 'BLOCK', drops: [{ id: 'WOOD', count: 1 }] },
    'LEAVES': { color: '#228B22', name: 'Leaves', hardness: 0.2, bestTool: 'AXE', type: 'BLOCK', drops: [{ id: 'STICK', count: 0.2 }] }, 
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
    'DEEP_STONE': { color: '#4F4F4F', name: 'Deep Stone', hardness: 15.0, bestTool: 'PICKAXE', type: 'BLOCK', requiredLevel: 3 },
    'FURNACE': { color: '#696969', name: 'Furnace', hardness: 3.5, bestTool: 'PICKAXE', type: 'INTERACTABLE' },
    'CRAFTING_TABLE': { color: '#A0522D', name: 'Crafting Table', hardness: 2.5, bestTool: 'AXE', type: 'INTERACTABLE' },
    'DUNGEON_STONE': { color: '#36454F', name: 'Dungeon Stone', hardness: 10.0, bestTool: 'PICKAXE', type: 'BLOCK', requiredLevel: 3 }, 
    'LOOT_CHEST': { color: '#FFA500', name: 'Loot Chest', hardness: 1.0, bestTool: 'AXE', type: 'INTERACTABLE', drops: [{id: 'IRON_INGOT', count: 5, chance: 1.0}] },
    'MOB_SPAWNER': { color: '#555555', name: 'Mob Spawner', hardness: 1000.0, bestTool: 'PICKAXE', type: 'INTERACTABLE' },
    'TORCH': { color: '#FFD700', name: 'Torch', hardness: 0, bestTool: null, type: 'BLOCK' }, 
    'PLANK': { color: '#D2B48C', name: 'Wooden Plank', hardness: 0, bestTool: null, type: 'BLOCK' },
    'STICK': { color: '#8B4513', name: 'Stick', hardness: 0, bestTool: null, type: 'ITEM' },
    'COBBLESTONE': { color: '#A9A9A9', name: 'Cobblestone', hardness: 0, bestTool: null, type: 'BLOCK' },
    'IRON_INGOT': { color: '#F0F8FF', name: 'Iron Ingot', hardness: 0, bestTool: null, type: 'ITEM' },
    'COAL': { color: '#101010', name: 'Coal', hardness: 0, bestTool: null, type: 'ITEM' }, 
    'GOLD_INGOT': { color: '#FFD700', name: 'Gold Ingot', hardness: 0, bestTool: null, type: 'ITEM' }, 
    'DIAMOND': { color: '#00FFFF', name: 'Diamond', hardness: 0, bestTool: null, type: 'ITEM' }, 
    'MUTTON': { color: '#FFFACD', name: 'Mutton', hardness: 0, bestTool: null, type: 'FOOD', restoresHunger: 5 },
    'ROTTEN_FLESH': { color: '#808000', name: 'Rotten Flesh', hardness: 0, bestTool: null, type: 'FOOD', restoresHunger: 2 },
    'HELMET_IRON': { color: '#C0C0C0', name: 'Iron Helmet', defense: 2, type: 'ARMOR', slot: 'helmet' },
    'CHESTPLATE_IRON': { color: '#C0C0C0', name: 'Iron Chestplate', defense: 5, type: 'ARMOR', slot: 'chestplate' },
    'LEGGINGS_IRON': { color: '#C0C0C0', name: 'Iron Leggings', defense: 4, type: 'ARMOR', slot: 'leggings' },
    'BOOTS_IRON': { color: '#C0C0C0', name: 'Iron Boots', defense: 2, type: 'ARMOR', slot: 'boots' },
    
    // NEW Diamond Armor Definitions 💎
    'HELMET_DIAMOND': { color: '#00BFFF', name: 'Diamond Helmet', defense: 3, type: 'ARMOR', slot: 'helmet' },
    'CHESTPLATE_DIAMOND': { color: '#00BFFF', name: 'Diamond Chestplate', defense: 8, type: 'ARMOR', slot: 'chestplate' },
    'LEGGINGS_DIAMOND': { color: '#00BFFF', name: 'Diamond Leggings', defense: 6, type: 'ARMOR', slot: 'leggings' },
    'BOOTS_DIAMOND': { color: '#00BFFF', name: 'Diamond Boots', defense: 3, type: 'ARMOR', slot: 'boots' },
};

// ... (utility functions remain the same)
