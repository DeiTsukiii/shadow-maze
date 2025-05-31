import { castRayToWall } from "../functions/castRayToWall.js";
import { pickRandomPos } from "../functions/pickRandomPos.js";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, grid, tileSize, debug) {
        super(scene, x, y, texture);

        this.scene = scene;
        this.debug = debug;
        this.grid = grid;
        this.tileSize = tileSize;

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.easystar = new EasyStar.js();
        this.easystar.setGrid(grid);
        this.easystar.setAcceptableTiles([0]);

        this.setCollideWorldBounds(true).setDepth(9);

        this.hasSpottedPlayer = false;
        this.timeSinceLostPlayer = 0;
        this.followTimeout = 5000;
        this.lightForwardOffset = this.width * 0.3;
        this.lightSideOffset = this.height * 0;
        this.visionRadius = 200;
        this.visionAngle = 90;

        this.tempRayLine = new Phaser.Geom.Line();
        this.visionGraphics = this.scene.add.graphics({ fillStyle: { color: 0xff0000, alpha: 0.2 } });

        this.target = new Phaser.Math.Vector2();
        this.pickRandomTarget();
        this.visionAngleRad = Phaser.Math.DegToRad(this.visionAngle);

        this.targetMarker = this.scene.add.graphics().fillStyle(0xff0000, 1).fillCircle(0, 0, 10).setDepth(15).setVisible(debug);
        this.targetMarker.x = this.target.x;
        this.targetMarker.y = this.target.y;
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

    pickRandomTarget(setX, setY) {
        const pos = pickRandomPos(this.grid, this.tileSize, setX, setY);

        this.target.set(pos.x, pos.y);

        if (this.targetMarker) {
            this.targetMarker.x = pos.x;
            this.targetMarker.y = pos.y;
        }
    }

    hasLineOfSight(x1, y1, x2, y2, walls) {
        const line = new Phaser.Geom.Line(x1, y1, x2, y2);
        const tilesToCheck = [];

        walls.children.iterate((wall) => {
            if (!wall) return;
            const bounds = wall.getBounds();
            const rect = new Phaser.Geom.Rectangle(bounds.x, bounds.y, bounds.width, bounds.height);
            if (Phaser.Geom.Intersects.LineToRectangle(line, rect)) {
                tilesToCheck.push(wall);
            }
        });

        return tilesToCheck.length === 0;
    }

    visionUpdate(player, walls, delta) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angleToPlayer = Math.atan2(dy, dx);
        const deltaAngle = Phaser.Math.Angle.Wrap(angleToPlayer - this.rotation);
        const hasLOS = this.hasLineOfSight(this.x, this.y, player.x, player.y, walls);
        const inVision = Math.abs(deltaAngle) < (this.visionAngleRad / 2) && distance < this.visionRadius && hasLOS;

        if (inVision) {
            if (!this.debug && this.currentCameraZoom !== 2.5) {
                this.scene.tweens.add({
                    targets: this.scene.cameras.main,
                    zoom: 2.5,
                    duration: 500,
                    ease: 'Power2'
                });
                this.currentCameraZoom = 2.5;
                this.scene.music.setRate(6);
            }
            this.hasSpottedPlayer = true;
            this.timeSinceLostPlayer = 0;
        } else if (this.hasSpottedPlayer) {
            this.timeSinceLostPlayer += delta;
            if (this.timeSinceLostPlayer >= this.followTimeout) {
                if (!this.debug && this.currentCameraZoom !== 3) {
                    this.scene.tweens.add({
                        targets: this.scene.cameras.main,
                        zoom: 3,
                        duration: 750,
                        ease: 'Power2'
                    });
                    this.currentCameraZoom = 3;
                    this.scene.music.setRate(1);
                }
                this.hasSpottedPlayer = false;
                this.timeSinceLostPlayer = 0;
            }
        }

        this.visionGraphics.clear();

        const origin = new Phaser.Math.Vector2(
            this.x + Math.cos(this.rotation) * this.lightForwardOffset + Math.cos(this.rotation + Math.PI / 2) * this.lightSideOffset,
            this.y + Math.sin(this.rotation) * this.lightForwardOffset + Math.sin(this.rotation + Math.PI / 2) * this.lightSideOffset
        );
        const angle = this.rotation;
        const fov = this.visionAngleRad;
        const rayCount = 40;
        const visionDistance = this.visionRadius;
        const points = [];

        for (let i = 0; i <= rayCount; i++) {
            const rayAngle = angle - fov / 2 + (fov * i) / rayCount;
            const hit = castRayToWall.call(this, origin.x, origin.y, rayAngle, visionDistance);
            points.push(hit);
        }

        this.visionGraphics.beginPath();
        this.visionGraphics.moveTo(origin.x, origin.y);
        points.forEach(p => this.visionGraphics.lineTo(p.x, p.y));
        this.visionGraphics.closePath();
        this.visionGraphics.fillStyle(0xff0000, 0.3);
        this.visionGraphics.fillPath();
    }

    move(player) {
        const speed = this.hasSpottedPlayer ? 290 : 150;
        if (this.hasSpottedPlayer) {
            const playerTileX = Math.floor(player.x / this.tileSize) * this.tileSize + this.tileSize / 2;
            const playerTileY = Math.floor(player.y / this.tileSize) * this.tileSize + this.tileSize / 2;

            const forbidden = [[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[7,3]];
            const tilePos = [Math.floor(player.x / this.tileSize), Math.floor(player.y / this.tileSize)];

            const isInSafeZone = forbidden.some(([fx, fy]) => fx === tilePos[0] && fy === tilePos[1]);

            if (isInSafeZone) {
                if (!this.debug && this.currentCameraZoom !== 3) {
                    this.scene.tweens.add({
                        targets: this.scene.cameras.main,
                        zoom: 3,
                        duration: 750,
                        ease: 'Power2'
                    });
                    this.currentCameraZoom = 3;
                    this.scene.music.setRate(1);
                }
                this.hasSpottedPlayer = false;
                this.pickRandomTarget();
            } else {
                this.target.set(playerTileX, playerTileY);
                const startX = Math.floor(this.x / this.tileSize);
                const startY = Math.floor(this.y / this.tileSize);
                const endX = Math.floor(this.target.x / this.tileSize);
                const endY = Math.floor(this.target.y / this.tileSize);
                this.findPath(startX, startY, endX, endY);
            }
        }
        if (!this.path || this.path.length === 0) {
            const startX = Math.floor(this.x / this.tileSize);
            const startY = Math.floor(this.y / this.tileSize);
            const endX = Math.floor(this.target.x / this.tileSize);
            const endY = Math.floor(this.target.y / this.tileSize);

            this.findPath(startX, startY, endX, endY);
        } else {
            const target = this.path[0];
            const tx = target.x * this.tileSize + this.tileSize / 2;
            const ty = target.y * this.tileSize + this.tileSize / 2;

            const dx = tx - this.x;
            const dy = ty - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            const fx = Math.floor(this.target.x / this.tileSize) * this.tileSize + this.tileSize / 2;
            const fy = Math.floor(this.target.y / this.tileSize) * this.tileSize + this.tileSize / 2;
            const distToTarget = Phaser.Math.Distance.Between(this.x, this.y, fx, fy);


            if (dist < 5) {
                this.path.shift();
            } else {
                const angle = Math.atan2(dy, dx);
                this.rotation = Phaser.Math.Angle.RotateTo(this.rotation, angle, 0.1);
                const vx = Math.cos(angle) * speed * 0.6;
                const vy = Math.sin(angle) * speed * 0.6;
                this.setVelocity(vx, vy);
            }

            if (distToTarget < 10) {
                this.pickRandomTarget();
                this.path = [];
            }

            if (this.targetMarker) {
                this.targetMarker.x = this.target.x;
                this.targetMarker.y = this.target.y;
            }
        }
    }

    update(player, walls, delta) {
        this.visionUpdate(player, walls, delta);
        this.move(player)
    }
}