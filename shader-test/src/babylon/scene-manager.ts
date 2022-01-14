import { Scene } from "@babylonjs/core";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";

export class SceneManager {
    private static instance: SceneManager;

    scene: Scene;


    constructor(scene: Scene) {
        this.scene = scene;
    }

    public static init(scene: Scene) {
        if (SceneManager.instance == null) {
            SceneManager.instance = new SceneManager(scene);
            SceneManager.instance.initSceneEvent();
        }
    }



    public initSceneEvent() {
        document.onkeydown = SceneManager.onKeyDown;
    }


    static showDebug = true;
    //按键按下
    static onKeyDown(this: GlobalEventHandlers, ev: KeyboardEvent) {
        if (ev.key == 'd') {
            SceneManager.showDebug = !SceneManager.showDebug;
            if (SceneManager.showDebug) {
                SceneManager.instance.scene.debugLayer.show();
            } else {
                SceneManager.instance.scene.debugLayer.hide();
            }
        }
    }
}