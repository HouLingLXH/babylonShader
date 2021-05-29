import { AbstractMesh, MeshBuilder, NodeMaterial, Scene, SceneLoader } from "@babylonjs/core";

/**
 * 节点材质使用
 */
export class ShaderNPM {

    private static instance: ShaderNPM;

    scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    static Init(scene: Scene) {
        if (ShaderNPM.instance == null) {
            ShaderNPM.instance = new ShaderNPM(scene);
            ShaderNPM.instance.createTestMesh();
        }
    }


    createTestMesh() {
        let sphere = MeshBuilder.CreateSphere("sphere", { diameter: 3 }, this.scene);
        this.testShader("ice2", sphere)

        let box = MeshBuilder.CreateBox("box", { size: 2 }, this.scene);
        box.position.y = 2;
        this.testShader("ice2", box);


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