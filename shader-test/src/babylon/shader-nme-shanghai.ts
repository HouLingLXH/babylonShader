import { AbstractMesh, Animation, Color4, Effect, Mesh, MeshBuilder, NodeMaterial, Scene, SceneLoader, StandardMaterial, Vector3, Vector4 } from "@babylonjs/core";
import { InputBlock } from "@babylonjs/core/Materials/Node/Blocks/Input/inputBlock";
import { Game } from "./game";

/**
 * 节点材质使用
 */
export class ShaderNME_ShangHai {

    private static instance: ShaderNME_ShangHai;

    scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    static Init(scene: Scene) {
        if (ShaderNME_ShangHai.instance == null) {
            ShaderNME_ShangHai.instance = new ShaderNME_ShangHai(scene);
            ShaderNME_ShangHai.instance.createTestMesh();

            scene.debugLayer.show();
        }
    }


    createTestMesh() {


        let go_ZhuTi = SceneLoader.ImportMesh("", "assets/mesh/shanghai/", "ZhuTi.gltf", undefined, (meshes) => {

            for (let i = 0; i < meshes.length; i++) {
                let l_mat = meshes[i].material;
                if (l_mat != null) {
                    this.testShader("shine", meshes[i], (mat: NodeMaterial) => {
                        // console.log(mat.getInputBlocks(), "blocks");
                        // let block = (mat.getInputBlockByPredicate((block: InputBlock) => {
                        //     return (block.name == "alpha")
                        // }));
                        // if (block != null) {
                        //     block.value = 0.7;
                        // }
                        // console.log("attachedBlocks", mat.attachedBlocks);
                        // (mat.attachedBlocks[7] as InputBlock).value = new Color4(1, 0, 0, 1);

                        // let anim = new Animation(
                        //     "alpha",
                        //     "attachedBlocks.8.value",
                        //     30,
                        //     Animation.ANIMATIONTYPE_FLOAT,
                        //     Animation.ANIMATIONLOOPMODE_CYCLE
                        // )

                        // let keys = [
                        //     { frame: 0, value: 0 },
                        //     { frame: 30, value: 1 },
                        //     { frame: 60, value: 0 },
                        // ];
                        // anim.setKeys(keys);

                        // mat.animations = [anim];

                        // this.scene.beginAnimation(mat, 0, 60, true);

                    });
                }
            }
        });

    }

    testShader(shaderPath: string, mesh?: AbstractMesh, onSuccess?: (mat: NodeMaterial) => void): NodeMaterial {
        let nodeMaterial = new NodeMaterial(shaderPath);

        let shaderUrl = "assets/shader/" + shaderPath + ".json";

        nodeMaterial.loadAsync(shaderUrl).then(() => {
            nodeMaterial.build(true);
            if (mesh != null) {
                mesh.material = nodeMaterial;
            }

            if (onSuccess != null) {
                onSuccess(nodeMaterial);
            }
        });

        return nodeMaterial;
    }




}