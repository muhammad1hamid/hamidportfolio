import * as THREE from "three";
import type { CorridorProject } from "./projects";

export class FrameTextures {
  private loader = new THREE.TextureLoader();
  private cache = new Map<string, THREE.Texture>();
  private pending = new Set<string>();
  private failed = new Set<string>();
  private disposed = false;
  private wanted = new Set<string>();

  constructor(private invalidate: () => void) {}

  update(
    projects: CorridorProject[],
    materials: THREE.MeshBasicMaterial[],
    distance: number,
    selected?: string,
  ) {
    this.wanted = new Set(
      projects
        .filter(
          (p) => Math.abs(p.distance - distance) < 15 || p.id === selected,
        )
        .map((p) => `${p.id}-960`),
    );
    projects.forEach((project, index) => {
      const small = `${project.id}-160`,
        large = `${project.id}-960`;
      this.request(small);
      if (this.wanted.has(large)) this.request(large);
      const texture =
        (this.wanted.has(large) && this.cache.get(large)) ||
        this.cache.get(small) ||
        null;
      if (materials[index].map !== texture) {
        materials[index].map = texture;
        materials[index].color.set(texture ? 0xffffff : 0x343739);
        materials[index].needsUpdate = true;
      }
    });
    for (const [key, texture] of this.cache) {
      if (key.endsWith("-960") && !this.wanted.has(key)) {
        texture.dispose();
        this.cache.delete(key);
      }
    }
  }

  private request(key: string) {
    if (
      this.disposed ||
      this.cache.has(key) ||
      this.pending.has(key) ||
      this.failed.has(key)
    )
      return;
    this.pending.add(key);
    this.loader.load(
      `/images/curve/${key}.webp`,
      (texture) => {
        this.pending.delete(key);
        if (this.disposed || (key.endsWith("-960") && !this.wanted.has(key))) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 2;
        this.cache.set(key, texture);
        this.invalidate();
      },
      undefined,
      () => {
        this.pending.delete(key);
        this.failed.add(key);
        this.invalidate();
      },
    );
  }

  stats() {
    let bytes = 0;
    for (const texture of this.cache.values()) {
      const image = texture.image as HTMLImageElement;
      bytes += (image.width * image.height * 4 * 4) / 3;
    }
    return {
      textures: this.cache.size,
      estimatedTextureBytes: Math.round(bytes),
      pending: this.pending.size,
      failed: this.failed.size,
    };
  }

  dispose() {
    this.disposed = true;
    this.cache.forEach((texture) => texture.dispose());
    this.cache.clear();
  }
}
