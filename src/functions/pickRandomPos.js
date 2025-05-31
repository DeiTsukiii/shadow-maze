export function pickRandomPos(grid, tileSize, setX, setY) {
    const forbidden = [[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[7,3]];
    let x, y, isInSafeZone;

    if (setX && setY) {
        x = setX;
        y = setY;
    } else {
        do {
            x = Phaser.Math.Between(0, grid[0].length - 1);
            y = Phaser.Math.Between(0, grid.length - 1);
            isInSafeZone = forbidden.some(([fx, fy]) => fx === x && fy === y);
        } while (grid[y][x] !== 0 || isInSafeZone);
    }

    return { x: x * tileSize + tileSize / 2, y: y * tileSize + tileSize / 2 }
}