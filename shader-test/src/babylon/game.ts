import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, PBRMaterial, PointLight, Scene, StandardMaterial, Vector3 } from "@babylonjs/core";
import { SceneManager } from "./scene-manager";
import { ShaderNPM } from "./shader-npm";

export class Game {

    static instance: Game;

    public engine!: Engine;
    public canvas!: HTMLCanvasElement;
    public scene!: Scene;



    public initEngine(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.engine = new Engine(canvas);
        this.scene = new Scene(this.engine);
        Game.instance = this;
    }

    public createScene() {
        let camera = new ArcRotateCamera(
            "Camera",
            Math.PI / 2,
            Math.PI / 2,
            2,
            new Vector3(0, 0, 5),
            this.scene
        );
        camera.attachControl(this.canvas, true);

        let light = new HemisphericLight("light1", new Vector3(1, 1, 0), this.scene);
        let light2 = new PointLight("light2", new Vector3(0, 1, -1), this.scene);

        // let sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2 }, this.scene);

        let ground = MeshBuilder.CreateGround("ground", { width: 100, height: 100 });
        ground.position.y = -10;

        let mat_ground = new StandardMaterial("mat_ground", this.scene);
        ground.material = mat_ground;
        mat_ground.diffuseColor = new Color3(0.5, 0.5, 0.5);
        mat_ground.specularColor = Color3.Black();

        camera.target = Vector3.Zero();
        camera.radius = 10;
        camera.lowerRadiusLimit = 3;

        let scene = this.scene;

        ShaderNPM.Init(scene);

        //最后，将场景渲染出来
        this.engine.runRenderLoop(function () {
            scene.render();
        })

        // 监听浏览器改变大小的事件，通过调用engine.resize()来自适应窗口大小
        window.addEventListener("resize", function () {
            Game.instance.engine.resize();
        });


        SceneManager.init(scene);

    }





}
