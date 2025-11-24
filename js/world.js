// /js/world.js
// Note: You would use a more complex algorithm like Perlin Noise for true Minecraft terrain.

let worldMap = [];
let TILE_SIZE = 32;
const BLOCKS = {
    '1': { color: '#00AA00', name: 'Grass' }, // Green
    '2': { color: '#8B4513', name: 'Dirt' },  // Brown
    '3': { color: '#778899', name: 'Stone' }, // Grey
    '0': { color: '#87CEEB', name: 'Sky' }    // Light Blue (Background)
};

export function generateWorld(seed, width, height, tileSize) {
    TILE_SIZE = tileSize;
    const cols = Math.ceil(width / TILE_SIZE);
    const rows = Math.ceil(height / TILE_SIZE);
    
    // Simple, predictable terrain generation for PoC
    const terrainHeight = 15; 
    
    for (let x = 0; x < cols; x++) {
        worldMap[x] = [];
        // Determine the surface level (can be randomized by seed later)
        const surfaceY = rows - terrainHeight + (x % 5 === 0 ? 1 : 0); 
        
        for (let y = 0; y < rows; y++) {
            if (y < surfaceY - 1) {
                worldMap[x][y] = '0'; // Sky
            } else if (y === surfaceY - 1) {
                worldMap[x][y] = '1'; // Grass
            } else if (y < surfaceY + 4) {
                worldMap[x][y] = '2'; // Dirt
            } else {
                worldMap[x][y] = '3'; // Stone
            }
        }
    }
    console.log(`Generated world map: ${cols}x${rows}`);
}

export function drawWorld(ctx, tileSize, cameraX, cameraY) {
    for (let x = 0; x < worldMap.length; x++) {
        for (let y = 0; y < worldMap[x].length; y++) {
            const blockId = worldMap[x][y];
            const block = BLOCKS[blockId];
            
            if (blockId !== '0') { // Don't draw "sky" blocks
                const screenX = x * tileSize + cameraX;
                const screenY = y * tileSize + cameraY;

                ctx.fillStyle = block.color;
                ctx.fillRect(screenX, screenY, tileSize, tileSize);
                
                // Optional: Draw grid lines for clarity
                ctx.strokeStyle = '#00000033';
                ctx.strokeRect(screenX, screenY, tileSize, tileSize);
            }
        }
    }
}

export function getBlockAt(worldX, worldY) {
    const col = Math.floor(worldX / TILE_SIZE);
    const row = Math.floor(worldY / TILE_SIZE);
    if (worldMap[col] && worldMap[col][row]) {
        return { 
            id: worldMap[col][row], 
            properties: BLOCKS[worldMap[col][row]],
            x: col, y: row
        };
    }
    return null;
}

export function removeBlock(col, row) {
    if (worldMap[col] && worldMap[col][row] && worldMap[col][row] !== '0') {
        worldMap[col][row] = '0'; // Replace with air/sky
    }
}
