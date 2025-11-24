// /js/inventory.js - COMPLETE SCRIPT (Includes fix for initInventory export)

export let inventory = []; 
export let hotbar = [];
const HOTBAR_SIZE = 9;

// CRITICAL FIX: The export keyword is required for player.js to access this function.
export function initInventory() {
    // Initialize hotbar with 9 empty slots
    for (let i = 0; i < HOTBAR_SIZE; i++) {
        hotbar.push({ id: 'AIR', count: 0 });
    }
    console.log("Inventory initialized and ready.");
}

// All other functions must also be exported
export function addItemToInventory(id, count) { 
    // Simple test logic for adding items
    if (hotbar.length > 0) {
        if (hotbar[0].id === 'AIR') {
             hotbar[0] = { id, count };
        } else if (hotbar[0].id === id) {
             hotbar[0].count += count;
        } else {
             // Find next empty slot (simplified)
             for(let i = 1; i < HOTBAR_SIZE; i++) {
                 if (hotbar[i].id === 'AIR') {
                     hotbar[i] = { id, count };
                     return;
                 }
             }
        }
    }
    console.log(`Added ${count} of ${id}`); 
}

export function getHotbarItem(slot) { 
    if (slot >= 0 && slot < hotbar.length && hotbar[slot]) {
         return hotbar[slot];
    }
    return { id: 'AIR', count: 0 }; 
}

export function drawInventoryScreen(ctx, w, h, level) { 
    // Placeholder drawing to prevent crashes when pressing 'E'
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(w / 4, h / 4, w / 2, h / 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText("INVENTORY OPEN", w / 4 + 20, h / 4 + 40);
}
export function openInventory(level) { console.log("Inventory opened."); }
export function handleClick(x, y, level) { console.log("Inventory click handled."); }
