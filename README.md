# Coded Core

The current prototype opens on a three-frame showcase and includes a complete
garage for assembling and painting a modular biped Core.

## Garage controls

- **Up / Down:** move through the current menu
- **A:** open, preview, equip, or apply the highlighted option
- **B:** return to the previous menu
- **Menu:** return to the Light / Medium / Heavy frame gallery

## Modular frame prototype

- Three original frame families: Kestrel Light, Vanguard Medium, and Bastion Heavy
- Independently interchangeable Head, Body, Arms, and Legs
- Variable part dimensions joined by neck, shoulder, and hip sockets
- A shared foot baseline keeps mixed-height builds visually grounded
- An immutable metal/detail base plus Primary, Secondary, and Accent paint masks on every part
- Per-part colors, live candidate previews, immediate stat comparisons, and persistent saves
- Four content choices per page; larger catalogs add More, Previous, and Back controls

Source responsibilities are split between `core_model.ts`, `core_assets.ts`,
`core_renderer.ts`, and `garage_ui.ts`. `test.ts` contains the exhaustive
development assertions used to validate all 81 cross-family assemblies; it is
kept out of the production file list so those checks do not delay normal startup.

> Open this page at [https://itsaysher.github.io/coded-core/](https://itsaysher.github.io/coded-core/)

## Use as Extension

This repository can be added as an **extension** in MakeCode.

* open [https://arcade.makecode.com/](https://arcade.makecode.com/)
* click on **New Project**
* click on **Extensions** under the gearwheel menu
* search for **https://github.com/itsaysher/coded-core** and import

## Edit this project

To edit this repository in MakeCode.

* open [https://arcade.makecode.com/](https://arcade.makecode.com/)
* click on **Import** then click on **Import URL**
* paste **https://github.com/itsaysher/coded-core** and click import

#### Metadata (used for search, rendering)

* for PXT/arcade
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>
