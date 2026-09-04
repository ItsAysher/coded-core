// Simulator assertions for modular Core catalogs, artwork, rendering, menus,
// cache invalidation, paint isolation, and persistent loadouts.

let coreTestAssertionCount = 0

function coreTestCheck(condition: boolean, code: number) {
    coreTestAssertionCount += 1
    control.assert(condition, code)
}

function coreTestChannelMask(art: CorePartArt, channel: CorePaintChannel) {
    if (channel == CorePaintChannel.Primary) {
        return art.primary
    } else if (channel == CorePaintChannel.Secondary) {
        return art.secondary
    }
    return art.accent
}

function coreTestSourceColor(channel: CorePaintChannel) {
    if (channel == CorePaintChannel.Primary) {
        return CORE_PRIMARY_SOURCE
    } else if (channel == CorePaintChannel.Secondary) {
        return CORE_SECONDARY_SOURCE
    }
    return CORE_ACCENT_SOURCE
}

function coreTestPartLayers(part: CorePartDefinition) {
    let art = part.art
    coreTestCheck(art.base.width == art.primary.width, 901)
    coreTestCheck(art.base.height == art.primary.height, 902)
    coreTestCheck(art.base.width == art.secondary.width, 903)
    coreTestCheck(art.base.height == art.secondary.height, 904)
    coreTestCheck(art.base.width == art.accent.width, 905)
    coreTestCheck(art.base.height == art.accent.height, 906)

    let primaryPixels = 0
    let secondaryPixels = 0
    let accentPixels = 0
    let baseIsPure = true
    let primaryIsPure = true
    let secondaryIsPure = true
    let accentIsPure = true
    let masksAreDisjoint = true
    let masksStayOnBase = true

    for (let y = 0; y < art.base.height; y++) {
        for (let x = 0; x < art.base.width; x++) {
            let basePixel = art.base.getPixel(x, y)
            let primaryPixel = art.primary.getPixel(x, y)
            let secondaryPixel = art.secondary.getPixel(x, y)
            let accentPixel = art.accent.getPixel(x, y)

            // Base art is immutable neutral metal; source paint colors live
            // only in their masks.
            if (basePixel != 0 && basePixel != 1 && basePixel != 13 &&
                basePixel != 14 && basePixel != 15) {
                baseIsPure = false
            }
            if (primaryPixel != 0 && primaryPixel != CORE_PRIMARY_SOURCE) {
                primaryIsPure = false
            }
            if (secondaryPixel != 0 && secondaryPixel != CORE_SECONDARY_SOURCE) {
                secondaryIsPure = false
            }
            if (accentPixel != 0 && accentPixel != CORE_ACCENT_SOURCE) {
                accentIsPure = false
            }

            let maskCount = 0
            if (primaryPixel != 0) {
                primaryPixels += 1
                maskCount += 1
            }
            if (secondaryPixel != 0) {
                secondaryPixels += 1
                maskCount += 1
            }
            if (accentPixel != 0) {
                accentPixels += 1
                maskCount += 1
            }

            // A paint pixel must cover authored base material, and channels
            // may not overlap because their draw order would make one vanish.
            if (maskCount > 1) {
                masksAreDisjoint = false
            }
            if (maskCount > 0 && basePixel == 0) {
                masksStayOnBase = false
            }
        }
    }

    coreTestCheck(baseIsPure, 907)
    coreTestCheck(primaryIsPure, 908)
    coreTestCheck(secondaryIsPure, 909)
    coreTestCheck(accentIsPure, 910)
    coreTestCheck(masksAreDisjoint, 911)
    coreTestCheck(masksStayOnBase, 912)
    coreTestCheck(primaryPixels > 0, 913)
    coreTestCheck(secondaryPixels > 0, 914)
    coreTestCheck(accentPixels > 0, 915)
}

function coreTestPartPlacement(loadout: CoreLoadout, slot: CorePartSlot) {
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

    if (slot == CorePartSlot.Head) {
        return [
            bodyX + body.art.neckX - head.art.attachX,
            bodyY + body.art.neckY - head.art.attachY
        ]
    } else if (slot == CorePartSlot.Body) {
        return [bodyX, bodyY]
    } else if (slot == CorePartSlot.Arms) {
        return [
            bodyX + body.art.shoulderX - arms.art.attachX,
            bodyY + body.art.shoulderY - arms.art.attachY
        ]
    }
    return [legsX, legsY]
}

function coreTestPartBounds(
    part: CorePartDefinition,
    position: number[]
) {
    coreTestCheck(position[0] >= 0, 921)
    coreTestCheck(position[1] >= 0, 922)
    coreTestCheck(position[0] + part.art.base.width <= CORE_CANVAS_WIDTH, 923)
    coreTestCheck(position[1] + part.art.base.height <= CORE_CANVAS_HEIGHT, 924)
    coreTestCheck(
        position[1] + part.art.base.height - 1 <= CORE_FOOT_BASELINE,
        925
    )
}

function coreTestDrawDefaultPart(
    target: Image,
    part: CorePartDefinition,
    position: number[]
) {
    target.drawTransparentImage(part.art.base, position[0], position[1])
    target.drawTransparentImage(part.art.primary, position[0], position[1])
    target.drawTransparentImage(part.art.secondary, position[0], position[1])
    target.drawTransparentImage(part.art.accent, position[0], position[1])
}

function coreTestVisibleHeight(imageToMeasure: Image) {
    let top = imageToMeasure.height
    let bottom = -1
    for (let y = 0; y < imageToMeasure.height; y++) {
        for (let x = 0; x < imageToMeasure.width; x++) {
            if (imageToMeasure.getPixel(x, y) != 0) {
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

function coreTestCatalogsAndLayers() {
    let catalogs: CorePartDefinition[][] = [
        headParts,
        bodyParts,
        armParts,
        legParts
    ]

    coreTestCheck(coreColorNames.length == 15, 931)
    for (let slot = 0; slot < catalogs.length; slot++) {
        let catalog = catalogs[slot]
        coreTestCheck(catalog.length == 3, 932)
        for (let index = 0; index < catalog.length; index++) {
            let part = catalog[index]
            coreTestCheck(part.id == index, 933)
            coreTestCheck(part.slot == slot, 934)
            coreTestCheck(part.weightClass == index, 935)
            coreTestCheck(part.name.length > 0, 936)
            coreTestCheck(part.weight > 0, 937)
            coreTestCheck(part.armor > 0, 938)
            coreTestCheck(part.mobility > 0, 939)
            coreTestCheck(part.energy > 0, 940)
            coreTestPartLayers(part)
        }
    }

    let lightStats = calculateCoreStats(matchingCoreLoadout(0))
    let mediumStats = calculateCoreStats(matchingCoreLoadout(1))
    let heavyStats = calculateCoreStats(matchingCoreLoadout(2))
    coreTestCheck(lightStats.weight < mediumStats.weight, 941)
    coreTestCheck(mediumStats.weight < heavyStats.weight, 942)
    coreTestCheck(lightStats.armor < mediumStats.armor, 943)
    coreTestCheck(mediumStats.armor < heavyStats.armor, 944)
    coreTestCheck(lightStats.mobility > mediumStats.mobility, 945)
    coreTestCheck(mediumStats.mobility > heavyStats.mobility, 946)
}

function coreTestAllCrossFamilyRenders() {
    let combinationCount = 0
    for (let headIndex = 0; headIndex < 3; headIndex++) {
        for (let bodyIndex = 0; bodyIndex < 3; bodyIndex++) {
            for (let armsIndex = 0; armsIndex < 3; armsIndex++) {
                for (let legsIndex = 0; legsIndex < 3; legsIndex++) {
                    let loadout = new CoreLoadout(
                        headIndex,
                        bodyIndex,
                        armsIndex,
                        legsIndex
                    )
                    let headPosition = coreTestPartPlacement(loadout, CorePartSlot.Head)
                    let bodyPosition = coreTestPartPlacement(loadout, CorePartSlot.Body)
                    let armsPosition = coreTestPartPlacement(loadout, CorePartSlot.Arms)
                    let legsPosition = coreTestPartPlacement(loadout, CorePartSlot.Legs)

                    coreTestPartBounds(headParts[headIndex], headPosition)
                    coreTestPartBounds(bodyParts[bodyIndex], bodyPosition)
                    coreTestPartBounds(armParts[armsIndex], armsPosition)
                    coreTestPartBounds(legParts[legsIndex], legsPosition)

                    let rendered = renderCoreImage(loadout)
                    let expected = image.create(CORE_CANVAS_WIDTH, CORE_CANVAS_HEIGHT)
                    coreTestDrawDefaultPart(expected, legParts[legsIndex], legsPosition)
                    coreTestDrawDefaultPart(expected, armParts[armsIndex], armsPosition)
                    coreTestDrawDefaultPart(expected, bodyParts[bodyIndex], bodyPosition)
                    coreTestDrawDefaultPart(expected, headParts[headIndex], headPosition)

                    coreTestCheck(rendered.width == CORE_CANVAS_WIDTH, 951)
                    coreTestCheck(rendered.height == CORE_CANVAS_HEIGHT, 952)
                    let occupiedPixels = 0
                    let baselinePixels = 0
                    let matchesExpected = true
                    let staysAboveBaseline = true
                    for (let y = 0; y < rendered.height; y++) {
                        for (let x = 0; x < rendered.width; x++) {
                            let pixel = rendered.getPixel(x, y)
                            if (pixel != expected.getPixel(x, y)) {
                                matchesExpected = false
                            }
                            if (pixel != 0) {
                                occupiedPixels += 1
                                if (y > CORE_FOOT_BASELINE) {
                                    staysAboveBaseline = false
                                }
                                if (y == CORE_FOOT_BASELINE) {
                                    baselinePixels += 1
                                }
                            }
                        }
                    }
                    coreTestCheck(matchesExpected, 953)
                    coreTestCheck(staysAboveBaseline, 954)
                    coreTestCheck(occupiedPixels > 0, 955)
                    coreTestCheck(baselinePixels > 0, 956)
                    combinationCount += 1
                }
            }
        }
    }
    coreTestCheck(combinationCount == 81, 957)
}

function coreTestMatchingFrameHeights() {
    clearCoreRenderCache()
    let light = matchingCoreLoadout(0)
    let medium = matchingCoreLoadout(1)
    let heavy = matchingCoreLoadout(2)
    let lightHeight = coreVisibleHeight(light)
    let mediumHeight = coreVisibleHeight(medium)
    let heavyHeight = coreVisibleHeight(heavy)

    coreTestCheck(lightHeight == coreTestVisibleHeight(cachedCoreImage(light)), 961)
    coreTestCheck(mediumHeight == coreTestVisibleHeight(cachedCoreImage(medium)), 962)
    coreTestCheck(heavyHeight == coreTestVisibleHeight(cachedCoreImage(heavy)), 963)
    coreTestCheck(lightHeight < mediumHeight, 964)
    coreTestCheck(mediumHeight < heavyHeight, 965)
}

function coreTestPaintIsolation() {
    for (let slot = 0; slot < 4; slot++) {
        for (let channel = 0; channel < 3; channel++) {
            let equipped = matchingCoreLoadout(1)
            let candidate = cloneCoreLoadout(equipped)
            let beforeRevision = candidate.revision
            let destinationColor = 2 + channel
            candidate.setColor(slot, channel, destinationColor)

            coreTestCheck(candidate.revision == beforeRevision + 1, 971)
            for (let checkedSlot = 0; checkedSlot < 4; checkedSlot++) {
                for (let checkedChannel = 0; checkedChannel < 3; checkedChannel++) {
                    let expectedColor = coreTestSourceColor(checkedChannel)
                    if (checkedSlot == slot && checkedChannel == channel) {
                        expectedColor = destinationColor
                    }
                    coreTestCheck(
                        candidate.color(checkedSlot, checkedChannel) == expectedColor,
                        972
                    )
                }
            }

            let before = renderCoreImage(equipped)
            let after = renderCoreImage(candidate)
            let selectedPart = corePart(slot, candidate.partId(slot))
            let selectedPosition = coreTestPartPlacement(candidate, slot)
            let selectedMask = coreTestChannelMask(selectedPart.art, channel)
            let sourceColor = coreTestSourceColor(channel)
            let changedPixels = 0
            let differencesStayInMask = true
            let differencesStartAtSource = true
            let differencesEndAtDestination = true

            for (let y = 0; y < after.height; y++) {
                for (let x = 0; x < after.width; x++) {
                    if (before.getPixel(x, y) != after.getPixel(x, y)) {
                        let localX = x - selectedPosition[0]
                        let localY = y - selectedPosition[1]
                        if (localX < 0 || localY < 0 ||
                            localX >= selectedMask.width ||
                            localY >= selectedMask.height) {
                            differencesStayInMask = false
                        } else if (selectedMask.getPixel(localX, localY) != sourceColor) {
                            differencesStayInMask = false
                        }
                        if (before.getPixel(x, y) != sourceColor) {
                            differencesStartAtSource = false
                        }
                        if (after.getPixel(x, y) != destinationColor) {
                            differencesEndAtDestination = false
                        }
                        changedPixels += 1
                    }
                }
            }
            coreTestCheck(differencesStayInMask, 977)
            coreTestCheck(differencesStartAtSource, 978)
            coreTestCheck(differencesEndAtDestination, 979)
            coreTestCheck(changedPixels > 0, 980)
        }
    }
}

function coreTestPagination() {
    let source: GarageMenuOption[] = []
    for (let index = 0; index < 15; index++) {
        source.push(option("Choice " + index, index))
    }

    for (let page = 0; page < 4; page++) {
        let pageOptions = paginatedGarageOptions(source, page)
        let contentCount = 0
        let previousCount = 0
        let moreCount = 0
        let backCount = 0
        let expectedSourceIndex = page * GARAGE_CONTENT_PAGE_SIZE

        for (let index = 0; index < pageOptions.length; index++) {
            let menuOption = pageOptions[index]
            if (menuOption.action == GARAGE_ACTION_SELECT) {
                coreTestCheck(menuOption.value == expectedSourceIndex, 981)
                expectedSourceIndex += 1
                contentCount += 1
            } else if (menuOption.action == GARAGE_ACTION_PREVIOUS) {
                previousCount += 1
            } else if (menuOption.action == GARAGE_ACTION_MORE) {
                moreCount += 1
            } else if (menuOption.action == GARAGE_ACTION_BACK) {
                backCount += 1
            }
        }

        coreTestCheck(contentCount <= 4, 982)
        coreTestCheck(contentCount == Math.min(4, 15 - page * 4), 983)
        coreTestCheck(previousCount == (page > 0 ? 1 : 0), 984)
        coreTestCheck(moreCount == (page < 3 ? 1 : 0), 985)
        coreTestCheck(backCount == 1, 986)
        coreTestCheck(
            pageOptions[pageOptions.length - 1].action == GARAGE_ACTION_BACK,
            987
        )
    }

    let exactPage: GarageMenuOption[] = []
    for (let index = 0; index < 4; index++) {
        exactPage.push(option("Exact " + index, index))
    }
    let exactOptions = paginatedGarageOptions(exactPage, 0)
    coreTestCheck(exactOptions.length == 5, 988)
    coreTestCheck(exactOptions[4].action == GARAGE_ACTION_BACK, 989)
}

function coreTestRenderCache() {
    clearCoreRenderCache()
    let loadout = matchingCoreLoadout(1)
    let first = cachedCoreImage(loadout)
    coreTestCheck(cachedCoreImage(loadout) == first, 991)
    loadout.setColor(CorePartSlot.Head, CorePaintChannel.Primary, 2)
    let nextRevision = cachedCoreImage(loadout)
    coreTestCheck(nextRevision != first, 992)
    coreTestCheck(cachedCoreImage(loadout) == nextRevision, 993)
    clearCoreRenderCache()
    coreTestCheck(cachedCoreImage(loadout) != nextRevision, 994)
}

function coreTestPersistenceRoundTrip() {
    let previousSave = settings.readNumberArray(CORE_SAVE_KEY)
    let source = new CoreLoadout(2, 0, 1, 2)
    for (let slot = 0; slot < 4; slot++) {
        source.setColor(slot, CorePaintChannel.Primary, 1 + slot)
        source.setColor(slot, CorePaintChannel.Secondary, 5 + slot)
        source.setColor(slot, CorePaintChannel.Accent, 9 + slot)
    }

    saveCoreLoadout(source)
    let loaded = loadCoreLoadout()
    let roundTripMatches = loaded != null
    if (loaded) {
        roundTripMatches = roundTripMatches && loaded.headId == source.headId
        roundTripMatches = roundTripMatches && loaded.bodyId == source.bodyId
        roundTripMatches = roundTripMatches && loaded.armsId == source.armsId
        roundTripMatches = roundTripMatches && loaded.legsId == source.legsId
        for (let slot = 0; slot < 4; slot++) {
            for (let channel = 0; channel < 3; channel++) {
                roundTripMatches = roundTripMatches &&
                    loaded.color(slot, channel) == source.color(slot, channel)
            }
        }
    }

    // Simulator tests leave the user's pre-test settings exactly as found.
    if (previousSave) {
        settings.writeNumberArray(CORE_SAVE_KEY, previousSave)
    } else {
        settings.remove(CORE_SAVE_KEY)
    }
    coreTestCheck(roundTripMatches, 995)
}

initializeCorePartCatalogs()
coreTestCatalogsAndLayers()
coreTestAllCrossFamilyRenders()
coreTestMatchingFrameHeights()
coreTestPaintIsolation()
coreTestPagination()
coreTestRenderCache()
coreTestPersistenceRoundTrip()
clearCoreRenderCache()
console.logValue("Core assertions passed", coreTestAssertionCount)
