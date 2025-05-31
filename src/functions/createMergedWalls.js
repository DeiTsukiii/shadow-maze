export function createMergedWalls(grid, tileSize, ground) {
    const processedGrid = grid.map(row => [...row]);
    const numRows = processedGrid.length;
    const numCols = processedGrid[0].length;

    const createWallSegment = (x, y, widthTiles, heightTiles) => {
        const wallWidth = widthTiles * tileSize;
        const wallHeight = heightTiles * tileSize;
        const wallX = (x * tileSize) + (wallWidth / 2);
        const wallY = (y * tileSize) + (wallHeight / 2);

        const textureKey = `wallTexture_${x}_${y}_${widthTiles}x${heightTiles}`;

        if (!this.textures.exists(textureKey)) {
            const wallGraphics = this.add.graphics()
                .fillStyle(0x000000, 1)
                .fillRect(0, 0, wallWidth, wallHeight);
            wallGraphics.generateTexture(textureKey, wallWidth, wallHeight);
            wallGraphics.destroy();
        }

        const wallSprite = this.walls.create(wallX, wallY, textureKey).setDepth(11);

        const bounds = wallSprite.getBounds();
        this.wallRects.push(new Phaser.Geom.Rectangle(bounds.x, bounds.y, bounds.width, bounds.height));
    };

    const createCustomWallSegment = (x, y, widthTiles, heightTiles) => {
        const wallWidth = widthTiles;
        const wallHeight = heightTiles;
        const wallX = x;
        const wallY = y;

        const textureKey = `wallTexture_${x}_${y}_${widthTiles}x${heightTiles}`;

        if (!this.textures.exists(textureKey)) {
            const wallGraphics = this.add.graphics()
                .fillStyle(0x000000, 1)
                .fillRect(0, 0, wallWidth, wallHeight);
            wallGraphics.generateTexture(textureKey, wallWidth, wallHeight);
            wallGraphics.destroy();
        }

        const wallSprite = this.walls.create(wallX + tileSize/2 - wallWidth/2, wallY + tileSize/2 - wallHeight/2, textureKey).setOrigin(0.5).setDepth(11);

        const bounds = wallSprite.getBounds();
        this.wallRects.push(new Phaser.Geom.Rectangle(bounds.x, bounds.y, bounds.width, bounds.height));
    };

    for (let y = 0; y < numRows; y++) {
        for (let x = 0; x < numCols; x++) {
            if (processedGrid[y][x] === 1) {
                let segmentWidth = 0;
                while (x + segmentWidth < numCols && processedGrid[y][x + segmentWidth] === 1) {
                    segmentWidth++;
                }

                if (segmentWidth > 0) {
                    let segmentHeight = 1;
                    let canExtendVertically = true;

                    while (canExtendVertically && (y + segmentHeight < numRows)) {
                        for (let i = 0; i < segmentWidth; i++) {
                            if (processedGrid[y + segmentHeight][x + i] !== 1) {
                                canExtendVertically = false;
                                break;
                            }
                        }
                        if (canExtendVertically) {
                            segmentHeight++;
                        }
                    }

                    createWallSegment(x, y, segmentWidth, segmentHeight);

                    for (let r = 0; r < segmentHeight; r++) {
                        for (let c = 0; c < segmentWidth; c++) {
                            processedGrid[y + r][x + c] = 2;
                        }
                    }
                }
            } else {
                const groundX = x * tileSize + 25;
                const groundY = y * tileSize + 25;
                this.add.image(groundX, groundY, ground).setDisplaySize(tileSize, tileSize);
            }
        }
    }
}