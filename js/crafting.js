// /js/crafting.js - COMPLETE SCRIPT (Expanded with Diamond Tools and Armor)

/*
    Format:
    size: 2 (2x2 grid) or 3 (3x3 Crafting Table grid)
    ingredients: Array of 4 (2x2) or 9 (3x3) items, in row-major order.
    id: The BLOCK ID of the required material.
*/
export const CRAFTING_RECIPES = [
    
    // =======================================================
    // --- BASIC INVENTORY (2x2) RECIPES ---
    // =======================================================
    {
        name: "Planks from Wood",
        size: 2,
        ingredients: [
            { id: 'WOOD', count: 1 }, null, 
            null, null
        ],
        output: { id: 'PLANK', count: 4 }
    },
    {
        name: "Sticks",
        size: 2,
        ingredients: [
            { id: 'PLANK', count: 1 }, null, 
            { id: 'PLANK', count: 1 }, null
        ],
        output: { id: 'STICK', count: 4 }
    },
    {
        name: "Crafting Table",
        size: 2,
        ingredients: [
            { id: 'PLANK', count: 1 }, { id: 'PLANK', count: 1 }, 
            { id: 'PLANK', count: 1 }, { id: 'PLANK', count: 1 }
        ],
        output: { id: 'CRAFTING_TABLE', count: 1 }
    },
    {
        name: "Torches",
        size: 2,
        ingredients: [
            { id: 'COAL', count: 1 }, null, 
            { id: 'STICK', count: 1 }, null
        ],
        output: { id: 'TORCH', count: 4 }
    },
    {
        name: "Oven/Furnace",
        size: 2,
        ingredients: [
            { id: 'COBBLESTONE' }, { id: 'COBBLESTONE' },
            { id: 'COBBLESTONE' }, { id: 'COBBLESTONE' }
        ],
        output: { id: 'FURNACE', count: 1 }
    },
    
    // =======================================================
    // --- CRAFTING TABLE (3x3) - WOOD & STONE TOOLS ---
    // =======================================================
    {
        name: "Wooden Pickaxe (3x3)",
        size: 3,
        ingredients: [
            { id: 'PLANK' }, { id: 'PLANK' }, { id: 'PLANK' },
            null, { id: 'STICK' }, null,
            null, { id: 'STICK' }, null
        ],
        output: { id: 'PICKAXE_WOOD', count: 1 }
    },
    {
        name: "Wooden Axe (3x3)",
        size: 3,
        ingredients: [
            { id: 'PLANK' }, { id: 'PLANK' }, null,
            { id: 'PLANK' }, { id: 'STICK' }, null,
            null, { id: 'STICK' }, null
        ],
        output: { id: 'AXE_WOOD', count: 1 }
    },
    {
        name: "Stone Pickaxe (3x3)",
        size: 3,
        ingredients: [
            { id: 'COBBLESTONE' }, { id: 'COBBLESTONE' }, { id: 'COBBLESTONE' },
            null, { id: 'STICK' }, null,
            null, { id: 'STICK' }, null
        ],
        output: { id: 'PICKAXE_STONE', count: 1 }
    },
    {
        name: "Stone Axe (3x3)",
        size: 3,
        ingredients: [
            { id: 'COBBLESTONE' }, { id: 'COBBLESTONE' }, null,
            { id: 'COBBLESTONE' }, { id: 'STICK' }, null,
            null, { id: 'STICK' }, null
        ],
        output: { id: 'AXE_STONE', count: 1 }
    },

    // =======================================================
    // --- CRAFTING TABLE (3x3) - IRON TOOLS & ARMOR ---
    // =======================================================
    {
        name: "Iron Pickaxe (3x3)",
        size: 3,
        ingredients: [
            { id: 'IRON_INGOT' }, { id: 'IRON_INGOT' }, { id: 'IRON_INGOT' },
            null, { id: 'STICK' }, null,
            null, { id: 'STICK' }, null
        ],
        output: { id: 'PICKAXE_IRON', count: 1 }
    },
    {
        name: "Iron Axe (3x3)",
        size: 3,
        ingredients: [
            { id: 'IRON_INGOT' }, { id: 'IRON_INGOT' }, null,
            { id: 'IRON_INGOT' }, { id: 'STICK' }, null,
            null, { id: 'STICK' }, null
        ],
        output: { id: 'AXE_IRON', count: 1 }
    },
    {
        name: "Iron Helmet",
        size: 3,
        ingredients: [
            { id: 'IRON_INGOT' }, { id: 'IRON_INGOT' }, { id: 'IRON_INGOT' },
            { id: 'IRON_INGOT' }, null, { id: 'IRON_INGOT' },
            null, null, null
        ],
        output: { id: 'HELMET_IRON', count: 1 } 
    },
    {
        name: "Iron Chestplate",
        size: 3,
        ingredients: [
            { id: 'IRON_INGOT' }, null, { id: 'IRON_INGOT' },
            { id: 'IRON_INGOT' }, { id: 'IRON_INGOT' }, { id: 'IRON_INGOT' },
            { id: 'IRON_INGOT' }, { id: 'IRON_INGOT' }, { id: 'IRON_INGOT' }
        ],
        output: { id: 'CHESTPLATE_IRON', count: 1 } 
    },
    {
        name: "Iron Leggings",
        size: 3,
        ingredients: [
            { id: 'IRON_INGOT' }, { id: 'IRON_INGOT' }, { id: 'IRON_INGOT' },
            { id: 'IRON_INGOT' }, null, { id: 'IRON_INGOT' },
            { id: 'IRON_INGOT' }, null, { id: 'IRON_INGOT' }
        ],
        output: { id: 'LEGGINGS_IRON', count: 1 } 
    },
    {
        name: "Iron Boots",
        size: 3,
        ingredients: [
            null, null, null,
            { id: 'IRON_INGOT' }, null, { id: 'IRON_INGOT' },
            { id: 'IRON_INGOT' }, null, { id: 'IRON_INGOT' }
        ],
        output: { id: 'BOOTS_IRON', count: 1 } 
    },

    // =======================================================
    // --- CRAFTING TABLE (3x3) - DIAMOND TOOLS & ARMOR (NEW) ---
    // =======================================================
    {
        name: "Diamond Pickaxe (3x3)",
        size: 3,
        ingredients: [
            { id: 'DIAMOND' }, { id: 'DIAMOND' }, { id: 'DIAMOND' },
            null, { id: 'STICK' }, null,
            null, { id: 'STICK' }, null
        ],
        output: { id: 'PICKAXE_DIAMOND', count: 1 }
    },
    {
        name: "Diamond Helmet",
        size: 3,
        ingredients: [
            { id: 'DIAMOND' }, { id: 'DIAMOND' }, { id: 'DIAMOND' },
            { id: 'DIAMOND' }, null, { id: 'DIAMOND' },
            null, null, null
        ],
        output: { id: 'HELMET_DIAMOND', count: 1 }
    },
    {
        name: "Diamond Chestplate",
        size: 3,
        ingredients: [
            { id: 'DIAMOND' }, null, { id: 'DIAMOND' },
            { id: 'DIAMOND' }, { id: 'DIAMOND' }, { id: 'DIAMOND' },
            { id: 'DIAMOND' }, { id: 'DIAMOND' }, { id: 'DIAMOND' }
        ],
        output: { id: 'CHESTPLATE_DIAMOND', count: 1 }
    },
    {
        name: "Diamond Leggings",
        size: 3,
        ingredients: [
            { id: 'DIAMOND' }, { id: 'DIAMOND' }, { id: 'DIAMOND' },
            { id: 'DIAMOND' }, null, { id: 'DIAMOND' },
            { id: 'DIAMOND' }, null, { id: 'DIAMOND' }
        ],
        output: { id: 'LEGGINGS_DIAMOND', count: 1 }
    },
    {
        name: "Diamond Boots",
        size: 3,
        ingredients: [
            null, null, null,
            { id: 'DIAMOND' }, null, { id: 'DIAMOND' },
            { id: 'DIAMOND' }, null, { id: 'DIAMOND' }
        ],
        output: { id: 'BOOTS_DIAMOND', count: 1 }
    },

];
