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
    // (Unchanged)
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
    // (Unchanged)
    // =======================================================
    {
        name: "Wooden Pickaxe (3x3)",
        size: 3,
        ingredients: [
            { id: 'PLANK' }, { id: 'PLANK' }, { id: 'PLANK'
