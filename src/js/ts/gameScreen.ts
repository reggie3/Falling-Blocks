/// <reference path="./defs/three/three.d.ts" />
/// <reference path="./defs/jquery/jquery.d.ts" />

import * as THREE from "three";
import * as $ from "jquery";

// a game scene.  It will have the camera, lights, and scene graph
export class Screen {
    name: string;
    order: number;
    camera;
    lights = [];
    static sceneID: number = 0;
    static screens = [];
    static currentScreen;   // the currently displayed screen
    scene;
    overlay;
    displayStatus: string = "hidden";
    dirLight;
    ambLight;
    static width: number;
    static height: number;
    prevScreen;
    nextScreen;

    constructor(options?) {
        if (options.name ) {
            this.name = options.name;
        }if (options.order ) {
            this.order = options.order;
        }
        if (options.overlay ) {
            this.overlay = options.overlay;
        }
        if (options.prevScreen ) {
            this.prevScreen = options.prevScreen;
        }
        if (options.nextScreen ) {
            this.nextScreen = options.nextScreen;
        }

        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(
            -Screen.width / 2,
            Screen.width / 2,
            Screen.height / 2,
            -Screen.height / 2, 0.01, 25 );
        // this.camera = new THREE.PerspectiveCamera(
        //     130,
        //     options.width / options.height,
        //     1, 50 );


        // LIGHTS
        this.ambLight = new THREE.AmbientLight( 0x444444);
        this.ambLight.position.set( 0, 5, 5 );
        this.scene.add(this.ambLight );
        this.lights.push (this.ambLight);

        // //
        // this.dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
        // this.dirLight.color.setHSL( 1, 1, 1 );
        // this.dirLight.position.set( -0, 0, 0 );
        // this.dirLight.position.multiplyScalar( 50 );
        // this.scene.add(this.dirLight );

        // console.log("scene " + Scene.sceneID  + " created");
        if (options.order) {
            Screen.screens[this.order] = this;
        }

        if (options.overlay) {
            // $("#" + [this.overlay]).hide();
        }
         Screen.sceneID++;
    }

    public static init() {
        Screen.width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        Screen.height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

        if (Screen.width > Screen.height) {
            Screen.width = 9 * Screen.height / 16;
        }
    }

    public static getWidth() {
        return Screen.width;
    }

    public static getHeight() {
        return Screen.height;
    }

    public static getCurrentScreen() {
            return Screen.currentScreen;
    }

    public static setCurrentcreen(screen) {
        // if there is a current screen then hide it
        if (Screen.currentScreen) {
            Screen.currentScreen.hide();
        }
        Screen.currentScreen = screen;
        Screen.currentScreen.show();
    }

    /**************************************
     * show this screen
     */
    show() {
        if (this.overlay) {
            document.getElementById(this.overlay).style.visibility = "visible";
        }
         // $("#" + [this.overlay]).show();
         this.displayStatus = "shown";
         Screen.currentScreen = this;
    }

    /*****************************************
     * hide this screen
     */
    hide() {
        if (this.overlay) {
            // $("#" + [this.overlay]).hide();
            document.getElementById(this.overlay).style.visibility = "hidden";
        }
        this.displayStatus = "hidden";
    }

    /********************************************
     * add an item to this screen's scene
     */
    add(item) {
        this.scene.add(item.mesh);
    }

    positionCamera(x?: number, y?: number, z?: number) {
        if (x)
            this.camera.position.x = x;
        if (y)
            this.camera.position.y = y;
        if (z)
            this.camera.position.z = z;
    }
}

