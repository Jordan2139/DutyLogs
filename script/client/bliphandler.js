let blips = [];
let shouldShowBlips = false;

RegisterNetEvent('OndutyLogs::CreateBlip::Client')
on('OndutyLogs::CreateBlip::Client', function (data) {
    shouldShowBlips = true;
})

RegisterNetEvent('OndutyLogs::RemoveBlip::Client')
on('OndutyLogs::RemoveBlip::Client', function (src) {
    CleanUpBlips()
    shouldShowBlips = false;
})

RegisterNetEvent('OndutyLogs::UpdateBlips::Client')
on('OndutyLogs::UpdateBlips::Client', function (activeBlips) {
    if (shouldShowBlips) {
        CleanUpBlips()
        RefreshBlips(activeBlips)
    }
})

function CleanUpBlips() {
    for (let i = 0; i < blips.length; i++) {
        let id = blips[i];
        if (id !== 0) {
            RemoveBlip(id);
            blips[i] = 0;
        }
    }
}

function RefreshBlips(activeBlips) {
    let myServerId = GetPlayerServerId(PlayerId());
    for (src, data in activeBlips) {
        if (src !== myServerId) {
            if (data && data.coords) {
                let blip = AddBlipForCoord(data.coords.x, data.coords.y, data.coords.z);
                SetBlipSprite(blip, data.sprite);
                SetBlipDisplay(blip, 4);
                SetBlipScale(blip, data.scale);
                SetBlipColour(blip, data.color);
                SetBlipAsShortRange(blip, true);
                BeginTextCommandSetBlipName("STRING");
                AddTextComponentString(data.name);
                EndTextCommandSetBlipName(blip);
                blips.push(blip);
            }
        }
    }
}