// /js/inventory.js - COMPLETE SCRIPT (3x3 Crafting & Armor UI)
import { CRAFTING_RECIPES } from './crafting.js';
import { getBlockInfo } from './utils.js';
import * as Player from './player.js';

let items = new Array(27).fill(null); 
let hotbar = new Array(9).fill(null); 
// Add some initial items for testing: Wood, Plank, Stick, Tool, Armor, Food
hotbar[0] = { id: 'WOOD', count: 5, type: 'BLOCK' };
hotbar[1] = { id: 'PLANK', count: 10, type: 'BLOCK' };
hotbar[2] = { id: 'STICK', count: 5, type: 'ITEM' };
hotbar[3] = { id: 'PICKAXE_WOOD', count: 1, type: 'TOOL', durability: 60, maxDurability: 60, toolType: 'PICKAXE', efficiency: 0.5, color: 'brown' };
hotbar[4] = { id: 'MUTTON', count: 3, type: 'FOOD', restoresHunger: 5, color: '#FFFACD' };
hotbar[5] = { id: 'HELMET_IRON', count: 1, type: 'ARMOR', slot: 'helmet', defense: 2, color: '#C0C0C0' };


let isOpen = false;
let selectedSlot = 0; 
let inventoryCrafting = new Array(9).fill(null); // Now 9 slots to support 3x3
let craftingMode = 2; // 2 for 2x2 (default/inventory), 3 for 3x3 (crafting table)

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

export function setCraftingMode(mode) {
    craftingMode = mode;
    // Clear grid when switching mode to avoid using 3x3 recipes in 2x2
    inventoryCrafting.fill(null); 
    checkCraftingResult();
}

export function toggleInventory() {
    isOpen = !isOpen;
    if (isOpen) {
        // If opened without interacting with a table, default back to 2x2
        if (craftingMode !== 3) {
            setCraftingMode(2); 
        }
        checkCraftingResult();
    }
}

export function getSelectedItem() {
    return hotbar[selectedSlot];
}

export function addItem(id, count) {
    // Logic to stack, then find empty slot (simplified)
    for (let slot of hotbar) {
        if (slot && slot.id === id && slot.count < 64) {
            slot.count += count;
            return;
        }
    }
    
    // Try hotbar first, then main inventory
    const slots = [...hotbar, ...items];
    for (let i = 0; i < slots.length; i++) {
        if (!slots[i]) {
            const info = getBlockInfo(id);
            const newItem = { 
                id: id, 
                count: count, 
                type: info.type,
                durability: info.maxDurability,
                maxDurability: info.maxDurability,
                toolType: info.toolType,
                efficiency: info.efficiency,
                slot: info.slot, // for armor
                defense: info.defense, // for armor
                restoresHunger: info.restoresHunger, // for food
            };
            if (i < hotbar.length) {
                hotbar[i] = newItem;
            } else {
                items[i - hotbar.length] = newItem;
            }
            return;
        }
    }
}

// --- Crafting Logic ---

let craftResult = null;

function checkCraftingResult() {
    const gridSize = craftingMode * craftingMode;
    const input = inventoryCrafting.slice(0, gridSize).map(slot => slot ? slot.id : null);
    
    craftResult = CRAFTING_RECIPES.find(recipe => {
        if (recipe.size === craftingMode) {
            const recipeIDs = recipe.ingredients.map(ing => ing ? ing.id : null);
            
            // Check if the input matches the recipe shape exactly
            // If 2x2, only check the first 4 input slots against the first 4 recipe slots
            if (input.length !== recipeIDs.length) return false;
            
            return recipeIDs.every((id, index) => id === input[index]);
        }
        return false;
    });
}

// --- Drawing UI ---

export function drawUI(ctx, w, h) {
    drawHotbar(ctx, w, h);
    if (isOpen) {
        drawInventory(ctx, w, h);
    }
}

// ... (drawHotbar remains the same)

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
                ctx.fillRect(x, y + 35, 40 * durabilityRatio, 5);
            }
        }
    }
}


function drawInventory(ctx, w, h) {
    // Draw inventory panel
    const invW = 480; 
    const invH = 350;
    const invX = w / 2 - invW / 2;
    const invY = h / 2 - invH / 2;
    
    ctx.fillStyle = 'rgba(100, 100, 100, 0.9)';
    ctx.fillRect(invX, invY, invW, invH);
    
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    
    // --- 1. Armor Slots (Top Left) ---
    const armorSlots = Player.getPlayerState().armor;
    const armorOrder = ['helmet', 'chestplate', 'leggings', 'boots'];
    ctx.fillText("Armor", invX + 30, invY + 20);
    
    for (let i = 0; i < 4; i++) {
        const slotKey = armorOrder[i];
        const item = armorSlots[slotKey];
        const x = invX + 30;
        const y = invY + 30 + i * 50;
        ctx.strokeStyle = 'black';
        ctx.strokeRect(x, y, 40, 40);
        
        if (item) {
            ctx.fillStyle = item.color; // Needs color property on the armor item
            ctx.fillRect(x, y, 40, 40);
        }
    }

    // --- 2. Crafting Grid (Center) ---
    const gridSize = craftingMode; // 2 or 3
    const gridXStart = invX + 120;
    const gridYStart = invY + 30;
    
    ctx.fillText(gridSize === 3 ? "Crafting Table (3x3)" : "Crafting (2x2)", gridXStart, invY + 20);

    for (let i = 0; i < gridSize * gridSize; i++) {
        // Only draw up to 4 slots if in 2x2 mode
        if (gridSize === 2 && i >= 4) continue;
        
        const x = gridXStart + (i % gridSize) * 45;
        const y = gridYStart + Math.floor(i / gridSize) * 45;
        ctx.strokeStyle = 'black';
        ctx.strokeRect(x, y, 40, 40);
        // TODO: Draw items in inventoryCrafting[i]
    }
    
    // --- 3. Crafting Result Slot (Right) ---
    ctx.fillText("Result", gridXStart + gridSize * 45 + 20, invY + 50);
    const resultX = gridXStart + gridSize * 45 + 40;
    const resultY = invY + 70;
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
    
    // --- 4. Main Inventory Slots (Bottom) ---
    // ... (Drawing logic for the 27 main slots)
}
