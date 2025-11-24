// /js/crafting.js - NEW FILE

/*
    Format:
    size: 2 (2x2 grid) or 3 (3x3 Crafting Table grid)
    ingredients: Array of 4 (2x2) or 9 (3x3) items, in row-major order.
    id: The BLOCK ID of the required material.
    
    Note: For 2x2, a null means an empty slot in the inventory crafting grid.
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
    
    // --- Tools (Requires 3x3 Crafting Table, not implemented yet) ---
    // Example: Wooden Pickaxe
    /*
    {
        name: "Wooden Pickaxe",
        size: 3,
        ingredients: [
            { id: 'PLANK' }, { id: 'PLANK' }, { id: 'PLANK' },
            null, { id: 'STICK' }, null,
            null, { id: 'STICK' }, null
        ],
        output: { id: 'PICKAXE_WOOD', count: 1 }
    }
    */
];
