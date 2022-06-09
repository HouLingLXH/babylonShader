import { AbstractMesh, Animation, Color4, Effect, Mesh, MeshBuilder, NodeMaterial, Scene, SceneLoader, StandardMaterial, Vector3, Vector4 } from "@babylonjs/core";
import { InputBlock } from "@babylonjs/core/Materials/Node/Blocks/Input/inputBlock";
import { Game } from "./game";

/**
 * 节点材质使用
 */
export class ShaderNME {

    private static instance: ShaderNME;

    scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    static Init(scene: Scene) {
        if (ShaderNME.instance == null) {
            ShaderNME.instance = new ShaderNME(scene);
            ShaderNME.instance.createTestMesh();
            //ShaderNME.instance.testOcclusion();

            scene.debugLayer.show();
        }
    }


    createTestMesh() {
        let sphere = MeshBuilder.CreateSphere("sphere", { diameter: 3 }, this.scene);
        this.testShader("ice2", sphere)
        Game.instance.addShadow(sphere);

        let box = MeshBuilder.CreateBox("box", { size: 2 }, this.scene);
        box.position.y = 2;
        this.testShader("ice2", box);
        box.receiveShadows = true;



        let shadowBox = MeshBuilder.CreateBox("ShadowBox", { size: 2 }, this.scene);
        shadowBox.position = new Vector3(0.99, -4.07, 0);
        shadowBox.receiveShadows = true;
        Game.instance.addShadow(shadowBox);

        let go_Switch = SceneLoader.ImportMesh("", "assets/mesh/switch/", "scene.gltf", undefined, (meshes) => {

            for (let i = 0; i < meshes.length; i++) {
                let l_mat = meshes[i].material;
                if (l_mat != null) {
                    this.testShader("alphalearn", meshes[i], (mat: NodeMaterial) => {
                        console.log(mat.getInputBlocks(), "blocks");
                        let block = (mat.getInputBlockByPredicate((block: InputBlock) => {
                            return (block.name == "alpha")
                        }));
                        if (block != null) {
                            block.value = 0.7;
                        }
                        console.log("attachedBlocks", mat.attachedBlocks);
                        (mat.attachedBlocks[7] as InputBlock).value = new Color4(1, 0, 0, 1);

                        let anim = new Animation(
                            "alpha",
                            "attachedBlocks.8.value",
                            30,
                            Animation.ANIMATIONTYPE_FLOAT,
                            Animation.ANIMATIONLOOPMODE_CYCLE
                        )

                        let keys = [
                            { frame: 0, value: 0 },
                            { frame: 30, value: 1 },
                            { frame: 60, value: 0 },
                        ];
                        anim.setKeys(keys);

                        mat.animations = [anim];

                        this.scene.beginAnimation(mat, 0, 60, true);

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


    /**
     * 测试遮挡剔除
     */
    testOcclusion() {
        SceneLoader.ImportMesh("", "assets/mesh/guanxian/", "jd.glb", this.scene, function (newMeshes) {

            for (let i = 0; i < 1; i++) {
                //遮挡查询的规则，此规则更快，可能不准
                newMeshes[i].occlusionQueryAlgorithmType = AbstractMesh.OCCLUSION_ALGORITHM_TYPE_CONSERVATIVE;
                newMeshes[i].isOccluded = true;
                newMeshes[i].occlusionRetryCount = 5;//查询的最大次数，超过则停止查询
                newMeshes[i].occlusionType = AbstractMesh.OCCLUSION_TYPE_OPTIMISTIC;//在超出查询次数后，是不显示还是维持原状，的规则
            }

        });

    }

}