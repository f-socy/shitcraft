// /js/crafting.js - COMPLETE SCRIPT (3x3 Recipes Added)

/*
    Format:
    size: 2 (2x2 grid) or 3 (3x3 Crafting Table grid)
    ingredients: Array of 4 (2x2) or 9 (3x3) items, in row-major order.
    id: The BLOCK ID of the required material.
*/
export const CRAFTING_RECIPES = [
    // --- Basic Inventory (2x2) Recipes ---
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
    
    // --- Crafting Table (3x3) Recipes ---
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
];
