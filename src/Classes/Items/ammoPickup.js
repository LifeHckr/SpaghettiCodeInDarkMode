class Ammo extends PickupItem {

    addOverlap() {
        this.scene.physics.add.overlap(this.scene.playerGroup, this, (obj1, obj2) => {
            if (obj1.gun.currentAmmo < obj1.maxAmmo) {
                obj1.gun.reloadBullet(1);
                obj2.destroy();
            }
        });
    }
}

