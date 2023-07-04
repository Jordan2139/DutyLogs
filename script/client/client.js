/*
     * This is the main client script for the Duty Logs resource.
     * This script handles the client-side commands and blips.
*/

/*
     * Variables
     * onduty is used to check if the player is on duty or not.
     * department is used to check what department the player is on duty as.
     * blips is used to store the blips that are created.
     * blips is used to remove the blips when the player goes off duty.
     * blips is used to update the blips when the player changes the department they are on duty as.
     * shouldShowBlips is used to check if the blips should be shown or not.
     * showDutyCount is used to check if the duty count should be shown or not.
     * showDutyCountEnabled is used to check if the duty count is enabled or not in the config.
*/
let onduty = false;
let department = null;
let blips = [];
let shouldShowBlips = false;
let showDutyCount = true;
let showDutyCountEnabled = nil;

/*
     * Registering Commands and Suggestions
     * This registers the /duty and /checkduty commands.
     * /duty toggles your duty status, and /checkduty checks the duty status of other players.
     * /duty is only available if the department has the same permissions as the department you are on duty as.
     * /checkduty is only available if the department has the checkDuty option set to true in the config.
     * /checkduty only shows the duty status of people in the same type department as you.
     * /dutycount toggles the duty count on the screen.
     * /dutycount is only available if showOnDutyCount is set to true in the config.
*/
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

if (showDutyCountEnabled) {
     RegisterCommand('dutycount', () => {
          showDutyCount = !showDutyCount;
          emit('chat:addMessage', { color: [255, 0, 0], multiline: true, args: ['[SSRP Duty Logs] ', `^2[SUCCESS] ^7Duty count is now ${showDutyCount ? 'enabled' : 'disabled'}`] })
     })
     emit('chat:addSuggestion', '/dutycount', '[SSRP Duty Logs] Toggle the duty count.', [])
}

emit('chat:addSuggestion', '/duty', '[SSRP Duty Logs] Toggle your duty status.', [{ name: 'department', help: 'The department you are going on duty as.' }])
emit('chat:addSuggestion', '/checkduty', '[SSRP Duty Logs] Check the duty status of other players.', [])

/*
     * Registering Events
     * The blips are only shown if the department has blips enabled in the config.
     * The blips are also only shown if the department has the same blip type as the department you are on duty as.
     * OndutyLogs::getConfig::Callback is used to get the config from the server, and is used to check if the duty count is enabled.
     * OndutyLogs::CreateBlip::Client is used to create the blips.
     * OndutyLogs::RemoveBlip::Client is used to remove the blips.
     * OndutyLogs::UpdateBlips::Client is used to update the blips.
     * OndutyLogs::Callback is used to get the callback from the /duty command.
     * OndutyLogs::CheckDuty::Callback is used to get the callback from the /checkduty command.
*/

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

RegisterNetEvent('OndutyLogs::getConfig::Callback')
onNet('OndutyLogs::getConfig::Callback', (config) => {
     showDutyCountEnabled = config;
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

/*
     * Functions
     * CleanUpBlips is used to remove all blips from the blips array.
     * RefreshBlips is used to refresh the blips on the map.
     * RefreshBlips is called when the blips are first created, and when the blips are updated.
     * RefreshBlips is called when the player goes on duty, and when the player goes off duty.
     * RefreshBlips is called when the player joins the server.
     * RefreshBlips is called when the player changes the department they are on duty as.
*/

/**
 * @param {number[]} blips
 * @return {void}
 * @description Removes all blips from the blips array.
 * @example CleanUpBlips()
 */
function CleanUpBlips() {
     for (let i = 0; i < blips.length; i++) {
          let id = blips[i];
          if (id !== 0) {
               RemoveBlip(id);
               blips[i] = 0;
          }
     }
}

/**
 *
 * @param {object} activeBlips
 * @return {void}
 * @description Refreshes the blips on the map.
 * @example RefreshBlips(activeBlips)
 */
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