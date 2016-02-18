/// <reference path="./defs/three/three.d.ts" />
import * as THREE from "three";

export class ThreeItem{
    static threeItemID: number = 0;
    static threeItems = {};
    thisThreeItemID: number;
    name: string;
    geometry;
    material;
    mesh;

    constructor() {
        this.thisThreeItemID = ThreeItem.threeItemID;

        // store this physicsObject in an array for later
        ThreeItem.threeItems[this.thisThreeItemID] = this;
        // console.log("Object " + ThreeItem.threeItemID + " created.");
        ThreeItem.threeItemID ++;
    }

    // get items by id
    public static getItemByID(id: number){
        return ThreeItem.threeItems[id];
    }

    // get items by name
    public static getItemByName(name: string){
         for (var item in ThreeItem.threeItems){
            if (ThreeItem.threeItems.hasOwnProperty(item)){
                if (ThreeItem.threeItems[item].name === name){
                    return ThreeItem.threeItems[item];
                }
            }
        }
    }

    // call the update function on every three item we've made
    public static update(){
        for (var item in ThreeItem.threeItems){
            if (ThreeItem.threeItems.hasOwnProperty(item)){
                ThreeItem.threeItems[item].update(); 
            }
        }
    }
    protected killThreeItem(id){
        delete ThreeItem.threeItems[id];
    }
}


export class Box extends ThreeItem{
    static boxID: number = 0;
    static boxes = {};
    thisBoxID: number;
    movementStatus = "moving";
    type;
    fallingSpeed = .1;
    scene;
    dim = {width: null, height: null, depth: null};


    constructor(options?) {
        super();
        this.thisBoxID = Box.boxID;
        Box.boxID ++;

        this.name =  options && options.name;
        this.scene =  options && options.scene;
        this.movementStatus = options && options.movementStatus || "moving";

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
        // console.log("Box " + this.thisThreeItemID + " created");

        // add theis item to the array of physics items
        ThreeItem.threeItems[this.thisThreeItemID] = this;
        Box.boxes[this.thisBoxID] = this;
        this.mesh.boxID = this.thisBoxID;   // need to attach an ID to the THREE.js mesh so that we can call back to this class when dealing with the mesh. For example, raycaster returns the mesh, but we need to get back to the box
        // console.log ("box " + this.thisBoxID + " created");
    }

    update() {
        switch (this.movementStatus) {
            case "moving":
                this.mesh.position.y -= this.fallingSpeed;
                if (this.checkForCollision()) {
                    this.movementStatus = "stopped";
                }
            break;
            case "stopped":
                if (!this.checkForCollision()) {
                    this.movementStatus = "moving";
                }
            break;
            case "rigid":
            break;
            case "unmovable":
            break;
            case "kill":
                this.killBox();
            break;

        }

        // check to see if the box is below the ground.  If it is then remove it from the scene
        if (this.mesh.position.y < ThreeItem.getItemByName("ground").mesh.position.y - 1) {
            this.movementStatus = "kill";
        }
    }

    public static killRandom(){
        var iBoxStepper = 0;
        if (Math.random() > .99){
            var max = Box.boxID;
            var min = 1;
            var randBox = Math.floor(Math.random() * (max  -min) + min );
            if((Box.boxes[randBox]) && (Box.boxes[randBox].movementStatus === "stopped")) {
                Box.boxes[randBox].movementStatus = "kill";
            }
        }
    }

    public static getNumBoxesMoving(): number{
        var numMoving: number = 0;
        for (var box in Box.boxes){
            if (Box.boxes.hasOwnProperty(box)){
                if (Box.boxes[box].movementStatus === "moving"){
                    numMoving ++;
                }
            }
        }
        return numMoving;
    }

    private checkForCollision(){
        var raycaster = new THREE.Raycaster(
            this.mesh.position,
            new THREE.Vector3(0, -1, 0),
            0,
            this.dim.height/2
        );
        var intersects = raycaster.intersectObjects( this.scene.threeScene.children );
        if(intersects.length>0){
            return true;
        }        
    }

    protected killBox(){
        this.killThreeItem(this.thisThreeItemID);
        this.scene.threeScene.remove(this.mesh);
        this.movementStatus = "dead";
        delete Box.boxes[this.thisBoxID];
    }
}

