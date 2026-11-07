# Relief Forge Litho

**Turn a picture into a lithophane you can 3D print.** A lithophane is a thin print that shows the picture when a light shines through it. Make a flat plate, a lampshade, a globe, a heart and more.

**[Open it](https://snazzygaz.github.io/Lithophane/)** · free · runs in your browser · your pictures are never uploaded

From the maker of [Relief Forge](https://snazzygaz.github.io/DepthNormal/).

---

## Two looks

- **Relit (AI normals):** the picture is rebuilt in 3D and lit by a light you set, so it looks carved, like lit marble. Needs the MoGe-2 normal model (one download), or a `.relief` project from Relief Forge. The model choices stay hidden until a picture is open.
- **Photo (classic):** the picture's own light and dark becomes thickness, like most lithophane makers. No download needed, so it is the quick way to see a lithophane.

## What it does

- **11 shapes:** flat, curved, lampshade, tapered, lantern, vase (vase, bell, barrel, hourglass, tulip, bowl profiles), bell, globe, dome, heart, ornament
- **Ready sizes:** 100 mm, 4 × 6 in, 5 × 7 in, 6 × 8 in, A6, A5, or your own
- **Place the picture:** move, zoom, fit, crop or stretch; repeat it around the shape, with mirror tiling for seamless sides
- **Light it:** set the light on the carving, contrast, brightness, mid-tones and shadow softness
- **Even out the bulb:** compensates for a bulb inside a lampshade, so the picture lights evenly
- **Fittings and stands:** floors, rings, hanging holes, and a matching base or stand as a separate print, with a light pocket, cable hole and feet
- **See it first:** 3D preview with a light behind it, plus backlit, baked-picture and thickness views
- **Bring your own normal map** from Blender, Substance or similar
- **Save STL** ready for your slicer

## Getting started

1. **Picture:** open a picture, try the sample picture (a still life included with the page), or open a `.relief` project from Relief Forge. Nothing you open is uploaded.
2. **Light:** set the light on the carving, or the photo's contrast (called **Tone** in Photo mode). This step opens the **Backlit** view, so you set the look while you watch it. Each new picture starts as a flat plate, so you can get the look and the heights right first. The last shape you used is not remembered.
3. **Shape:** then put it on a shape and set its size.
4. **Export:** add fittings or a base, then save the STL.

**Printing:** white PLA, 100% infill, 0.1–0.12 mm layers. View from the textured side with a light behind. For lamps, use an LED bulb, LED puck or LED tea light, never a flame.

## A window on your computer

You can run the same app in its own desktop window. Install [Node.js](https://nodejs.org) (a current LTS version), open a terminal in this folder, then run:

```sh
npm install
npm start
```

To make a portable Windows app (64-bit):

```sh
npm run build:win
```

The `.exe` is in `dist/`. There is nothing to install: open it to start. It is unsigned, so Windows may show a SmartScreen warning. Only run builds from a source you trust. On Linux, `npm run build:linux` makes an AppImage in the same folder. Building needs internet access to download Electron and the packaging tools.

The desktop window keeps your pictures on your computer. It still needs internet for its web libraries and fonts, and for the first AI model download; this is not a fully offline bundle. Its model cache and settings are separate from your browser's. Relit uses WebGPU where the graphics card and driver support it; Photo mode does not need an AI model. Save STL opens a normal Save As dialog so you can choose the folder and filename.

## Print checks

Before saving, the Export step checks the settings for geometry that can't print properly, and says why:

- **Won't save:** a textured inside thicker than the shape is wide (a narrow vase neck, a small globe), a curve tighter than the wall is thick, rims or frames that leave no room for the picture, or a floor and top ring taller than the shade.
- **Warnings:** a fitting hole made smaller so the floor or ring still reaches the wall (the size shown is the size that's saved), a floor thicker than its rim, and settings that were raised to their minimum.

Floors, rings and a base's feet are saved as separate closed pieces that overlap the wall, not one merged solid. Slicers usually join overlapping pieces when they slice; if yours shows them as separate objects, merge them before printing.

To run the geometry checks yourself (needs [Node.js](https://nodejs.org) 18 or newer, nothing to install):

```
node scripts/check-geometry.mjs
```

It runs the app's own code without a browser, builds every shape with a range of fittings, checks each mesh is closed with no bad numbers, and checks that impossible settings are caught.

## What you need

- A recent Chrome or Edge on a computer with a graphics card (WebGPU). Other browsers work, but making the AI normals is much slower.
- For the Relit look: one model download of about 140 MB to 1.3 GB, depending on the quality you pick. It's cached by your browser. If you already use Relief Forge, the model it downloaded is reused.

## Licence

**Relief Forge Litho** © 2026 Garyck Arntzen. Free to use. All rights reserved: no copying, modification or redistribution of the application without permission. Provided as is, without warranty. The lithophanes you make with it are yours.

### Third-party components

| Component | By | Licence |
|---|---|---|
| MoGe-2 normal models | Microsoft | MIT |
| DINOv2 (inside MoGe-2) | Meta AI | Apache 2.0 |
| ONNX Runtime Web | Microsoft | MIT |
| three.js | three.js authors | MIT |
| Manrope, IBM Plex Mono | Mikhail Sharanda; IBM | SIL Open Font Licence 1.1 |

The AI models are downloaded from Hugging Face on first use and are not part of this repository. Details in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md); the app licence is in [LICENSE](LICENSE).
