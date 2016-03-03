/// <reference path="./defs/three/three.d.ts" />
/// <reference path="./defs/lodash/lodash.d.ts" />

import * as _ from "lodash";
import * as THREE from "three";

export class AssetManager {

    static imgPath = "./../assets/graphics";
    static soundPath = "./../assets/sounds";
    static assets = {
        leftButton: {type: "texture", source: "./../assets/graphics/buttonLeft.png", tag: "buttonLeft"},
        downButton: {type: "texture", source: "./../assets/graphics/buttonDown.png", tag: "buttonDown"},
        rightButton: {type: "texture", source: "./../assets/graphics/buttonRight.png", tag: "buttonRightt"}
    };
    static numAssetsToLoad = 0;
    static numAssetsLoaded = 0;
    static image = {};
    static sounds = {};
    static onProgress;
    static onComplete;

    constructor() {

    }

    static loadAssets(onInit, onProgress, onComplete) {
        AssetManager.onProgress = onProgress;
        AssetManager.onComplete = onComplete;
        // send the total number of items that need to be loaded
        onInit(Object.keys(AssetManager.assets).length);

        _.forEach(AssetManager.assets, function(asset, key){
            switch (asset.type) {
                case "texture":
                    AssetManager.loadTexture (asset);
            }
            // console.log(value.source);
            // this.loadImage(value);
            // this.loadSounds(value);
            AssetManager.numAssetsToLoad ++;
        });
        // {
        //     if (AssetManager.assets.hasOwnProperty(asset)) {
        //         console.log(AssetManager.assets.source)
        //     }
        // }
        return {};
    }

    static loadImage(imageInfo) {
        // let img = new Image();
        // img.src = imageInfo.source;
        // img.onload = this.imageLoaded;
        // let queue = new createjs.LoadQueue();
        // queue.addEventListener("fileload", this.handleComplete);
        // queue.loadFile("./../assets/graphics/buttonDown.png");
        // queue.installPlugin(createjs.Sound);
        // queue.on("complete", this.handleComplete, this);
        // queue.loadManifest([
        //     {id: "buttonDown", src: "./../assets/graphics/buttonDown.png"}
        // ]);

    }

    static loadTexture(asset) {
        let loader = new THREE.TextureLoader();
        asset.texture = loader.load(
            asset.source,
            // Function when resource is loaded
            function(texture) {
                // do something with the texture

                asset.material = new THREE.MeshBasicMaterial({
                    map: texture
                });
                AssetManager.numAssetsLoaded ++;
                AssetManager.onProgress();

                if (AssetManager.numAssetsLoaded ===  AssetManager.numAssetsToLoad) {
                    AssetManager.onComplete();
                }
            }
        );

        // loader.load(
        //     asset.source,
        //     onload(function (texture) {    // load completed
        //         asset.material = new THREE.MeshBasicMaterial({
        //             map: texture
        //         });
        //     }),
        //     function (xhr) {    // load progress
        //         console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
        //     },
        //     function (xhr) {    // load error
        //         console.log( 'An error happened' );
        //     }
        // );

    }

    static getAssetByTag(tag: string) {
        return AssetManager.assets[tag];
    }

    loadSound(path) {

    }

    imageLoaded () {
        debugger;
    }

    handleComplete(a, b, c) {
        debugger;
    }
}