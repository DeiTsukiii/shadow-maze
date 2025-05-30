import { CONFIG } from "../config.js";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.cameras.main.setBackgroundColor('#0e0e0e');
        const centerX = this.cameras.main.width / 2, centerY = this.cameras.main.height / 2;
        const loadingText = this.add.text(centerX, centerY - 50, 'Loading...', { font: '40px Monospace', fill: '#fff' }).setOrigin(0.5);
        const progressBar = this.add.graphics(), progressBox = this.add.graphics().fillStyle(0x222222, 0.8).fillRect(centerX - 160, centerY, 320, 50);
        this.load.on('progress', value => {
            progressBar.clear().fillStyle(0xffffff, 1).fillRect(centerX - 150, centerY + 10, 300 * value, 30);
        });
        this.load.once('complete', () => [progressBar, progressBox, loadingText].forEach(obj => obj.destroy()));

        this.load.image('ground', `src/assets/brick.png`);
        this.load.image('player', `src/assets/player.png`);
        this.load.image('ennemy', `src/assets/ennemy.png`);
        this.load.image('goal', `src/assets/goal.png`);
        this.load.image('exit', `src/assets/exit.png`);
        this.load.spritesheet('jumpscare', `src/assets/jumpscare.png`, { frameWidth: 50, frameHeight: 50 });

        this.load.audio('jumpscare', 'src/assets/jumpscare.wav');
        this.load.audio('exitOpen', 'src/assets/exitOpen.wav');
        this.load.audio('goal', 'src/assets/goal.mp3');
        this.load.audio('music', 'src/assets/music.mp3');
    }

    createMergedWalls() {
        const processedGrid = this.grid.map(row => [...row]);
        const numRows = processedGrid.length;
        const numCols = processedGrid[0].length;

        const createWallSegment = (x, y, widthTiles, heightTiles) => {
            const wallWidth = widthTiles * this.tileSize;
            const wallHeight = heightTiles * this.tileSize;
            const wallX = (x * this.tileSize) + (wallWidth / 2);
            const wallY = (y * this.tileSize) + (wallHeight / 2);

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
                    const groundX = x * this.tileSize + 25;
                    const groundY = y * this.tileSize + 25;
                    this.add.image(groundX, groundY, 'ground');
                }
            }
        }
    }

    pickRandomPos(setX, setY) {
        const forbidden = [[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[7,3]];
        let x, y, isInSafeZone;

        if (setX && setY) {
            x = setX;
            y = setY;
        } else {
            do {
                x = Phaser.Math.Between(0, this.grid[0].length - 1);
                y = Phaser.Math.Between(0, this.grid.length - 1);
                isInSafeZone = forbidden.some(([fx, fy]) => fx === x && fy === y);
            } while (this.grid[y][x] !== 0 || isInSafeZone);
        }

        return { x: x * this.tileSize + this.tileSize / 2, y: y * this.tileSize + this.tileSize / 2 }
    }

    win() {
        this.uiScene.updateGoal();

        const exitPoss = [
            { x: 33, y: 17 },
            { x: 33, y: 3 },
            { x: 21, y: 19 },
            { x: 1, y: 17 },
            { x: 11, y: 1 }
        ];

        const chosen = Phaser.Utils.Array.GetRandom(exitPoss);
        const exitPos = {
            x: chosen.x * this.tileSize + this.tileSize / 2,
            y: chosen.y * this.tileSize + this.tileSize / 2
        };

        this.exit = this.physics.add
            .sprite(exitPos.x, exitPos.y, 'exit')
            .setCollideWorldBounds(true)
            .setDepth(10);

        this.physics.add.overlap(this.obj, this.exit, () => {
            setTimeout(() => {
                this.scene.pause();
                this.uiScene.win();
            }, 200);
        });
    }

    gameOver() {
        this.music.setRate(1);
        this.uiScene.gameOver();
        this.hasSpottedPlayer = false;
        this.pickRandomTarget();
        this.obj.rotation = -Math.PI / 2;
        this.lastPlayerAngle = -Math.PI / 2;
        this.obj.setPosition(375, 175);
        if (!this.debug) this.cameras.main.setZoom(3);
        this.currentCameraZoom = 3;
    }

    create() {
        this.uiScene = this.scene.get('UIScene');
        this.debug = CONFIG.physics.arcade.debug;
        this.tileSize = 50;

        this.grid = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1],
            [1,0,1,1,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1],
            [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
            [1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1,1,1,1,0,1,1,1,0,1,1,1],
            [1,0,1,0,1,0,1,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,1,0,1,0,1],
            [1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,0,0,1],
            [1,0,0,0,1,0,0,0,0,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,1,0,1],
            [1,1,1,0,1,1,1,0,1,1,1,0,1,0,1,1,0,1,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1],
            [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,0,0,0,0,1],
            [1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1],
            [1,0,1,0,1,0,1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,1,0,1,0,1,0,0,0,0,0,1],
            [1,0,1,0,1,0,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,0,0,1,0,1,0,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,1],
            [1,1,0,1,1,0,1,0,1,0,1,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,0,1,0,1],
            [1,0,0,0,1,0,1,0,1,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
            [1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,0,1,0,1,1,1],
            [1,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1],
            [1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1,0,1],
            [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        ];

        this.easystar = new EasyStar.js();
        this.easystar.setGrid(this.grid);
        this.easystar.setAcceptableTiles([0]);

        this.tempRayLine = new Phaser.Geom.Line();
        this.wallRects = [];
        this.walls = this.physics.add.staticGroup();
        this.createMergedWalls();

        this.add.graphics().fillStyle(0x0000ff, 1).fillRect(0, 0, 25, 25).generateTexture('blueSquare', 25, 25).destroy();
        this.obj = this.physics.add.sprite(375, 175, 'player').setCollideWorldBounds(true).setDepth(1000);

        this.playerLightRadius = 150;
        this.playerLightAngle = 120;

        this.lightForwardOffset = this.obj.width * 0.5;
        this.lightSideOffset = this.obj.height * 0.35;

        this.darkness = this.add.graphics({ fillStyle: { color: 0x000000, alpha: 1 } });
        this.darkness.fillRect(0, 0, this.cameras.main.width / this.cameras.main.zoom, this.cameras.main.height / this.cameras.main.zoom);
        this.darkness.setScrollFactor(0).setDepth(100).setVisible(!this.debug);

        this.light = this.make.graphics({ x: 0, y: 0, add: false });
        this.light.fillStyle(0xffffff);

        this.obj.rotation = -Math.PI / 2;
        this.lastPlayerAngle = -Math.PI / 2;

        this.lightMask = this.light.createGeometryMask();
        this.lightMask.invertAlpha = true;
        this.darkness.setMask(this.lightMask).setDepth(101).setVisible(!this.debug);

        if (!this.debug) this.cameras.main.setZoom(3);

        this.cameras.main.startFollow(this.obj, true, 0.09, 0.09);
        if (this.debug) this.cameras.main.setBounds(0, 0, 1750, 1050);

        this.enemy = this.physics.add.sprite(450, 350, 'ennemy').setCollideWorldBounds(true).setDepth(9);
        this.hasSpottedPlayer = false;
        this.timeSinceLostPlayer = 0;
        this.followTimeout = 5000;

        this.enemyLightForwardOffset = this.enemy.width * 0.3;
        this.enemyLightSideOffset = this.enemy.height * 0;

        this.physics.add.collider(this.obj, this.walls);
        this.physics.add.collider(this.enemy, this.walls);
        this.physics.add.overlap(this.obj, this.enemy, () => this.gameOver());

        this.visionGraphics = this.add.graphics({ fillStyle: { color: 0xff0000, alpha: 0.2 } });

        this.enemyTarget = new Phaser.Math.Vector2();
        this.pickRandomTarget();
        this.visionRadius = 200;
        this.visionAngle = 90;
        this.visionAngleRad = Phaser.Math.DegToRad(this.visionAngle);

        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            upAlt: Phaser.Input.Keyboard.KeyCodes.Z,
            leftAlt: Phaser.Input.Keyboard.KeyCodes.Q,
            p: Phaser.Input.Keyboard.KeyCodes.P
        });

        this.targetMarker = this.add.graphics();
        this.targetMarker.fillStyle(0xff0000, 1);
        this.targetMarker.fillCircle(0, 0, 10);
        this.targetMarker.setDepth(15);
        this.targetMarker.setVisible(this.debug);

        this.targetMarker.x = this.enemyTarget.x;
        this.targetMarker.y = this.enemyTarget.y;

        this.goals = this.physics.add.staticGroup();
        this.nbGoals = 10;
        this.goalsColected = 0;

        const usedTiles = [];

        while (this.goals.getChildren().length < this.nbGoals) {
            const { x, y } = this.pickRandomPos();

            const key = `${x},${y}`;
            if (usedTiles.includes(key)) continue;

            usedTiles.push(key);
            this.goals.create(x, y, 'goal');
        }

        this.physics.add.overlap(this.obj, this.goals, (player, goal) => {
            this.goalsColected ++;
            this.uiScene.updateScore(this.goalsColected);
            goal.destroy();
            if (this.goalsColected === this.nbGoals) {
                this.sound.play('exitOpen');
                this.win();
            } else this.sound.play('goal');
        });
        this.scene.launch('UIScene');
        this.music = this.sound.add('music', { loop: true, rate: 1 });
        this.music.play();
    }

    hasLineOfSight(x1, y1, x2, y2) {
        const line = new Phaser.Geom.Line(x1, y1, x2, y2);
        const tilesToCheck = [];

        this.walls.children.iterate((wall) => {
            if (!wall) return;
            const bounds = wall.getBounds();
            const rect = new Phaser.Geom.Rectangle(bounds.x, bounds.y, bounds.width, bounds.height);
            if (Phaser.Geom.Intersects.LineToRectangle(line, rect)) {
                tilesToCheck.push(wall);
            }
        });

        return tilesToCheck.length === 0;
    }

    pickRandomTarget(setX, setY) {
        const pos = this.pickRandomPos(setX, setY);

        this.enemyTarget.set(pos.x, pos.y);

        if (this.targetMarker) {
            this.targetMarker.x = pos.x;
            this.targetMarker.y = pos.y;
        }
    }

    findPath(startX, startY, endX, endY) {
        this.easystar.findPath(startX, startY, endX, endY, (path) => {
            if (path && path.length > 0) {
                path.shift();
                this.path = path;
            } else {
                this.path = [];
            }
        });
        this.easystar.calculate();
    }

    castRayToWall(startX, startY, angle, maxDistance) {
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);

        let closestHitX = startX + dx * maxDistance;
        let closestHitY = startY + dy * maxDistance;
        let minDistance = maxDistance;

        this.tempRayLine.x1 = startX;
        this.tempRayLine.y1 = startY;

        const rayEndX = startX + dx * maxDistance;
        const rayEndY = startY + dy * maxDistance;

        for (let i = 0; i < this.wallRects.length; i++) {
            const wallRect = this.wallRects[i];

            this.tempRayLine.x2 = rayEndX;
            this.tempRayLine.y2 = rayEndY;

            const intersections = Phaser.Geom.Intersects.GetLineToRectangle(this.tempRayLine, wallRect);

            if (intersections.length > 0) {
                intersections.forEach(intersectPoint => {
                    const dist = Phaser.Math.Distance.Between(startX, startY, intersectPoint.x, intersectPoint.y);
                    if (dist < minDistance) {
                        minDistance = dist;
                        closestHitX = intersectPoint.x;
                        closestHitY = intersectPoint.y;
                    }
                });
            }
        }

        return { x: closestHitX, y: closestHitY };
    }

    update(time, delta) {
        if (this.keys.p.isDown) while (true) {}

        this.light.clear();
        this.light.fillStyle(0xffffff);

        let playerAngle = this.lastPlayerAngle;

        if (this.obj.body.velocity.x !== 0 || this.obj.body.velocity.y !== 0) {
            const targetAngle = Math.atan2(this.obj.body.velocity.y, this.obj.body.velocity.x);
            this.obj.rotation = Phaser.Math.Angle.RotateTo(this.obj.rotation, targetAngle, 0.2);
            playerAngle = this.obj.rotation;
            this.lastPlayerAngle = playerAngle;
        }

        const playerOrigin = new Phaser.Math.Vector2(
            this.obj.x + Math.cos(playerAngle) * this.lightForwardOffset + Math.cos(playerAngle + Math.PI / 2) * this.lightSideOffset,
            this.obj.y + Math.sin(playerAngle) * this.lightForwardOffset + Math.sin(playerAngle + Math.PI / 2) * this.lightSideOffset
        );

        const playerFov = Phaser.Math.DegToRad(this.playerLightAngle);
        const playerRayCount = 60;
        const playerLightPoints = [];

        playerLightPoints.push(playerOrigin);

        for (let i = 0; i <= playerRayCount; i++) {
            const rayAngle = playerAngle - playerFov / 2 + (playerFov * i) / playerRayCount;
            const hit = this.castRayToWall(playerOrigin.x, playerOrigin.y, rayAngle, this.playerLightRadius);
            playerLightPoints.push(hit);
        }

        this.light.beginPath();
        this.light.moveTo(playerLightPoints[0].x, playerLightPoints[0].y);
        for (let i = 1; i < playerLightPoints.length; i++) {
            this.light.lineTo(playerLightPoints[i].x, playerLightPoints[i].y);
        }
        this.light.closePath();
        this.light.fillPath();

        const speed = 200;
        const body = this.obj.body;

        let vx = 0;
        let vy = 0;

        if (this.keys.left.isDown || this.keys.leftAlt.isDown) vx = -1;
        else if (this.keys.right.isDown) vx = 1;

        if (this.keys.up.isDown || this.keys.upAlt.isDown) vy = -1;
        else if (this.keys.down.isDown) vy = 1;

        if (vx !== 0 || vy !== 0) {
            const len = Math.sqrt(vx * vx + vy * vy);
            vx = (vx / len) * speed;
            vy = (vy / len) * speed;
        }

        body.setVelocity(vx, vy);

        const dx = this.obj.x - this.enemy.x;
        const dy = this.obj.y - this.enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angleToPlayer = Math.atan2(dy, dx);
        const deltaAngle = Phaser.Math.Angle.Wrap(angleToPlayer - this.enemy.rotation);
        const hasLOS = this.hasLineOfSight(this.enemy.x, this.enemy.y, this.obj.x, this.obj.y);
        const inVision = Math.abs(deltaAngle) < (this.visionAngleRad / 2) && distance < this.visionRadius && hasLOS;

        const enemySpeed = this.hasSpottedPlayer ? 290 : 150;

        if (inVision) {
            if (!this.debug && this.currentCameraZoom !== 2.5) {
                this.tweens.add({
                    targets: this.cameras.main,
                    zoom: 2.5,
                    duration: 500,
                    ease: 'Power2'
                });
                this.currentCameraZoom = 2.5;
                this.music.setRate(6);
            }
            this.hasSpottedPlayer = true;
            this.timeSinceLostPlayer = 0;
        } else if (this.hasSpottedPlayer) {
            this.timeSinceLostPlayer += delta;
            if (this.timeSinceLostPlayer >= this.followTimeout) {
                if (!this.debug && this.currentCameraZoom !== 3) {
                    this.tweens.add({
                        targets: this.cameras.main,
                        zoom: 3,
                        duration: 750,
                        ease: 'Power2'
                    });
                    this.currentCameraZoom = 3;
                    this.music.setRate(1);
                }
                this.hasSpottedPlayer = false;
                this.timeSinceLostPlayer = 0;
            }
        }
        this.visionGraphics.clear();

        const origin = new Phaser.Math.Vector2(
            this.enemy.x + Math.cos(this.enemy.rotation) * this.enemyLightForwardOffset + Math.cos(this.enemy.rotation + Math.PI / 2) * this.enemyLightSideOffset,
            this.enemy.y + Math.sin(this.enemy.rotation) * this.enemyLightForwardOffset + Math.sin(this.enemy.rotation + Math.PI / 2) * this.enemyLightSideOffset
        );
        const angle = this.enemy.rotation;
        const fov = this.visionAngleRad;
        const rayCount = 40;
        const visionDistance = this.visionRadius;
        const points = [];

        for (let i = 0; i <= rayCount; i++) {
            const rayAngle = angle - fov / 2 + (fov * i) / rayCount;
            const hit = this.castRayToWall(origin.x, origin.y, rayAngle, visionDistance);
            points.push(hit);
        }

        this.visionGraphics.beginPath();
        this.visionGraphics.moveTo(origin.x, origin.y);
        points.forEach(p => this.visionGraphics.lineTo(p.x, p.y));
        this.visionGraphics.closePath();
        this.visionGraphics.fillStyle(0xff0000, 0.3);
        this.visionGraphics.fillPath();

        if (this.hasSpottedPlayer) {
            const playerTileX = Math.floor(this.obj.x / this.tileSize) * this.tileSize + this.tileSize / 2;
            const playerTileY = Math.floor(this.obj.y / this.tileSize) * this.tileSize + this.tileSize / 2;

            const forbidden = [[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[7,3]];
            const tilePos = [Math.floor(this.obj.x / this.tileSize), Math.floor(this.obj.y / this.tileSize)];

            const isInSafeZone = forbidden.some(([fx, fy]) => fx === tilePos[0] && fy === tilePos[1]);

            if (isInSafeZone) {
                if (!this.debug && this.currentCameraZoom !== 3) {
                    this.tweens.add({
                        targets: this.cameras.main,
                        zoom: 3,
                        duration: 750,
                        ease: 'Power2'
                    });
                    this.currentCameraZoom = 3;
                    this.music.setRate(1);
                }
                this.hasSpottedPlayer = false;
                this.pickRandomTarget();
            } else {
                this.enemyTarget.set(playerTileX, playerTileY);
                const startX = Math.floor(this.enemy.x / this.tileSize);
                const startY = Math.floor(this.enemy.y / this.tileSize);
                const endX = Math.floor(this.enemyTarget.x / this.tileSize);
                const endY = Math.floor(this.enemyTarget.y / this.tileSize);
                this.findPath(startX, startY, endX, endY);
            }
        }
        if (!this.path || this.path.length === 0) {
            const startX = Math.floor(this.enemy.x / this.tileSize);
            const startY = Math.floor(this.enemy.y / this.tileSize);
            const endX = Math.floor(this.enemyTarget.x / this.tileSize);
            const endY = Math.floor(this.enemyTarget.y / this.tileSize);

            this.findPath(startX, startY, endX, endY);
        } else {
            const target = this.path[0];
            const tx = target.x * this.tileSize + this.tileSize / 2;
            const ty = target.y * this.tileSize + this.tileSize / 2;

            const dx = tx - this.enemy.x;
            const dy = ty - this.enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            const fx = Math.floor(this.enemyTarget.x / this.tileSize) * this.tileSize + this.tileSize / 2;
            const fy = Math.floor(this.enemyTarget.y / this.tileSize) * this.tileSize + this.tileSize / 2;
            const distToTarget = Phaser.Math.Distance.Between(this.enemy.x, this.enemy.y, fx, fy);


            if (dist < 5) {
                this.path.shift();
            } else {
                const angle = Math.atan2(dy, dx);
                this.enemy.rotation = Phaser.Math.Angle.RotateTo(this.enemy.rotation, angle, 0.1);
                const vx = Math.cos(angle) * enemySpeed * 0.6;
                const vy = Math.sin(angle) * enemySpeed * 0.6;
                this.enemy.setVelocity(vx, vy);
            }

            if (distToTarget < 10) {
                this.pickRandomTarget();
                this.path = [];
            }

            if (this.targetMarker) {
                this.targetMarker.x = this.enemyTarget.x;
                this.targetMarker.y = this.enemyTarget.y;
            }
        }
    }
}