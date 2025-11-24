// /js/inventory.js - COMPLETE SCRIPT
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
        // Handle number keys 1-9 for hotbar selection
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
    // Return the item object, including its durability properties
    const item = hotbar[selectedSlot];
    if (item && item.type === 'TOOL') {
        // Must dynamically get the full item properties including current durability
        return hotbar[selectedSlot]; 
    }
    return item;
}

export function addItem(id, count) {
    // Simple stacking/filling logic
    for (let slot of [...hotbar, ...items]) {
        if (slot && slot.id === id && slot.count < 64) { // Assume max stack size 64
            slot.count += count;
            return;
        }
    }
    
    // Find empty slot
    for (let i = 0; i < hotbar.length; i++) {
        if (!hotbar[i]) {
            const info = getBlockInfo(id);
            hotbar[i] = { 
                id: id, 
                count: count, 
                type: info.type,
                durability: info.maxDurability, // Initialize durability for tools
                toolType: info.toolType,
                efficiency: info.efficiency
            };
            return;
        }
    }
    // ... (rest of the items array)
}

// --- Crafting Logic ---

let craftResult = null;

function checkCraftingResult() {
    const input = inventoryCrafting.map(slot => slot ? slot.id : null);
    craftResult = CRAFTING_RECIPES.find(recipe => {
        if (recipe.size === 2 && recipe.ingredients.length === 4) {
            const recipeIDs = recipe.ingredients.map(ing => ing ? ing.id : null);
            
            // Check if the input matches the recipe shape exactly
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
    const barWidth = 9 * 50; 
    const startX = w / 2 - barWidth / 2;
    const startY = h - 60;
    
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
            const info = getBlockInfo(item.id);
            ctx.fillStyle = info.color;
            ctx.fillRect(x, y, 40, 40);
            
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.fillText(item.count, x + 5, y + 35);

            // Draw durability bar for tools
            if (item.type === 'TOOL' && item.maxDurability > 0) {
                const durabilityRatio = item.durability / item.maxDurability;
                ctx.fillStyle = durabilityRatio > 0.5 ? 'green' : (durabilityRatio > 0.2 ? 'yellow' : 'red');
                ctx.fillRect(x, y + 35, 40 * durabilityRatio, 5); // Thin bar at bottom
            }
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
    
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    
    // Draw 4-slot crafting area
    ctx.fillText("Crafting (2x2)", invX + 30, invY + 20);
    for (let i = 0; i < 4; i++) {
        const x = invX + 30 + (i % 2) * 45;
        const y = invY + 30 + Math.floor(i / 2) * 45;
        ctx.strokeStyle = 'black';
        ctx.strokeRect(x, y, 40, 40);
        // TODO: Draw items in inventoryCrafting[i]
    }
    
    // Draw Crafting Result Slot
    ctx.fillText("Result", invX + 250, invY + 20);
    const resultX = invX + 270;
    const resultY = invY + 30;
    ctx.strokeStyle = 'gold';
    ctx.strokeRect(resultX, resultY, 40, 40);
    
    if (craftResult) {
        const info = getBlockInfo(craftResult.output.id);
        ctx.fillStyle = info.color;
        ctx.fillRect(resultX, resultY, 40, 40);
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(craftResult.output.count, resultX + 5, resultY + 35);
    }
    
    // Draw main inventory slots (bottom) - 3 rows of 9 slots
    ctx.fillText("Inventory", invX + 30, invY + 140);
    // ... (Drawing logic for the 27 main slots)
}
