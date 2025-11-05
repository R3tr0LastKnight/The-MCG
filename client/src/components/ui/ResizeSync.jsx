import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

export default function ResizeSync() {
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    const parent = canvas.parentNode;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      gl.setSize(width, height);
      gl.setPixelRatio(window.devicePixelRatio);
    });

    observer.observe(parent);
    return () => observer.disconnect();
  }, [gl]);

  return null;
}
