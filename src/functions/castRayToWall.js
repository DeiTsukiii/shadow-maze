export function castRayToWall(startX, startY, angle, maxDistance) {
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);

    let closestHitX = startX + dx * maxDistance;
    let closestHitY = startY + dy * maxDistance;
    let minDistance = maxDistance;

    this.tempRayLine.x1 = startX;
    this.tempRayLine.y1 = startY;

    const rayEndX = startX + dx * maxDistance;
    const rayEndY = startY + dy * maxDistance;

    for (let i = 0; i < this.scene.wallRects.length; i++) {
        const wallRect = this.scene.wallRects[i];

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