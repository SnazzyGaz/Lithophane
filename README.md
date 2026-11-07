# Relief Forge Litho

**Turn a picture into a lithophane you can 3D print.** A lithophane is a thin print that shows the picture when a light shines through it. Make a flat plate, a lampshade, a globe, a heart and more.

**[Open it](https://snazzygaz.github.io/Lithophane/)** · free · runs in your browser · your pictures are never uploaded

From the maker of [Relief Forge](https://snazzygaz.github.io/DepthNormal/).

---

## Two looks

- **Relit (AI normals):** the picture is rebuilt in 3D and lit by a light you set, so it looks carved, like lit marble. Needs the MoGe-2 normal model (one download), or a `.relief` project from Relief Forge.
- **Photo (classic):** the picture's own light and dark becomes thickness, like most lithophane makers. No download needed.

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

1. **Picture:** open a picture, or a `.relief` project from Relief Forge.
2. **Shape:** pick a shape and its size.
3. **Light:** set the light on the carving, or the photo's contrast.
4. **Export:** add fittings or a base, then save the STL.

**Printing:** white PLA, 100% infill, 0.1–0.12 mm layers. View from the textured side with a light behind.

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
