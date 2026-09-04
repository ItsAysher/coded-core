// Modular Core image composition and revision-aware preview caching.

const CORE_RENDER_CACHE_LIMIT = 8

let coreRenderCacheOwners: CoreLoadout[] = []
let coreRenderCacheRevisions: number[] = []
let coreRenderCacheImages: Image[] = []

/** Draws one immutable authored part and its recolored paint masks. */
function drawRenderedCorePart(
    target: Image,
    part: CorePartDefinition,
    slot: CorePartSlot,
    loadout: CoreLoadout,
    x: number,
    y: number
): void {
    let art = part.art
    target.drawTransparentImage(art.base, x, y)

    let primary = art.primary.clone()
    primary.replace(
        CORE_PRIMARY_SOURCE,
        loadout.color(slot, CorePaintChannel.Primary)
    )
    target.drawTransparentImage(primary, x, y)

    let secondary = art.secondary.clone()
    secondary.replace(
        CORE_SECONDARY_SOURCE,
        loadout.color(slot, CorePaintChannel.Secondary)
    )
    target.drawTransparentImage(secondary, x, y)

    let accent = art.accent.clone()
    accent.replace(
        CORE_ACCENT_SOURCE,
        loadout.color(slot, CorePaintChannel.Accent)
    )
    target.drawTransparentImage(accent, x, y)
}

/**
 * Composites a loadout on the fixed Core canvas.
 *
 * The leg attachment point is horizontally centered and its authored foot is
 * placed on CORE_FOOT_BASELINE. Every other part is positioned by matching
 * its attachment anchor to the corresponding socket on the selected body.
 */
function renderCoreImage(loadout: CoreLoadout): Image {
    let rendered = image.create(CORE_CANVAS_WIDTH, CORE_CANVAS_HEIGHT)

    let head = corePart(CorePartSlot.Head, loadout.headId)
    let body = corePart(CorePartSlot.Body, loadout.bodyId)
    let arms = corePart(CorePartSlot.Arms, loadout.armsId)
    let legs = corePart(CorePartSlot.Legs, loadout.legsId)

    let legsX = Math.idiv(CORE_CANVAS_WIDTH, 2) - legs.art.attachX
    let legsY = CORE_FOOT_BASELINE - legs.art.footY

    let hipX = legsX + legs.art.attachX
    let hipY = legsY + legs.art.attachY
    let bodyX = hipX - body.art.hipX
    let bodyY = hipY - body.art.hipY

    let armsX = bodyX + body.art.shoulderX - arms.art.attachX
    let armsY = bodyY + body.art.shoulderY - arms.art.attachY
    let headX = bodyX + body.art.neckX - head.art.attachX
    let headY = bodyY + body.art.neckY - head.art.attachY

    // Arms sit behind the torso while the head remains above it.
    drawRenderedCorePart(
        rendered,
        legs,
        CorePartSlot.Legs,
        loadout,
        legsX,
        legsY
    )
    drawRenderedCorePart(
        rendered,
        arms,
        CorePartSlot.Arms,
        loadout,
        armsX,
        armsY
    )
    drawRenderedCorePart(
        rendered,
        body,
        CorePartSlot.Body,
        loadout,
        bodyX,
        bodyY
    )
    drawRenderedCorePart(
        rendered,
        head,
        CorePartSlot.Head,
        loadout,
        headX,
        headY
    )

    return rendered
}

/** Returns a composed image cached by loadout identity and revision. */
function cachedCoreImage(loadout: CoreLoadout): Image {
    for (let index = 0; index < coreRenderCacheOwners.length; index++) {
        if (coreRenderCacheOwners[index] == loadout &&
            coreRenderCacheRevisions[index] == loadout.revision) {
            return coreRenderCacheImages[index]
        }
    }

    let rendered = renderCoreImage(loadout)

    // Keep only the newest revision for a particular loadout object.
    for (let index = 0; index < coreRenderCacheOwners.length; index++) {
        if (coreRenderCacheOwners[index] == loadout) {
            coreRenderCacheRevisions[index] = loadout.revision
            coreRenderCacheImages[index] = rendered
            return rendered
        }
    }

    if (coreRenderCacheOwners.length >= CORE_RENDER_CACHE_LIMIT) {
        coreRenderCacheOwners.shift()
        coreRenderCacheRevisions.shift()
        coreRenderCacheImages.shift()
    }
    coreRenderCacheOwners.push(loadout)
    coreRenderCacheRevisions.push(loadout.revision)
    coreRenderCacheImages.push(rendered)
    return rendered
}

/** Invalidates every cached composite. */
function clearCoreRenderCache(): void {
    coreRenderCacheOwners = []
    coreRenderCacheRevisions = []
    coreRenderCacheImages = []
}

/** Returns the occupied pixel height of a composed Core. */
function coreVisibleHeight(loadout: CoreLoadout): number {
    let rendered = cachedCoreImage(loadout)
    let top = rendered.height
    let bottom = -1

    for (let y = 0; y < rendered.height; y++) {
        for (let x = 0; x < rendered.width; x++) {
            if (rendered.getPixel(x, y) != 0) {
                top = Math.min(top, y)
                bottom = Math.max(bottom, y)
            }
        }
    }

    if (bottom < top) {
        return 0
    }
    return bottom - top + 1
}

/** Draws a cached Core centered on centerX with its foot baseline at footY. */
function drawCoreAtFoot(
    target: Image,
    loadout: CoreLoadout,
    centerX: number,
    footY: number
): void {
    target.drawTransparentImage(
        cachedCoreImage(loadout),
        centerX - Math.idiv(CORE_CANVAS_WIDTH, 2),
        footY - CORE_FOOT_BASELINE
    )
}
