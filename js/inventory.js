// inventory.js - Conceptual Snippet

let items = new Array(27).fill(null); // Simple 27-slot inventory
let hotbar = new Array(9).fill(null);
let isOpen = false;
let selectedSlot = 0; // For hotbar

export function setupListeners() {
    document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'e') {
            isOpen = !isOpen; // Toggle inventory on 'e'
            console.log('Inventory Toggled:', isOpen);
        }
        // Handle number keys 1-9 for hotbar selection
        if (event.key >= '1' && event.key <= '9') {
            selectedSlot = parseInt(event.key) - 1;
            console.log('Hotbar slot selected:', selectedSlot + 1);
        }
    });
}

export function drawHotbar(ctx) {
    // Logic to draw the hotbar at the bottom of the screen
    // ...
}

export function drawInventory(ctx) {
    if (isOpen) {
        // Logic to draw the main inventory grid and crafting area
        // 
        // ...
    }
}

export function addItem(item, count) {
    // Logic to find an empty slot or stack with existing items
    // ...
}

export function getSelectedItem() {
    return hotbar[selectedSlot];
}
