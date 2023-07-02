let blips = []
RegisterNetEvent('OndutyLogs::CreateBlip')
on('OndutyLogs::CreateBlip', function (data) {
    blips.push(data.src)
    emitNet('OndutyLogs::CreateBlip::Client', data.src, data)
})

RegisterNetEvent('OndutyLogs::RemoveBlip')
on('OndutyLogs::RemoveBlip', function (src) {
    blips = blips.filter(function (blip) {
        return blip !== src
    })
    emitNet('OndutyLogs::RemoveBlip::Client', src)
})

on('playerDropped', function (reason) {
    blips = blips.filter(function (blip) {
        return blip !== source
    })
})

Citizen.CreateThread(function () {
    let lastUpdated = Date.now()
    while (true) {
        if (Date.now() - lastUpdated > 3000) {
            lastUpdated = Date.now()
            emitNet('OndutyLogs::UpdateBlips::Client', blips)
        }
        Wait(0)
    }
})