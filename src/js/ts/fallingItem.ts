/// <reference path="./defs/three/three.d.ts" />
/// <reference path="./defs/tween.js/tween.js.d.ts" />

import * as TWEEN from "tween.js";
import * as THREE from "three";
import ThreeItem = require ("./threeItem");

export class FallingItem extends ThreeItem.ThreeItem {
    static FallingItemID: number = 0;
    static FallingItems = {};
    static moveQueue = []; // a FIFO move queue that is executed by the currently falling block
    thisFallingItemID: number;
    movementStatus = "falling";
    type;
    fallingSpeed = .1;
    screen; // the game screen this object is in
    dim = {width: null, height: null, depth: null};
    tweenInfo = {
        movementTime : .25,    // seconds it takes for the side movement animation to complete
        pos : {x: null, y: null},
        newPos: {x: null, y: null},
        vertTween: null,
        horzTween: null,
        vertTweenComplete: false,
        horzTweenComplete: false,
        tweenUp: null,
        tweenDown: null,
        vertCount: 0
    };

    constructor(options?) {
        super();
        this.thisFallingItemID = FallingItem.FallingItemID;
        FallingItem.FallingItemID ++;

        this.name =  options && options.name;
        this.screen =  options && options.screen;
        this.movementStatus = options && options.movementStatus || "falling";

        // create the mesh
        this.dim.width = options && options.width || 1;
        this.dim.height = options && options.height || 1;
        this.dim.depth = options && options.depth || 1;

        this.geometry = new THREE.BoxGeometry(this.dim.width, this.dim.height, this.dim.depth);

        this.material = new THREE.MeshBasicMaterial( { color:  (options && options.color) ? options.color : new THREE.Color("rgb(255, 0, 0)")} );
        this.mesh = new THREE.Mesh(this.geometry, this.material );
        this.mesh.position.set(
            options && options.x || 0,
            options && options.y || 0,
            options && options.z || 0
        );
        // console.log("FallingItem " + this.thisThreeItemID + " created");

        // add this item to the array of physics items
        FallingItem.FallingItems[this.thisFallingItemID] = this;

        this.mesh.FallingItemID = this.thisFallingItemID;   // need to attach an ID to the THREE.js mesh so that we can call back to this class when dealing with the mesh. For example, raycaster returns the mesh, but we need to get back to the FallingItem
        // console.log ("FallingItem " + this.thisFallingItemID + " created");
    }

    update(dt, time) {

        // if this is the currently falling item check to see if it's been told to move


        // falling item behavior is based on movement status
        switch (this.movementStatus) {
            case "falling":
                this.mesh.position.y -= this.fallingSpeed;
                if (this.checkForCollision()) {
                    this.movementStatus = "stopped";

                    // empty the move queue so that the next block starts out with a new slate
                    FallingItem.moveQueue = [];
                }
                // check to see if we've been told to move left or right
                else if (FallingItem.moveQueue.length > 0) {
                    switch (FallingItem.moveQueue[0]) {
                        case "left":
                            this.movementStatus = "moveLeft";
                        break;
                        case "right":
                            this.movementStatus = "moveRight";
                        break;
                    }
                    FallingItem.moveQueue.shift();  // remove this directive from the queue
                }
            break;
            case "stopped":
            case "checked":
                if (!this.checkForCollision()) {
                    this.movementStatus = "falling";
                    console.log("***** " + this.thisCandyID + ": falling reset *********");
                }

                this.tweenInfo.vertTween = null;
                this.tweenInfo.horzTween = null;

            break;

            case "moveLeft":    // just received directive to move left
            case "moveRight":   // just received directive to move right
                // y movement direction never changes
                this.tweenInfo.newPos.y = this.mesh.position.y + this.dim.height * 3;

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
                if ((this.tweenInfo.newPos.x >= -5) && (this.tweenInfo.newPos.x <= 5)) {

                    // console.log("cur x: " + this.tweenInfo.pos.x + " | new x: " + this.tweenInfo.newPos.x);
                    // console.log("cur y: " + this.tweenInfo.pos.y + " | new y: " + this.tweenInfo.newPos.y);
                    // var that = this;
                    let tweenElement = {

                        item: this
                    };

                    let horzTween = new TWEEN.Tween(this.mesh.position)
                        .to({x: this.tweenInfo.newPos.x}
                            , this.tweenInfo.movementTime * 1000)
                        .easing( TWEEN.Easing.Cubic.InOut )
                        .onUpdate(function(){
                            console.log("x : " + this.x);
                        })
                        .onComplete(function(){
                            //this.item.horzTweenComplete();
                        })
                        .start();

                    // give the tween an identifier so that we can recognize when it is done
                    horzTween.userData = {
                        name : "horzTween",
                        itemId : this.thisFallingItemID
                    };

                    let vertTween = this.mesh.position = new TWEEN.Tween(this.mesh.position)
                        .to({y : this.tweenInfo.newPos.y}
                            , this.tweenInfo.movementTime * 500)
                        .repeat(1)
                        .delay( 0 )
                        .yoyo(true)
                        .easing( TWEEN.Easing.Cubic.InOut )
                        .onUpdate(function(){
                            console.log("y : " + this.y);
                        })
                        .onComplete(function(){
                            //this.item.vertTweenComplete();
                        })
                        .start();

                    // give the tween an identifier so that we can recognize when it is done
                    vertTween.userData = {
                        name : "vertTween",
                        itemId : this.thisFallingItemID
                    };
                }
                else {
                    // just go back to falling if the user
                    // tries to go past the left or right boundaries
                    this.movementStatus = "falling";
                }


            break;
            case "movingLeft":
            case "movingRight":

                TWEEN.update(time);
                console.log("tweens " + TWEEN.getAll().length);


                // console.log("updating tweens " + this.tweenInfo.pos.x
                 //   + ", " + this.tweenInfo.pos.y);
                if (TWEEN.getAll().length === 0) {
                     this.movementStatus = "falling";
                    console.log("tweens complete");
                    // debugger;
                }
                else {
                    console.log("here");
                }
            break;
            case "rigid":
            break;
            case "unmovable":
            break;
            case "kill":
                this.killFallingItem();
            break;
        }

        // check to see if the FallingItem is below the ground.
        // If it is then remove it from the scene
        // this was originally used before the ground stopped falling items
        let ground = ThreeItem.ThreeItem.getItemByName("ground");
        if (this.mesh.position.y < ground.mesh.position.y - 1) {
            this.movementStatus = "kill";
        }
        // check to see if the candy is below the ground.
        // If it is then make sure it is sitting on the ground
        if ((this.mesh.position.y < ground.mesh.position.y
                + this.dim.height / 2
                + ground.dim.height / 2) && (this.thisCandyID)) {
            this.mesh.position.y = ground.mesh.position.y
                + this.dim.height / 2
                + ground.dim.height / 2;
        }
    }

    public static addMove(direction: string) {
        FallingItem.moveQueue.push(direction);
    }

    public static killRandom() {
        if (Math.random() > .99) {
            let max = FallingItem.FallingItemID;
            let min = 1;
            let randFallingItem = Math.floor(Math.random() * (max  - min) + min );
            if ((FallingItem.FallingItems[randFallingItem]) && (FallingItem.FallingItems[randFallingItem].movementStatus === "stopped")) {
                FallingItem.FallingItems[randFallingItem].movementStatus = "kill";
            }
        }
    }

    public static getNumFallingItemsMoving(): number {
        let numMoving: number = 0;
        for (let fallingItem in FallingItem.FallingItems) {
            if (FallingItem.FallingItems.hasOwnProperty(fallingItem)) {
                // all of these statuses means something is falling
                if (FallingItem.isMoving(FallingItem.FallingItems[fallingItem].movementStatus)) {
                    numMoving ++;
                }
            }
        }
        return numMoving;
    }

    public static isMoving (movementStatus): boolean {
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

    private checkForCollision (): boolean {
        if (this.movementStatus === "checked"){
            // console.log(this);
        }
        let raycaster = new THREE.Raycaster(
            this.mesh.position,
            new THREE.Vector3(0, -1, 0),
            0,
            this.dim.height / 2
        );
        let intersects = raycaster.intersectObjects( this.screen.scene.children );
        if (intersects.length > 0) {
            return true;
        }
        else {
            return false;
        }
    }

    protected killFallingItem() {
        this.killThreeItem(this.thisThreeItemID);
        this.screen.scene.remove(this.mesh);
        this.movementStatus = "dead";
        delete FallingItem.FallingItems[this.thisFallingItemID];
    }
}

