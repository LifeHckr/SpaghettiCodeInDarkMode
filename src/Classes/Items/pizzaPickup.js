class pizzaSlice extends PickupItem {

    addOverlap() {
        this.scene.physics.add.overlap(this.scene.playerGroup, this, (obj1, obj2) => {
           this.scene.timer.time += 50;
           obj2.destroy();
        });
    }
}

