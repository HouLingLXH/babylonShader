import { Directive } from "@angular/core";
import { ArcRotateCamera, Color3, DirectionalLight, Engine, HemisphericLight, Mesh, MeshBuilder, PBRMaterial, PointLight, Scene, ShadowGenerator, StandardMaterial, Vector3 } from "@babylonjs/core";
import { PointAnim } from "./point-anim";
import { SceneManager } from "./scene-manager";
import { ShaderNME } from "./shader-nme";

export class Game {

    static instance: Game;

    public engine!: Engine;
    public canvas!: HTMLCanvasElement;
    public scene!: Scene;
    public camera!: ArcRotateCamera;
    public ground!: Mesh;

    public shadowGenerator!: ShadowGenerator;//阴影

    public initEngine(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.engine = new Engine(canvas);
        this.scene = new Scene(this.engine);
        Game.instance = this;
    }


    public initShadow(light: DirectionalLight) {
        if (this.shadowGenerator == null) {
            this.shadowGenerator = new ShadowGenerator(2048, light);
        }

        this.shadowGenerator.usePercentageCloserFiltering = true;
        this.shadowGenerator.filteringQuality = ShadowGenerator.QUALITY_MEDIUM;
        // this.shadowGenerator.blurKernel = 32;
        if (light != null) {
            //  light.autoCalcShadowZBounds = true; //投影矩阵距离自适应
        }
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
        this.camera = camera;

        //let light = new HemisphericLight("light1", new Vector3(1, 1, 0), this.scene);
        let light2 = new PointLight("light2", new Vector3(0, 1, -1), this.scene);
        let sun = new DirectionalLight("sun", new Vector3(0, -1, 0), this.scene);
        sun.position.y = 100;
        this.initShadow(sun);

        // let sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2 }, this.scene);

        let ground = MeshBuilder.CreateGround("ground", { width: 100, height: 100 });
        ground.position.y = -10;
        ground.receiveShadows = true;
        this.ground = ground;

        let mat_ground = new StandardMaterial("mat_ground", this.scene);
        ground.material = mat_ground;
        mat_ground.diffuseColor = new Color3(0.5, 0.5, 0.5);
        mat_ground.specularColor = Color3.Black();

        camera.target = Vector3.Zero();
        camera.radius = 10;
        camera.lowerRadiusLimit = 3;

        let scene = this.scene;

        // ShaderNME.Init(scene);
        PointAnim.init(scene);


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

    /**
     * 添加到阴影
     * @param mesh 
     */
    public addShadow(mesh: Mesh) {
        this.shadowGenerator.addShadowCaster(mesh)
    }




}
