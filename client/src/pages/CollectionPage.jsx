import React, { useRef } from "react";
import Spline from "@splinetool/react-spline";
import currents from "../assets/currents.png";

export default function CollectionPage() {
  function onLoad(spline) {
    // Utility: safely get a mesh's material
    function getMaterial(obj) {
      if (!obj) return null;
      if (obj.material) return obj.material;
      if (obj.children?.length) {
        const meshChild = obj.children.find((c) => c.material);
        return meshChild ? meshChild.material : null;
      }
      return null;
    }

    // 🌈 Background color
    const bgObj = spline.findObjectByName("BGRect"); // Change name
    const bgMat = getMaterial(bgObj);
    if (bgMat) {
      bgMat.color.set("#ff0000");
    } else {
      console.warn("Background material not found");
    }

    // 🖼 Image texture
    const imgObj = spline.findObjectByName("ImagePlane"); // Change name
    const imgMat = getMaterial(imgObj);
    if (imgMat) {
      const loader = new spline.THREE.TextureLoader();
      loader.load("/images/new-image.png", (texture) => {
        imgMat.map = texture;
        imgMat.needsUpdate = true;
      });
    } else {
      console.warn("Image material not found");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 h-full w-full bg-transparent">
      <Spline
        scene="https://prod.spline.design/rk-C7m1QaS3KqIim/scene.splinecode"
        onLoad={onLoad}
      />
    </div>
  );
}
