/// <reference path="./defs/three/three.d.ts" />
/// <reference path="./defs/lodash/lodash.d.ts" />

import * as _ from "lodash";
import * as THREE from "three";

export class AssetManager {

    static imgPath = "./../assets/graphics";
    static soundPath = "./../assets/sounds";
    static threeFontPath = "./../assets/threeTypefaces/";
    static assets = {
        leftButton: {type: "texture", source: "./../assets/graphics/buttonLeft.png", tag: "buttonLeft"},
        downButton: {type: "texture", source: "./../assets/graphics/buttonDown.png", tag: "buttonDown"},
        rightButton: {type: "texture", source: "./../assets/graphics/buttonRight.png", tag: "buttonRight"},
        gentilis_bold: {type: "threeFont", source: AssetManager.threeFontPath + "gentilis_bold" + ".typeface.js", font: null},
        gentilis_regular: {type: "threeFont", source: AssetManager.threeFontPath + "gentilis_regular" + ".typeface.js", font: null},
        helvetiker_bold: {type: "threeFont", source: AssetManager.threeFontPath + "helvetiker_bold" + ".typeface.js", font: null},
        helvetiker_regular: {type: "threeFont", source: AssetManager.threeFontPath + "helvetiker_regular" + ".typeface.js", font: null},
        optimer_bold: {type: "threeFont", source: AssetManager.threeFontPath + "optimer_bold" + ".typeface.js", font: null},
        optimer_regular: {type: "threeFont", source: AssetManager.threeFontPath + "optimer_regular" + ".typeface.js", font: null}
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
                    break;
                case "threeFont":
                    AssetManager.loadThreeFont(asset);
                    break;
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
                AssetManager.assetLoaded();
            }
        );
    }

    static loadThreeFont(asset) {
        let loader = new THREE.FontLoader();
        loader.load( asset.source, function ( response ) {
            asset.font = response;
            AssetManager.assetLoaded();
        });
    }

    static assetLoaded() {
        AssetManager.numAssetsLoaded ++;
                AssetManager.onProgress();

                if (AssetManager.numAssetsLoaded ===  AssetManager.numAssetsToLoad) {
                    AssetManager.onComplete();
                }
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