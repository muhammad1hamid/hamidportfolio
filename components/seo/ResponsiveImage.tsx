import type { ImgHTMLAttributes } from "react";

export function ResponsiveImage({
  src,
  alt,
  sizes,
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string }) {
  const portrait = src === "/images/hamid-hero.webp";
  const project =
    src.startsWith("/images/projects/") && !src.includes("-mobile");
  const filename = src.split("/").pop()!.replace(".webp", "");
  const srcSet = portrait
    ? `/images/responsive/${filename}-480.webp 480w, /images/responsive/${filename}-768.webp 768w, ${src} 1000w`
    : project
      ? `/images/responsive/${filename}-640.webp 640w, /images/responsive/${filename}-960.webp 960w, ${src} 1440w`
      : undefined;
  return (
    <img
      src={src}
      alt={alt}
      srcSet={srcSet}
      sizes={sizes}
      decoding="async"
      loading="lazy"
      {...props}
    />
  );
}
