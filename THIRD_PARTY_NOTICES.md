# Third-party notices

Relief Forge Litho loads the components below at run time. None of them is stored in this repository.

## Loaded from a CDN (cdn.jsdelivr.net)

| Component | Version | By | Licence | Source |
|---|---|---|---|---|
| ONNX Runtime Web | 1.30.0 | Microsoft | MIT | https://github.com/microsoft/onnxruntime |
| three.js | 0.160.0 | three.js authors | MIT | https://github.com/mrdoob/three.js |

## AI models (downloaded from Hugging Face on first use, cached in the browser)

| Model | By | Licence | Source |
|---|---|---|---|
| MoGe-2 normal models (ViT-L, ViT-B, ViT-S), ONNX | Microsoft (Ruicheng Wang et al.) | MIT | https://github.com/microsoft/MoGe |
| DINOv2 backbone (inside MoGe-2) | Meta AI | Apache 2.0 | https://github.com/facebookresearch/dinov2 |

The model files are pinned to fixed revisions in `index.html` (`NORMAL_MODELS`).

## Fonts (Google Fonts)

| Font | By | Licence |
|---|---|---|
| Manrope | Mikhail Sharanda | SIL Open Font Licence 1.1 |
| IBM Plex Mono | IBM | SIL Open Font Licence 1.1 |

Full licence texts are at the source links above.
