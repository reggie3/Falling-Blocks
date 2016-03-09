/// <reference path="./defs/three/three.d.ts" />
/// <reference path="./defs/tween.js/tween.js.d.ts" />

import * as TWEEN from "tween.js";
import * as THREE from "three";
import ThreeItem = require("./threeItem");
import AssetManager = require("./assetManager");

export class FallingItem extends ThreeItem.ThreeItem {
    static FallingItemID: number = 0;
    static FallingItems = {};
    static moveQueue = []; // a FIFO move queue that is executed by the currently falling block
    thisFallingItemID: number;
    movementStatus = "falling";
    type;
    fallingSpeed = 100;
    fallFasterMultiplier = 5;
    static fallFaster = false;
    screen; // the game screen this object is in
    dim = { width: null, height: null, depth: null };
    tweenInfo = {
        deathTime: .25,
        movementTime: .25,    // seconds it takes for the side movement animation to complete
        pos: { x: null, y: null },
        newPos: { x: null, y: null },
        // vertTween: null,
        // horzTween: null,
        // deathTween: null,
        vertTweenComplete: false,
        horzTweenComplete: false,
        rotTweenComplete: false,
        deathShrinkTweenComplete: false,
        deathRotateTweenComplete: false,
        tweenUp: null,
        tweenDown: null,
        vertCount: 0
    };

    constructor(options?) {
        super();
        this.thisFallingItemID = FallingItem.FallingItemID;
        FallingItem.FallingItemID++;

        this.name = options && options.name;
        this.screen = options && options.screen;
        this.movementStatus = options && options.movementStatus || "falling";


        // console.log("FallingItem " + this.thisThreeItemID + " created");

        // add this item to the array of physics items
        FallingItem.FallingItems[this.thisFallingItemID] = this;


        // console.log ("FallingItem " + this.thisFallingItemID + " created");
    }

    update(dt, time) {

        // falling item behavior is based on movement status
        switch (this.movementStatus) {
            case "falling":
                let ground = ThreeItem.ThreeItem.getItemByName("ground");


                if (FallingItem.fallFaster) {
                    this.mesh.position.y -= this.fallingSpeed * this.fallFasterMultiplier * dt;
                }
                else {
                    this.mesh.position.y -= this.fallingSpeed * dt;
                }
                // don't let the blocks be moved to a point below the ground
                if ((this.mesh.position.y < ground.mesh.position.y
                    + this.dim.height / 2
                    + ground.dim.height / 2) && (this.hasOwnProperty("thisCandyID"))) {
                        // move the box up and then tell it to stop moving
                        this.mesh.position.y = ground.mesh.position.y
                            + this.dim.height / 2
                            + ground.dim.height / 2;
                            this.movementStatus = "stopped";
                            AssetManager.AssetManager.assets.glassClink.soundSprite.play();
                            // empty the move queue so that the next block starts out with a new slate
                            FallingItem.moveQueue = [];
                            // console.log("move queue emptied 1");
                            break;
                }

                // check to see if the block has collided with anything
                if (this.checkForCollision()) {
                    this.movementStatus = "stopped";
                    AssetManager.AssetManager.assets.glassClink.soundSprite.play();

                    // empty the move queue so that the next block starts out with a new slate
                    FallingItem.moveQueue = [];
                    // console.log("move queue emptied 2");
                    break;
                }

                // check to see if we've been told to move left or right
                if (FallingItem.moveQueue.length > 0) {
                    switch (FallingItem.moveQueue[0]) {
                        case "left":
                            this.movementStatus = "moveLeft";
                            break;
                        case "right":
                            this.movementStatus = "moveRight";
                            break;
                    }
                    FallingItem.moveQueue.shift();  // remove this directive from the queue
                    break;
                }
                break;
            case "stopped":
            case "checked":
                if (!this.checkForCollision()) {
                    this.movementStatus = "falling";
                }
                break;

            case "moveLeft":    // just received directive to move left
            case "moveRight":   // just received directive to move right
                // y movement direction never changes
                this.tweenInfo.newPos.y = this.mesh.position.y + this.dim.height;

                switch (this.movementStatus) {
                    case "moveLeft":
                        this.movementStatus = "movingLeft";
                        this.tweenInfo.newPos.x = this.mesh.position.x - this.dim.width;
                        break;
                    case "moveRight":
                        this.tweenInfo.newPos.x = this.mesh.position.x + this.dim.width;
                        this.movementStatus = "movingRight";
                        break;
                }

                // don't go beyond the borders of the field
                if ((this.tweenInfo.newPos.x >= -5 * this.dim.width) && (this.tweenInfo.newPos.x <= 5 * this.dim.width)) {

                    // console.log("cur x: " + this.tweenInfo.pos.x + " | new x: " + this.tweenInfo.newPos.x);
                    // console.log("cur y: " + this.tweenInfo.pos.y + " | new y: " + this.tweenInfo.newPos.y);
                    // var that = this;


                    // run the sideways movment tween
                    this.runSideMoveTween();


                }
                else {
                    // just go back to falling if the user
                    // tries to go past the left or right boundaries
                    this.movementStatus = "falling";
                }
                AssetManager.AssetManager.assets.bounce.soundSprite.play();

                break;
            case "movingLeft":
            case "movingRight":
                TWEEN.update();
                if (this.sideTweenComplete()) {
                    this.movementStatus = "falling";
                }
                break;
            case "rigid":
                break;
            case "unmovable":
                break;
            case "kill":
                this.runDeathTween();
                this.movementStatus = "dying";
                break;
            case "dying":
                TWEEN.update();
                if ((this.tweenInfo.deathRotateTweenComplete) &&
                    (this.tweenInfo.deathShrinkTweenComplete)) {
                    this.movementStatus = "dead";
                }
                break;
            case "dead":
                this.resetDeadItem();
                break;
        }
    }

    public static addMove(direction: string) {
        FallingItem.moveQueue.push(direction);
    }

    public static killRandom() {
        if (Math.random() > .01) {
            let max = FallingItem.FallingItemID;
            let min = 1;
            let randFallingItem = Math.floor(Math.random() * (max - min) + min);
            if ((FallingItem.FallingItems[randFallingItem]) &&
                ((FallingItem.FallingItems[randFallingItem].movementStatus === "stopped") ||
                    (FallingItem.FallingItems[randFallingItem].movementStatus === "checked"))) {
                FallingItem.FallingItems[randFallingItem].movementStatus = "kill";
            }
        }
    }

    public static getFallingItemByID(id: number) {
        return FallingItem.FallingItems[id];
    }

    public static getFallingItemByName(name: string) {
        for (let item in FallingItem.FallingItems) {
            if (FallingItem.FallingItems.hasOwnProperty(item)) {
                if (FallingItem.FallingItems[item].name === name) {
                    return FallingItem.FallingItems[item];
                }
            }
        }
        return null;
    }

    public static getNumFallingItemsMoving(): number {
        let numMoving: number = 0;
        for (let fallingItem in FallingItem.FallingItems) {
            if (FallingItem.FallingItems.hasOwnProperty(fallingItem)) {
                // all of these statuses means something is falling
                if (FallingItem.isMoving(FallingItem.FallingItems[fallingItem].movementStatus)) {
                    numMoving++;
                }
            }
        }
        return numMoving;
    }

    public static isMoving(movementStatus): boolean {
        if ((movementStatus === "falling")
            || (movementStatus === "movingLeft")
            || (movementStatus === "movingRight")
            || (movementStatus === "moveLeft")
            || (movementStatus === "moveRight")) {
            return true;
        }
        else {
            return false;
        }
    }

    private checkForCollision(): boolean {
        let raycaster = new THREE.Raycaster(
            this.mesh.position,
            new THREE.Vector3(0, -1, 0),
            0,
            this.dim.height / 2
        );
        let intersects = raycaster.intersectObjects(this.screen.scene.children);
        if (intersects.length > 0) {
            return true;
        }
        else {
            return false;
        }
    }



    private runDeathTween() {
        let fallingItem = this;

        let deathShrinkTween = new TWEEN.Tween(this.mesh.scale)
            .to({ x: .1, y: .1, z: .1 }, this.tweenInfo.deathTime * 500)
            .delay(0)
            .onStart(function() {
                fallingItem.tweenInfo.deathShrinkTweenComplete = false;
            }, fallingItem)
            .onUpdate(function() {
                // console.log(this.x + ", " + this.y + ", " + this.z);
            }, fallingItem)
            .onComplete(function() {
                fallingItem.tweenInfo.deathShrinkTweenComplete = true;
            }, fallingItem)
            .start();

        let deathRotateTween = new TWEEN.Tween(this.mesh.rotation)
            .to({ y: 2 * Math.PI }, this.tweenInfo.deathTime * 500)
            .delay(0)
            .onStart(function() {
                fallingItem.tweenInfo.deathRotateTweenComplete = false;
            }, fallingItem)
            .onUpdate(function() {
                // console.log(this.x + ", " + this.y + ", " + this.z);
            }, fallingItem)
            .onComplete(function() {
                fallingItem.tweenInfo.deathRotateTweenComplete = true;
            }, fallingItem)
            .start();
    }

    protected resetDeadItem() {
        this.killThreeItem(this.thisThreeItemID);
        this.screen.scene.remove(this.mesh);
        this.mesh.scale.x = 1;
        this.mesh.scale.y = this.dim.height * 40;
        this.mesh.scale.z = 1;
        this.mesh.position.x = 0;
        this.mesh.position.y = 0;
        // this.screen.scene.add(this.mesh);
        this.movementStatus = "waiting";
    }

    private sideTweenComplete() {
        return ((this.tweenInfo.vertTweenComplete)
            && (this.tweenInfo.horzTweenComplete)
            && (this.tweenInfo.rotTweenComplete));
    }

    private runSideMoveTween() {
        let fallingItem = this;

        let horzTween = new TWEEN.Tween(fallingItem.mesh.position)
            .to({ x: fallingItem.tweenInfo.newPos.x }
            , fallingItem.tweenInfo.movementTime * 1000)
            .easing(TWEEN.Easing.Cubic.InOut)
            .onStart(function() {
                fallingItem.tweenInfo.horzTweenComplete = false;
            }, fallingItem)
            .onUpdate(function() {
                // console.log("x : " + this.x);
            })
            .onComplete(function() {
                fallingItem.tweenInfo.horzTweenComplete = true;
            }, fallingItem)
            .start();

        let vertTween = new TWEEN.Tween(fallingItem.mesh.position)
            .to({ y: fallingItem.tweenInfo.newPos.y }
            , fallingItem.tweenInfo.movementTime * 500)
            .repeat(1)
            .delay(0)
            .yoyo(true)
            .easing(TWEEN.Easing.Cubic.InOut)
            .onStart(function() {
                fallingItem.tweenInfo.vertTweenComplete = false;
            }, fallingItem)
            .onUpdate(function() {
                // console.log("y : " + this.y);
            })
            .onComplete(function() {
                fallingItem.tweenInfo.vertTweenComplete = true;
            }, fallingItem)
            .start();
        let rotTween = new TWEEN.Tween(fallingItem.mesh.rotation)
            .to({ y: 2 * Math.PI }
            , fallingItem.tweenInfo.movementTime * 1000)
            .delay(0)
            .easing(TWEEN.Easing.Cubic.InOut)
            .onStart(function() {
                fallingItem.tweenInfo.rotTweenComplete = false;
            }, fallingItem)
            .onUpdate(function() {
                // console.log("y : " + this.y);
            })
            .onComplete(function() {
                fallingItem.tweenInfo.rotTweenComplete = true;
            }, fallingItem)
            .start();
    }
}

