let onduty = false;
let department = null;
let blips = [];
let shouldShowBlips = false;

RegisterCommand('duty', (_, args) => {
     if (!args[0]) return emit('chat:addMessage', { color: [255, 0, 0], multiline: true, args: ['[SSRP Duty Logs] ', '^1[ERROR] ^7You must specify a department.'] })
     if (onduty && department.abbr.toUpperCase() === args[0].toUpperCase()) {
          emitNet('OndutyLogs::OffDuty', args[0])
     } else if (!onduty) {
          emitNet('OndutyLogs::OnDuty', args[0])
     } else if (onduty && department.abbr.toUpperCase() !== args[0].toUpperCase()) {
          emit('chat:addMessage', { color: [255, 0, 0], multiline: true, args: ['[SSRP Duty Logs] ', `^1[ERROR] ^7You are already on duty as ${department}, you must go off duty as that first, then you may go on duty as ${args[0]}.`] })
     }
})

RegisterCommand('checkduty', () => {
     if (department) {
          emit('chat:addMessage', { color: [255, 0, 0], multiline: true, args: ['[SSRP Duty Logs] ', `^2[SUCCESS] ^7You are currently ${onduty ? 'on' : 'off'} duty as ${department ? department.name : 'N/A'}`] })
          emitNet('OndutyLogs::CheckDuty', department)
     } else {
          emit('chat:addMessage', { color: [255, 0, 0], multiline: true, args: ['[SSRP Duty Logs] ', `^1[ERROR] ^7You are not on duty.`] })
     }
})

RegisterNetEvent('OndutyLogs::CheckDuty::Callback')
onNet('OndutyLogs::CheckDuty::Callback', (status, error) => {
     if (error) {
          emit('chat:addMessage', { color: [255, 0, 0], multiline: true, args: ['[SSRP Duty Logs] ', '^1[ERROR] ^7' + error] })
     } else {
          emit('chat:addMessage', { color: [255, 0, 0], multiline: false, args: ['[SSRP Duty Logs] ', `^2[SUCCESS] ^7People on duty:`] })
          status.forEach((person) => {
               emit('chat:addMessage', { color: [255, 0, 0], multiline: false, args: [(`- ${person.playerName} - ${person.blips.label}`)] })
          })
     }
})

RegisterNetEvent('OndutyLogs::Callback')
onNet('OndutyLogs::Callback', (status, error) => {
     if (error) {
          emit('chat:addMessage', { color: [255, 0, 0], multiline: true, args: ['[SSRP Duty Logs] ', '^1[ERROR] ^7' + error] })
     } else {
          if (status.duty) {
               emit('chat:addMessage', { color: [255, 0, 0], multiline: true, args: ['[SSRP Duty Logs] ', `^2[SUCCESS] ^7You are now on duty as ${status.department.name}. \n${status.department.blips.enabled ? 'You have access to ' + status.department.blips.type + ' blips' : 'This department does not have access to blips'}`] })
               onduty = true;
               department = status.department;
               console.log(department)
          } else {
               emit('chat:addMessage', { color: [255, 0, 0], multiline: true, args: ['[SSRP Duty Logs] ', `^2[SUCCESS] ^7You are now off duty as ${status.department.name}.\n ${status.department.blips.enabled ? 'Your ' + status.department.blips.type + ' have been disabled' : ''}`] })
               onduty = false;
               department = null;
          }
     }
})

emit('chat:addSuggestion', '/duty', '[SSRP Duty Logs] Toggle your duty status.', [{ name: 'department', help: 'The department you are going on duty as.' }])

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
     for (const src in activeBlips) {
          if (activeBlips.hasOwnProperty(src)) {
               const data = activeBlips[src];
               if (data.id !== myServerId) {
                    if (data && data.coords && data.blips.type.toLowerCase() == department.blips.type.toLowerCase() && data.blips.enabled) {
                         let blip = AddBlipForCoord(data.coords[0], data.coords[1], data.coords[2]);
                         SetBlipSprite(blip, data.blips.sprite);
                         SetBlipDisplay(blip, 4);
                         SetBlipColour(blip, data.blips.color);
                         SetBlipAsShortRange(blip, true);
                         SetBlipShowCone(blip, true);
                         BeginTextCommandSetBlipName("STRING");
                         AddTextComponentString(data.playerName + ' - ' + data.blips.label);
                         EndTextCommandSetBlipName(blip);
                         blips.push(blip);
                    }
               }
          }
     }
}