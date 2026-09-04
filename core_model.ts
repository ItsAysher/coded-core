// Modular Core definitions, loadouts, paint schemes, stats, and persistence.

enum CorePartSlot {
    Head,
    Body,
    Arms,
    Legs
}

enum FrameWeightClass {
    Light,
    Medium,
    Heavy
}

enum CorePaintChannel {
    Primary,
    Secondary,
    Accent
}

// Source colors used by every authored paint mask. The immutable base artwork
// never uses these as replaceable regions; only the three masks are recolored.
const CORE_PRIMARY_SOURCE = 8
const CORE_SECONDARY_SOURCE = 6
const CORE_ACCENT_SOURCE = 5
const CORE_CANVAS_WIDTH = 52
const CORE_CANVAS_HEIGHT = 60
const CORE_FOOT_BASELINE = 58

function validCoreColor(color: number) {
    return !isNaN(color) && color >= 1 && color <= 15 &&
        color == Math.floor(color)
}

class CorePartArt {
    base: Image
    primary: Image
    secondary: Image
    accent: Image

    // A non-body part attaches this local point to its matching body socket.
    attachX: number
    attachY: number
    footY: number

    // Body-only sockets. Keeping them in the common art record makes every
    // category data-driven and avoids assumptions about matching dimensions.
    neckX: number
    neckY: number
    shoulderX: number
    shoulderY: number
    hipX: number
    hipY: number

    constructor(
        base: Image,
        primary: Image,
        secondary: Image,
        accent: Image
    ) {
        this.base = base
        this.primary = primary
        this.secondary = secondary
        this.accent = accent
        this.attachX = 0
        this.attachY = 0
        this.footY = base.height - 1
        this.neckX = 0
        this.neckY = 0
        this.shoulderX = 0
        this.shoulderY = 0
        this.hipX = 0
        this.hipY = 0
    }
}

class CorePartDefinition {
    id: number
    slot: CorePartSlot
    weightClass: FrameWeightClass
    name: string
    description: string
    weight: number
    armor: number
    mobility: number
    energy: number
    art: CorePartArt

    constructor(
        id: number,
        slot: CorePartSlot,
        weightClass: FrameWeightClass,
        name: string,
        description: string,
        weight: number,
        armor: number,
        mobility: number,
        energy: number,
        art: CorePartArt
    ) {
        this.id = id
        this.slot = slot
        this.weightClass = weightClass
        this.name = name
        this.description = description
        this.weight = weight
        this.armor = armor
        this.mobility = mobility
        this.energy = energy
        this.art = art
    }
}

class CoreLoadout {
    headId: number
    bodyId: number
    armsId: number
    legsId: number
    primaryColors: number[]
    secondaryColors: number[]
    accentColors: number[]
    revision: number

    constructor(headId: number, bodyId: number, armsId: number, legsId: number) {
        this.headId = headId
        this.bodyId = bodyId
        this.armsId = armsId
        this.legsId = legsId
        this.primaryColors = [8, 8, 8, 8]
        this.secondaryColors = [6, 6, 6, 6]
        this.accentColors = [5, 5, 5, 5]
        this.revision = 0
    }

    partId(slot: CorePartSlot) {
        if (slot == CorePartSlot.Head) {
            return this.headId
        } else if (slot == CorePartSlot.Body) {
            return this.bodyId
        } else if (slot == CorePartSlot.Arms) {
            return this.armsId
        }
        return this.legsId
    }

    setPart(slot: CorePartSlot, id: number) {
        if (slot < CorePartSlot.Head || slot > CorePartSlot.Legs ||
            isNaN(id) || id < 0 || id != Math.floor(id) ||
            id >= corePartCatalog(slot).length || this.partId(slot) == id) {
            return
        }
        if (slot == CorePartSlot.Head) {
            this.headId = id
        } else if (slot == CorePartSlot.Body) {
            this.bodyId = id
        } else if (slot == CorePartSlot.Arms) {
            this.armsId = id
        } else {
            this.legsId = id
        }
        this.revision += 1
    }

    color(slot: CorePartSlot, channel: CorePaintChannel) {
        if (channel == CorePaintChannel.Primary) {
            return this.primaryColors[slot]
        } else if (channel == CorePaintChannel.Secondary) {
            return this.secondaryColors[slot]
        }
        return this.accentColors[slot]
    }

    setColor(slot: CorePartSlot, channel: CorePaintChannel, color: number) {
        if (slot < CorePartSlot.Head || slot > CorePartSlot.Legs ||
            channel < CorePaintChannel.Primary ||
            channel > CorePaintChannel.Accent ||
            !validCoreColor(color) || this.color(slot, channel) == color) {
            return
        }
        if (channel == CorePaintChannel.Primary) {
            this.primaryColors[slot] = color
        } else if (channel == CorePaintChannel.Secondary) {
            this.secondaryColors[slot] = color
        } else {
            this.accentColors[slot] = color
        }
        this.revision += 1
    }
}

class CoreStats {
    weight: number
    armor: number
    mobility: number
    energy: number

    constructor() {
        this.weight = 0
        this.armor = 0
        this.mobility = 0
        this.energy = 0
    }
}

let headParts: CorePartDefinition[] = []
let bodyParts: CorePartDefinition[] = []
let armParts: CorePartDefinition[] = []
let legParts: CorePartDefinition[] = []

let coreColorNames = [
    "White", "Red", "Pink", "Orange", "Yellow",
    "Teal", "Green", "Blue", "Sky", "Purple",
    "Lilac", "Violet", "Tan", "Brown", "Black"
]

function corePartCatalog(slot: CorePartSlot) {
    if (slot == CorePartSlot.Head) {
        return headParts
    } else if (slot == CorePartSlot.Body) {
        return bodyParts
    } else if (slot == CorePartSlot.Arms) {
        return armParts
    }
    return legParts
}

function corePart(slot: CorePartSlot, id: number) {
    let catalog = corePartCatalog(slot)
    if (isNaN(id) || id < 0 || id >= catalog.length || id != Math.floor(id)) {
        return catalog[0]
    }
    return catalog[id]
}

function coreSlotName(slot: CorePartSlot) {
    if (slot == CorePartSlot.Head) {
        return "Head"
    } else if (slot == CorePartSlot.Body) {
        return "Body"
    } else if (slot == CorePartSlot.Arms) {
        return "Arms"
    }
    return "Legs"
}

function coreWeightClassName(weightClass: FrameWeightClass) {
    if (weightClass == FrameWeightClass.Light) {
        return "LIGHT"
    } else if (weightClass == FrameWeightClass.Medium) {
        return "MEDIUM"
    }
    return "HEAVY"
}

function corePaintChannelName(channel: CorePaintChannel) {
    if (channel == CorePaintChannel.Primary) {
        return "Primary"
    } else if (channel == CorePaintChannel.Secondary) {
        return "Secondary"
    }
    return "Accent"
}

function coreColorName(color: number) {
    if (color >= 1 && color <= coreColorNames.length) {
        return coreColorNames[color - 1]
    }
    return "Unknown"
}

function cloneCoreLoadout(source: CoreLoadout) {
    let copy = new CoreLoadout(
        source.headId,
        source.bodyId,
        source.armsId,
        source.legsId
    )
    for (let slot = 0; slot < 4; slot++) {
        copy.primaryColors[slot] = source.primaryColors[slot]
        copy.secondaryColors[slot] = source.secondaryColors[slot]
        copy.accentColors[slot] = source.accentColors[slot]
    }
    copy.revision = source.revision
    return copy
}

function setCorePalette(
    loadout: CoreLoadout,
    primary: number,
    secondary: number,
    accent: number
) {
    if (!validCoreColor(primary) || !validCoreColor(secondary) ||
        !validCoreColor(accent)) {
        return
    }
    for (let slot = 0; slot < 4; slot++) {
        loadout.primaryColors[slot] = primary
        loadout.secondaryColors[slot] = secondary
        loadout.accentColors[slot] = accent
    }
    loadout.revision += 1
}

function calculateCoreStats(loadout: CoreLoadout) {
    let result = new CoreStats()
    for (let slot = 0; slot < 4; slot++) {
        let part = corePart(slot, loadout.partId(slot))
        result.weight += part.weight
        result.armor += part.armor
        result.mobility += part.mobility
        result.energy += part.energy
    }
    result.mobility = Math.idiv(result.mobility, 4)
    return result
}

function matchingCoreLoadout(partIndex: number) {
    return new CoreLoadout(partIndex, partIndex, partIndex, partIndex)
}

const CORE_SAVE_KEY = "coded-core-garage-v1"

function saveCoreLoadout(loadout: CoreLoadout) {
    let values = [
        1,
        loadout.headId,
        loadout.bodyId,
        loadout.armsId,
        loadout.legsId
    ]
    for (let slot = 0; slot < 4; slot++) {
        values.push(loadout.primaryColors[slot])
        values.push(loadout.secondaryColors[slot])
        values.push(loadout.accentColors[slot])
    }
    settings.writeNumberArray(CORE_SAVE_KEY, values)
}

function loadCoreLoadout() {
    let values = settings.readNumberArray(CORE_SAVE_KEY)
    if (!values || values.length < 17 || values[0] != 1) {
        return null
    }

    for (let index = 1; index < 17; index++) {
        if (isNaN(values[index]) || values[index] != Math.floor(values[index])) {
            return null
        }
    }

    let loaded = new CoreLoadout(
        Math.max(0, Math.min(2, values[1])),
        Math.max(0, Math.min(2, values[2])),
        Math.max(0, Math.min(2, values[3])),
        Math.max(0, Math.min(2, values[4]))
    )
    let valueIndex = 5
    for (let slot = 0; slot < 4; slot++) {
        loaded.primaryColors[slot] = Math.max(1, Math.min(15, values[valueIndex]))
        loaded.secondaryColors[slot] = Math.max(1, Math.min(15, values[valueIndex + 1]))
        loaded.accentColors[slot] = Math.max(1, Math.min(15, values[valueIndex + 2]))
        valueIndex += 3
    }
    return loaded
}
