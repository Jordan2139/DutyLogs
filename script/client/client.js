let onduty = false;
let department = null;
RegisterCommand('duty', (_, args) => {
     if (!args[0]) return emit('chat:addMessage', { color: [255, 0, 0], multiline: true, args: ['[SSRP Duty Logs] ', '^1[ERROR] ^7You must specify a department.'] })
     if (onduty && department === args[0].toUpperCase()) {
          emitNet('OndutyLogs::OffDuty', args[0])
     } else if (!onduty) {
          emitNet('OndutyLogs::OnDuty', args[0])
     } else if (onduty && department !== args[0].toUpperCase()) {
          emit('chat:addMessage', { color: [255, 0, 0], multiline: true, args: ['[SSRP Duty Logs] ', `^1[ERROR] ^7You are already on duty as ${department}, you must go off duty as that first, then you may go on duty as ${args[0]}.`] })
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