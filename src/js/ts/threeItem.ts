/// <reference path="./defs/three/three.d.ts" />

import * as THREE from "three";

export class ThreeItem {
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
    public static getItemByName(name: string) {
         for (let item in ThreeItem.threeItems) {
            if (ThreeItem.threeItems.hasOwnProperty(item)){
                if (ThreeItem.threeItems[item].name === name){
                    return ThreeItem.threeItems[item];
                }
            }
        }
    }

    // call the update function on every three item we've made
    public static update(dt, time) {
        for (let item in ThreeItem.threeItems) {
            if (ThreeItem.threeItems.hasOwnProperty(item)) {
                ThreeItem.threeItems[item].update(dt);
            }
        }
    }
    protected killThreeItem(id) {
        delete ThreeItem.threeItems[id];
    }
}


