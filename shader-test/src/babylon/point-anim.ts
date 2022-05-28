import { BezierCurveEase, Color4, EventState, ISceneLoaderAsyncResult, Matrix, Mesh, MeshBuilder, PointerEventTypes, PointerInfo, Quaternion, Scene, SceneLoader, StandardMaterial, Vector3, VertexBuffer } from "@babylonjs/core";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Game } from "./game";
import { TsTool } from "./tool/ts-tool";

export class PointAnim {
    private static s_instance: PointAnim;
    static get instance() {
        if (PointAnim.s_instance == null) {
            PointAnim.s_instance = new PointAnim();
        }
        return PointAnim.s_instance;
    }

    scene!: Scene;
    meshes_PKQ!: AbstractMesh;

    static init(scene: Scene) {
        PointAnim.instance.scene = scene;

        PointAnim.instance.onCreate();
    }

    //#region 声明周期
    onCreate() {
        let instance = this;

        Game.instance.ground.setEnabled(false);
        Game.instance.scene.clearColor = new Color4(0, 0, 0, 1);

        //"assets/mesh/pkq/", "pikaqiu.obj"

        SceneLoader.ImportMeshAsync("", "assets/mesh/pkq/", "pikaqiu.obj", this.scene).then((result: ISceneLoaderAsyncResult) => {
            Game.instance.camera.target = result.meshes[0].absolutePosition.clone();
            Game.instance.camera.radius = 40;
            Game.instance.camera.alpha = 1.58;
            Game.instance.camera.beta = 1.03;
            for (let i = 0; i < result.meshes.length; i++) {
                if (TsTool.stringContain(result.meshes[i].name, "Cube4")) {
                    instance.meshes_PKQ = result.meshes[i];
                }
            }
            instance.onGetMesh_PKQ();
        });
    }
    //#endregion

    // go_point!: Mesh;

    allPointMesh: PointMesh[] = [];

    onGetMesh_PKQ() {

        let instance = this;

        //所有顶点的局部坐标
        let vertexBuffer_pos = this.meshes_PKQ.getVerticesData(VertexBuffer.PositionKind);

        let material = new StandardMaterial("mat_pkq", this.scene);
        this.meshes_PKQ.material = material;
        this.meshes_PKQ.setEnabled(false);


        for (let i = 0; i < 10; i++) {
            let posRange = 20;
            let go_point = MeshBuilder.CreateSphere("go_point", { segments: 3, diameter: 0.05 });

            let startPos = this.meshes_PKQ.getAbsolutePosition().clone();
            startPos.x += Math.random() * posRange;
            startPos.y += Math.random() * posRange;
            startPos.z += Math.random() * posRange;

            let positionData = new PositionData(vertexBuffer_pos as Float32Array, startPos);

            let pointMesh = new PointMesh(go_point, positionData);
            this.allPointMesh.push(pointMesh);

            instance.updateRender(go_point, positionData);
        }

        instance.scene.onBeforeRenderObservable.add(() => {
            instance.pointsAnim(instance.allPointMesh);
        });
        instance.scene.onPointerObservable.add((eventData: PointerInfo, eventState: EventState) => {
            if (eventData.type == PointerEventTypes.POINTERPICK) {
                instance.playAnim(instance.allPointMesh);
            }
        });
    }


    /**
     * 更新渲染
     * @param go_point 
     * @param positionData 
     * @param progress 进度0-1， 0表示模型状态，1表示无序状态
     */
    updateRender(go_point: Mesh, positionData: PositionData, progress: number = 0) {

        let rootPos = new Vector3(0, 0, 0);

        go_point.thinInstanceSetBuffer("matrix", positionData.getWorldMatrix(rootPos, progress), 16, false);

    }


    //#region 动画部分

    c_animTimer = 1500;//总动画时间
    animTimer = 1500;//动画计时器

    isChaos = false;// 正在前往混乱态

    bezierLerp!: BezierCurveEase;//贝塞尔插值曲线
    /**
     * 开始动画
     */
    playAnim(pointMeshes: PointMesh[]) {
        this.animTimer = this.c_animTimer;
        this.isChaos = !this.isChaos;

        for (let i = 0; i < pointMeshes.length; i++) {
            pointMeshes[i].positionData.calculateTarget(this.isChaos);
        }

    }


    /**
     * 动画中计算每个点的位置
     */
    pointsAnim(points: PointMesh[]) {

        this.animTimer -= this.scene.deltaTime;

        if (this.animTimer <= 0) {
            this.animTimer = 0;
        }

        let progress = this.animTimer / this.c_animTimer;

        if (this.bezierLerp == null) {
            this.bezierLerp = new BezierCurveEase(.59, .01, .44, .99);// //.42, 0, .58, 1
        }

        progress = this.bezierLerp.ease(progress);

        if (this.isChaos) {
            progress = 1 - progress;
        }

        for (let i = 0; i < points.length; i++) {
            this.updateRender(points[i].sourceMesh, points[i].positionData, progress);
        }
    }

    //#endregion

}

/**
 * 由顶点组成的mesh
 */
export class PointMesh {
    /**
     * 源mesh
     */
    sourceMesh: Mesh;
    /**
     * 顶点信息
     */
    positionData: PositionData;

    constructor(sourceMesh: Mesh,
        positionData: PositionData) {
        this.sourceMesh = sourceMesh;
        this.positionData = positionData;
    }

}

/**
 * 顶点数据
 */
export class PositionData {

    readonly c_chaosSize: number = 50; //混乱时的范围

    count: number;
    rootPos: Vector3;
    meshpos: Float32Array; //模型状态时，每个节点的位置
    chaosPos: Float32Array;//混乱态位置
    delayTime: Float32Array;//延时启动时间
    worldPos: Vector3;
    constructor(pos: Float32Array, rootPos: Vector3) {
        this.meshpos = new Float32Array(pos);
        this.chaosPos = new Float32Array(pos);
        this.count = pos.length / 3;
        this.delayTime = new Float32Array(this.count);
        this.rootPos = rootPos;
        this.worldPos = rootPos;

        console.log("顶点数" + this.count);
    }

    /**
     * 获取世界矩阵
     * @param pos 根节点的世界坐标
     * @param progress 进度0-1， 0表示模型状态，1表示无序状态
     */
    getWorldMatrix(pos: Vector3, progress: number = 0) {
        var bufferMatrices = new Float32Array(16 * this.count);
        for (let i = 0; i < this.count; i++) {
            let matrix1 = Matrix.Translation(this.rootPos.x, this.rootPos.y, this.rootPos.z);
            let startPos = this.getVector3FromArray(this.meshpos, i);
            let endPos = this.getVector3FromArray(this.chaosPos, i);
            let l_progress = 0;
            let full = 1 - this.delayTime[i] * 2;
            if (progress > this.delayTime[i] * 2) {
                if (progress < 1 - this.delayTime[i]) {
                    l_progress = (progress - this.delayTime[i]) / full;
                }
                else {
                    l_progress = 1;
                }
            }
            let localPos = Vector3.Lerp(startPos, endPos, l_progress);
            matrix1 = matrix1.addTranslationFromFloats(localPos.x, localPos.y, localPos.z);
            matrix1 = matrix1.addTranslationFromFloats(pos.x, pos.y, pos.z);
            matrix1.copyToArray(bufferMatrices, i * 16);
        }
        return bufferMatrices;
    }

    /**
     * 计算目标
     * @param isChaos 是否是混乱态
     */
    calculateTarget(isChaos: boolean) {

        if (isChaos) {
            for (let i = 0; i < this.count; i++) {
                this.chaosPos[3 * i] = (Math.random() - 0.5) * this.c_chaosSize;
                this.chaosPos[3 * i + 1] = (Math.random() - 0.5) * this.c_chaosSize;
                this.chaosPos[3 * i + 2] = (Math.random() - 0.5) * this.c_chaosSize;
                this.delayTime[i] = Math.random() * 0.1;
            }
        }
    }

    /**
     * 从一个pos数组中，根据index获取vector3
     * @param array 
     * @param index 
     */
    getVector3FromArray(array: Float32Array, index: number) {
        let result = new Vector3(array[3 * index], array[3 * index + 1], array[3 * index + 2]);
        return result;
    }

}