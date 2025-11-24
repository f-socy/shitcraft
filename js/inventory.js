// /js/inventory.js - UPDATED
import { CRAFTING_RECIPES } from './crafting.js';
import { getBlockInfo } from './utils.js';

let items = new Array(27).fill(null); 
let hotbar = new Array(9).fill({id: 'GRASS', count: 1}); // Seed hotbar for testing
let isOpen = false;
let selectedSlot = 0; 
let inventoryCrafting = new Array(4).fill(null); // The 2x2 crafting grid

export function setupListeners() {
    document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'e') {
            toggleInventory();
        }
        if (event.key >= '1' && event.key <= '9') {
            selectedSlot = parseInt(event.key) - 1;
        }
    });
}

export function toggleInventory() {
    isOpen = !isOpen;
    // When opening/closing, refresh the inventory to check craft results
    if (isOpen) {
        checkCraftingResult();
    }
}

export function getSelectedItem() {
    return hotbar[selectedSlot];
}

export function addItem(id, count) {
    // Logic to find slot, stack, or add to a new slot
    // For simplicity, just add to the first empty slot for now
    for (let i = 0; i < hotbar.length; i++) {
        if (!hotbar[i]) {
            hotbar[i] = { id, count };
            return;
        }
    }
    for (let i = 0; i < items.length; i++) {
        if (!items[i]) {
            items[i] = { id, count };
            return;
        }
    }
    // No space! (Handle drop/overflow later)
}

// --- Crafting Logic ---

let craftResult = null;

function checkCraftingResult() {
    // Check 2x2 grid against all recipes
    const input = inventoryCrafting.map(slot => slot ? slot.id : null);
    craftResult = CRAFTING_RECIPES.find(recipe => {
        // Simple check: recipe must be a 2x2 recipe AND ingredients must match
        if (recipe.size === 2 && recipe.ingredients.length === 4) {
            // Check if the input array (with nulls for empty slots) matches the recipe's shape
            const recipeIDs = recipe.ingredients.map(ing => ing.id);
            return recipeIDs.every((id, index) => id === input[index]);
        }
        return false;
    });

    if (craftResult) {
        console.log("Crafting result found:", craftResult.output.id);
    }
}

// --- Drawing UI ---

export function drawUI(ctx, w, h) {
    drawHotbar(ctx, w, h);
    if (isOpen) {
        drawInventory(ctx, w, h);
    }
}

function drawHotbar(ctx, w, h) {
    const barWidth = 9 * 50; // 9 slots * size
    const startX = w / 2 - barWidth / 2;
    const startY = h - 60;
    
    // Draw hotbar background (simplified)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(startX, startY, barWidth, 50);

    for (let i = 0; i < 9; i++) {
        const x = startX + i * 50 + 5;
        const y = startY + 5;
        ctx.strokeStyle = i === selectedSlot ? 'yellow' : 'white';
        ctx.lineWidth = i === selectedSlot ? 4 : 2;
        ctx.strokeRect(x, y, 40, 40);

        const item = hotbar[i];
        if (item) {
            ctx.fillStyle = getBlockInfo(item.id).color;
            ctx.fillRect(x, y, 40, 40);
            ctx.fillStyle = 'white';
            ctx.fillText(item.count, x + 5, y + 35);
        }
    }
}

function drawInventory(ctx, w, h) {
    // Draw inventory panel
    const invW = 400; 
    const invH = 300;
    const invX = w / 2 - invW / 2;
    const invY = h / 2 - invH / 2;
    
    ctx.fillStyle = 'rgba(100, 100, 100, 0.9)';
    ctx.fillRect(invX, invY, invW, invH);
    
    // Draw 4-slot crafting area (top left of inventory)
    ctx.fillText("Crafting (2x2)", invX + 30, invY + 20);
    for (let i = 0; i < 4; i++) {
        const x = invX + 30 + (i % 2) * 45;
        const y = invY + 30 + Math.floor(i / 2) * 45;
        ctx.strokeStyle = 'black';
        ctx.strokeRect(x, y, 40, 40);
        // TODO: Draw items in inventoryCrafting[i]
    }
    
    // Draw Crafting Result Slot (top right)
    ctx.fillText("Result", invX + 250, invY + 50);
    const resultX = invX + 270;
    const resultY = invY + 70;
    ctx.strokeStyle = 'gold';
    ctx.strokeRect(resultX, resultY, 40, 40);
    
    if (craftResult) {
        ctx.fillStyle = getBlockInfo(craftResult.output.id).color;
        ctx.fillRect(resultX, resultY, 40, 40);
        ctx.fillStyle = 'white';
        ctx.fillText(craftResult.output.count, resultX + 5, resultY + 35);
    }
    
    // Draw main inventory slots (bottom)
    // ...
}
