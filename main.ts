initializeCorePartCatalogs()

let playerCoreLoadout = loadCoreLoadout()
if (!playerCoreLoadout) {
    // The balanced frame is the first editable build. The gallery still shows
    // the complete Light, Medium, and Heavy designs together on every launch.
    playerCoreLoadout = matchingCoreLoadout(1)
    setCorePalette(playerCoreLoadout, 8, 6, 5)
}

startCoreGarage(playerCoreLoadout)
