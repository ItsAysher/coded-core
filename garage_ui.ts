// Garage screen, four-choice pagination, live Core preview, and controls.

enum GaragePage {
    Gallery,
    Main,
    PartSlots,
    PartChoices,
    PaintSlots,
    PaintChannels,
    PaintChoices,
    Stats,
    Help
}

class GarageMenuOption {
    label: string
    value: number
    action: number

    constructor(label: string, value: number = 0, action: number = 0) {
        this.label = label
        this.value = value
        this.action = action
    }
}

let garagePage = GaragePage.Gallery
let garageSelection = 0
let garageMenuPage = 0
let garageOptions: GarageMenuOption[] = []
let garageLoadout: CoreLoadout = null
let garageEditSlot = CorePartSlot.Head
let garagePaintChannel = CorePaintChannel.Primary
let garageCandidatePart = -1
let garageCandidateColor = -1
let garagePreviewLoadout: CoreLoadout = null
let garageEquippedStats: CoreStats = null
let garagePreviewStats: CoreStats = null
let galleryLoadouts: CoreLoadout[] = []
let garageMessage = ""
let garageMessageUntil = 0
let galleryTurn = 0
let galleryNames = ["LIGHT", "MED", "HEAVY"]
let galleryXPositions = [18, 50, 82]
let galleryPalettePrimary = [9, 8, 2]
let galleryPaletteSecondary = [1, 6, 14]
let galleryPaletteAccent = [5, 4, 5]
let garageFrameImage = image.create(160, 120)

const GARAGE_ACTION_SELECT = 0
const GARAGE_ACTION_MORE = 1
const GARAGE_ACTION_PREVIOUS = 2
const GARAGE_ACTION_BACK = 3
const GARAGE_CONTENT_PAGE_SIZE = 4

function option(label: string, value: number = 0) {
    return new GarageMenuOption(label, value, GARAGE_ACTION_SELECT)
}

/**
 * Shows no more than four content choices at once, then adds explicit paging
 * and Back controls. Unlike Racing's story list, this compact renderer safely
 * fits the navigation rows without drawing them off-screen.
 */
function paginatedGarageOptions(source: GarageMenuOption[], page: number) {
    let result: GarageMenuOption[] = []
    let firstIndex = page * GARAGE_CONTENT_PAGE_SIZE
    let contentCount = GARAGE_CONTENT_PAGE_SIZE
    let hasPrevious = page > 0
    let hasMore = firstIndex + contentCount < source.length

    for (let index = firstIndex;
        index < source.length && index < firstIndex + contentCount;
        index++) {
        result.push(source[index])
    }
    if (hasPrevious) {
        result.push(new GarageMenuOption("Previous", 0, GARAGE_ACTION_PREVIOUS))
    }
    if (hasMore) {
        result.push(new GarageMenuOption("More", 0, GARAGE_ACTION_MORE))
    }
    result.push(new GarageMenuOption("Back", 0, GARAGE_ACTION_BACK))
    return result
}

function setGaragePage(page: GaragePage) {
    garagePage = page
    garageSelection = 0
    garageMenuPage = 0
    garageCandidatePart = -1
    garageCandidateColor = -1
    refreshGarageOptions()
}

function refreshGarageOptions() {
    garageOptions = []
    if (garagePage == GaragePage.Gallery) {
        garageOptions = [
            option("Garage", 0),
            option("Help", 1)
        ]
    } else if (garagePage == GaragePage.Main) {
        garageOptions = [
            option("Parts", 0),
            option("Paint", 1),
            option("Stats", 2),
            option("Gallery", 3)
        ]
    } else if (garagePage == GaragePage.PartSlots ||
        garagePage == GaragePage.PaintSlots) {
        let source = [
            option("Head", CorePartSlot.Head),
            option("Body", CorePartSlot.Body),
            option("Arms", CorePartSlot.Arms),
            option("Legs", CorePartSlot.Legs)
        ]
        garageOptions = paginatedGarageOptions(source, garageMenuPage)
    } else if (garagePage == GaragePage.PartChoices) {
        let source: GarageMenuOption[] = []
        let catalog = corePartCatalog(garageEditSlot)
        for (let index = 0; index < catalog.length; index++) {
            let marker = garageLoadout.partId(garageEditSlot) == index ? "*" : " "
            source.push(option(
                marker + coreWeightClassName(catalog[index].weightClass),
                index
            ))
        }
        garageOptions = paginatedGarageOptions(source, garageMenuPage)
    } else if (garagePage == GaragePage.PaintChannels) {
        let source = [
            option("Primary", CorePaintChannel.Primary),
            option("Second", CorePaintChannel.Secondary),
            option("Accent", CorePaintChannel.Accent)
        ]
        garageOptions = paginatedGarageOptions(source, garageMenuPage)
    } else if (garagePage == GaragePage.PaintChoices) {
        let source: GarageMenuOption[] = []
        let current = garageLoadout.color(garageEditSlot, garagePaintChannel)
        for (let color = 1; color <= 15; color++) {
            let marker = color == current ? "*" : " "
            source.push(option(marker + coreColorName(color), color))
        }
        garageOptions = paginatedGarageOptions(source, garageMenuPage)
    } else if (garagePage == GaragePage.Stats || garagePage == GaragePage.Help) {
        garageOptions = [option("Back", 0)]
    }

    if (garageSelection >= garageOptions.length) {
        garageSelection = Math.max(0, garageOptions.length - 1)
    }
    updateGarageCandidate()
}

function refreshGarageStats() {
    garageEquippedStats = calculateCoreStats(garageLoadout)
    garagePreviewStats = garagePreviewLoadout
        ? calculateCoreStats(garagePreviewLoadout)
        : garageEquippedStats
}

function updateGarageCandidate() {
    garageCandidatePart = -1
    garageCandidateColor = -1
    garagePreviewLoadout = null
    if (garageSelection < 0 || garageSelection >= garageOptions.length) {
        refreshGarageStats()
        return
    }
    let selected = garageOptions[garageSelection]
    if (selected.action != GARAGE_ACTION_SELECT) {
        refreshGarageStats()
        return
    }
    if (garagePage == GaragePage.PartChoices) {
        garageCandidatePart = selected.value
    } else if (garagePage == GaragePage.PaintChoices) {
        garageCandidateColor = selected.value
    }

    if (garageCandidatePart >= 0 || garageCandidateColor >= 0) {
        garagePreviewLoadout = cloneCoreLoadout(garageLoadout)
        if (garageCandidatePart >= 0) {
            garagePreviewLoadout.setPart(garageEditSlot, garageCandidatePart)
        }
        if (garageCandidateColor >= 0) {
            garagePreviewLoadout.setColor(
                garageEditSlot,
                garagePaintChannel,
                garageCandidateColor
            )
        }
    }

    refreshGarageStats()
}

function previewGarageLoadout() {
    return garagePreviewLoadout || garageLoadout
}

function showGarageMessage(message: string) {
    garageMessage = message
    garageMessageUntil = game.runtime() + 1800
}

function garageMoveSelection(delta: number) {
    if (garageOptions.length == 0) {
        return
    }
    garageSelection = (garageSelection + delta + garageOptions.length) % garageOptions.length
    updateGarageCandidate()
}

function garageChoose() {
    if (garageOptions.length == 0) {
        return
    }
    let selected = garageOptions[garageSelection]
    if (selected.action == GARAGE_ACTION_MORE) {
        garageMenuPage += 1
        garageSelection = 0
        refreshGarageOptions()
        return
    } else if (selected.action == GARAGE_ACTION_PREVIOUS) {
        garageMenuPage = Math.max(0, garageMenuPage - 1)
        garageSelection = 0
        refreshGarageOptions()
        return
    } else if (selected.action == GARAGE_ACTION_BACK) {
        garageBack()
        return
    }

    if (garagePage == GaragePage.Gallery) {
        if (selected.value == 0) {
            setGaragePage(GaragePage.Main)
        } else {
            setGaragePage(GaragePage.Help)
        }
    } else if (garagePage == GaragePage.Main) {
        if (selected.value == 0) {
            setGaragePage(GaragePage.PartSlots)
        } else if (selected.value == 1) {
            setGaragePage(GaragePage.PaintSlots)
        } else if (selected.value == 2) {
            setGaragePage(GaragePage.Stats)
        } else {
            setGaragePage(GaragePage.Gallery)
        }
    } else if (garagePage == GaragePage.PartSlots) {
        garageEditSlot = selected.value
        setGaragePage(GaragePage.PartChoices)
    } else if (garagePage == GaragePage.PartChoices) {
        garageLoadout.setPart(garageEditSlot, selected.value)
        clearCoreRenderCache()
        saveCoreLoadout(garageLoadout)
        showGarageMessage(coreSlotName(garageEditSlot) + " equipped")
        refreshGarageOptions()
    } else if (garagePage == GaragePage.PaintSlots) {
        garageEditSlot = selected.value
        setGaragePage(GaragePage.PaintChannels)
    } else if (garagePage == GaragePage.PaintChannels) {
        garagePaintChannel = selected.value
        setGaragePage(GaragePage.PaintChoices)
    } else if (garagePage == GaragePage.PaintChoices) {
        garageLoadout.setColor(
            garageEditSlot,
            garagePaintChannel,
            selected.value
        )
        clearCoreRenderCache()
        saveCoreLoadout(garageLoadout)
        showGarageMessage(
            coreSlotName(garageEditSlot) + " " +
            corePaintChannelName(garagePaintChannel) + " painted"
        )
        refreshGarageOptions()
    } else {
        garageBack()
    }
}

function garageBack() {
    if (garagePage == GaragePage.Gallery) {
        return
    } else if (garagePage == GaragePage.Main) {
        setGaragePage(GaragePage.Gallery)
    } else if (garagePage == GaragePage.PartSlots ||
        garagePage == GaragePage.PaintSlots ||
        garagePage == GaragePage.Stats) {
        setGaragePage(GaragePage.Main)
    } else if (garagePage == GaragePage.PartChoices) {
        setGaragePage(GaragePage.PartSlots)
    } else if (garagePage == GaragePage.PaintChannels) {
        setGaragePage(GaragePage.PaintSlots)
    } else if (garagePage == GaragePage.PaintChoices) {
        setGaragePage(GaragePage.PaintChannels)
    } else if (garagePage == GaragePage.Help) {
        setGaragePage(GaragePage.Gallery)
    } else {
        setGaragePage(GaragePage.Main)
    }
}

function drawGarageBackground(target: Image) {
    target.fill(15)
    target.fillRect(0, 0, 160, 10, 13)
    target.fillRect(0, 108, 160, 12, 13)
    target.drawLine(0, 107, 159, 107, 1)
    target.drawLine(2, 11, 2, 106, 1)
    target.drawLine(157, 11, 157, 106, 1)
    for (let x = 8; x < 160; x += 16) {
        target.fillRect(x, 12, 1, 3, 12)
        target.fillRect(x, 103, 1, 3, 12)
    }
    target.print("C O D E D   C O R E", 6, 2, 1)
}

function drawMenuPanel(target: Image, title: string) {
    target.fillRect(101, 14, 56, 91, 1)
    target.fillRect(103, 16, 52, 87, 15)
    target.fillRect(103, 16, 52, 11, 12)
    target.print(title, 106, 19, 1)

    for (let index = 0; index < garageOptions.length; index++) {
        let y = 31 + index * 11
        if (index == garageSelection) {
            target.fillRect(105, y - 1, 48, 9, 8)
            target.print(">", 106, y, 1)
        }
        let visibleLabel = garageOptions[index].label
        if (visibleLabel.length > 7) {
            visibleLabel = visibleLabel.substr(0, 7)
        }
        target.print(visibleLabel, 112, y, index == garageSelection ? 1 : 13)
    }
}

function drawStatBar(
    target: Image,
    label: string,
    value: number,
    comparison: number,
    x: number,
    y: number,
    scale: number,
    barWidth: number,
    higherIsBetter: boolean
) {
    target.print(label, x, y, 13)
    target.fillRect(x, y + 7, barWidth, 4, 1)
    let width = Math.max(
        1,
        Math.min(barWidth, Math.idiv(value * barWidth, scale))
    )
    let color = 6
    if (value != comparison) {
        let improved = higherIsBetter ? value > comparison : value < comparison
        color = improved ? 7 : 2
    }
    target.fillRect(x, y + 7, width, 4, color)
}

function drawCorePreview(target: Image, loadout: CoreLoadout) {
    target.fillRect(5, 14, 93, 91, 1)
    target.fillRect(7, 16, 89, 87, 15)
    target.drawLine(9, 98, 94, 98, 13)
    drawCoreAtFoot(target, loadout, 52, 98)

    if (garagePage == GaragePage.PartChoices && garageCandidatePart >= 0) {
        let candidateName = corePart(garageEditSlot, garageCandidatePart).name
        target.print(candidateName.substr(0, 10), 9, 18, 1, image.font5)
    } else if (garagePage == GaragePage.PaintChoices) {
        let paintLabel = coreSlotName(garageEditSlot) + " " +
            corePaintChannelName(garagePaintChannel)
        target.print(paintLabel.substr(0, 10), 9, 18, 1, image.font5)
    }

    let stats = garagePreviewStats
    let equippedStats = garageEquippedStats
    target.fillRect(74, 18, 20, 55, 15)
    drawStatBar(target, "WT", stats.weight, equippedStats.weight, 74, 18, 200, 18, false)
    drawStatBar(target, "AR", stats.armor, equippedStats.armor, 74, 31, 250, 18, true)
    drawStatBar(target, "MV", stats.mobility, equippedStats.mobility, 74, 44, 100, 18, true)
    drawStatBar(target, "EN", stats.energy, equippedStats.energy, 74, 57, 120, 18, true)
}

function drawGallery(target: Image) {
    target.print("3 FRAME CLASSES", 14, 15, 1)
    for (let index = 0; index < 3; index++) {
        let loadout = galleryLoadouts[index]
        let bob = index == galleryTurn ? -1 : 0
        drawCoreAtFoot(target, loadout, galleryXPositions[index], 86 + bob)
        let labelX = galleryXPositions[index] - galleryNames[index].length * 3
        target.print(
            galleryNames[index],
            labelX,
            91,
            index == galleryTurn ? 5 : 1
        )
    }
    drawMenuPanel(target, "SHOWCASE")
}

function drawStatsPage(target: Image) {
    let stats = garageEquippedStats
    drawCorePreview(target, garageLoadout)
    target.fillRect(101, 14, 56, 91, 1)
    target.fillRect(103, 16, 52, 87, 15)
    target.fillRect(103, 16, 52, 11, 12)
    target.print("CORE STATS", 106, 19, 1)
    target.print("Weight " + stats.weight, 106, 33, 13)
    target.print("Armor  " + stats.armor, 106, 44, 13)
    target.print("Move   " + stats.mobility, 106, 55, 13)
    target.print("Energy " + stats.energy, 106, 66, 13)
    target.fillRect(105, 83, 48, 13, 8)
    target.print("> Back", 106, 86, 1)
}

function drawHelpPage(target: Image) {
    target.fillRect(8, 15, 144, 89, 1)
    target.fillRect(10, 17, 140, 85, 15)
    target.fillRect(10, 17, 140, 11, 12)
    target.print("GARAGE CONTROLS", 51, 20, 1)
    target.print("UP/DOWN   Select", 18, 35, 1)
    target.print("A         Confirm / equip", 18, 47, 1)
    target.print("B         Back", 18, 59, 1)
    target.print("MENU      Return to gallery", 18, 71, 1)
    target.print("Parts preview live before A.", 18, 85, 13)
    target.fillRect(112, 86, 30, 11, 8)
    target.print("A Back", 113, 88, 1)
}

function drawGarageFrame(target: Image) {
    drawGarageBackground(target)
    if (garagePage == GaragePage.Gallery) {
        drawGallery(target)
    } else if (garagePage == GaragePage.Help) {
        drawHelpPage(target)
    } else if (garagePage == GaragePage.Stats) {
        drawStatsPage(target)
    } else {
        drawCorePreview(target, previewGarageLoadout())
        let title = "GARAGE"
        if (garagePage == GaragePage.PartSlots) {
            title = "ASSEMBLY"
        } else if (garagePage == GaragePage.PartChoices) {
            title = coreSlotName(garageEditSlot).toUpperCase()
        } else if (garagePage == GaragePage.PaintSlots) {
            title = "PAINT PART"
        } else if (garagePage == GaragePage.PaintChannels) {
            title = "PAINT TYPE"
        } else if (garagePage == GaragePage.PaintChoices) {
            title = "COLOR"
        }
        drawMenuPanel(target, title)
    }

    if (garageMessage.length > 0 && game.runtime() < garageMessageUntil) {
        target.fillRect(8, 109, 144, 9, 12)
        target.print(garageMessage, 11, 111, 1)
    } else if (garageMessage.length > 0) {
        garageMessage = ""
    } else if (garagePage == GaragePage.PartChoices ||
        garagePage == GaragePage.PaintChoices) {
        target.print("* Equipped  A Apply  B Back", 4, 111, 1)
    } else {
        target.print("UP/DN Move  A Select  B Back", 4, 111, 1)
    }
}

function startCoreGarage(loadout: CoreLoadout) {
    garageLoadout = loadout
    galleryLoadouts = []
    for (let index = 0; index < 3; index++) {
        let galleryLoadout = matchingCoreLoadout(index)
        setCorePalette(
            galleryLoadout,
            galleryPalettePrimary[index],
            galleryPaletteSecondary[index],
            galleryPaletteAccent[index]
        )
        galleryLoadouts.push(galleryLoadout)
    }
    setGaragePage(GaragePage.Gallery)

    controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
        garageMoveSelection(-1)
    })
    controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
        garageMoveSelection(1)
    })
    controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
        garageChoose()
    })
    controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
        garageBack()
    })
    controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {
        setGaragePage(GaragePage.Gallery)
    })

    game.onUpdateInterval(900, function () {
        galleryTurn = (galleryTurn + 1) % 3
    })
    game.onShade(function () {
        drawGarageFrame(garageFrameImage)
        screen.drawTransparentImage(garageFrameImage, 0, 0)
    })
}
