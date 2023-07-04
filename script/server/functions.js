/*
     * This is the main client script for the Duty Logs resource.
     * This script handles the client-side commands and blips.
*/

/*
    * Variables
    * axios is used to make requests to the DutyLogs API.
    * ondutyPlayers is used to store the players that are on duty.
    * activeBlips is used to store the blips that are created.
    * activeBlips is used to remove the blips when the player goes off duty.
    * activeBlips is used to update the blips when the player changes the department they are on duty as.
    * obj is used to store the object that is used to stringify the axios response.
*/
const axios = require('axios')
axios.defaults.timeout = 30000;
axios.defaults.httpsAgent = new https.Agent({ keepAlive: true });
const config = require('./config.js');
let ondutyPlayers = [];
activeBlips = [];
const obj = { foo: 'bar' };
obj.circularRef = obj; // Adding circular reference


/*
    * Events
    * OndutyLogs::OnDuty is triggered when a player goes on duty.
    * OndutyLogs::OffDuty is triggered when a player goes off duty.
    * playerConnecting is triggered when a player connects to the server.
    * playerDropped is triggered when a player disconnects from the server.
    * OndutyLogs::CheckDuty is triggered when a player uses the /checkduty command.
*/
RegisterNetEvent('OndutyLogs::OnDuty')
on('OndutyLogs::OnDuty', async (department) => {
    const playerId = source
    logDebug('OnDuty event triggered by client id: ' + source + ' (' + GetPlayerName(source) + ')')
    department = department.toUpperCase()
    let hasPermission = false
    if (config.departments.hasOwnProperty(department)) {
        const departmentData = config.departments[department]
        if (departmentData.permissions.mode == 'ace') {
            for (let i = 0; i < departmentData.permissions.allowedIdentifiers.length; i++) {
                const identifier = departmentData.permissions.allowedIdentifiers[i];
                if (IsPlayerAceAllowed(source, identifier)) {
                    hasPermission = true
                    break
                }
            }
        } else if (departmentData.permissions.mode == 'discord') {
            for (let i = 0; i < departmentData.permissions.allowedIdentifiers.length; i++) {
                const identifier = departmentData.permissions.allowedIdentifiers[i];
                const ids = ExtractIdentifiers(source);
                const discordID = ids.discord.replace(/discord:/gi, "")
                if (discordID) {
                    let permissionCheckRes = await axios({
                        method: 'get',
                        url: `http://${config.api.dutylogsbotip}:${config.api.dutylogsbotport}/getdiscordroles`,
                        headers: {
                            Accept: 'application/json, text/plain, */*',
                            'User-Agent': '*',
                            'authorization': config.api.secretkey,
                        },
                        params: {
                            discordID: discordID
                        }
                    }).catch((error) => {
                        if (error.code === 'ECONNABORTED' || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
                            logError('Connection to DutyLogs API timed out.')
                            emitNet('OndutyLogs::Callback', playerId, { duty: false, department: null }, 'Connection to DutyLogs API timed out.')
                        } else {
                            logError('Error connecting to DutyLogs API: ' + error)
                            emitNet('OndutyLogs::Callback', playerId, { duty: false, department: null }, 'Error connecting to DutyLogs API: ' + error)
                        }
                    });
                    if (permissionCheckRes && permissionCheckRes.data && permissionCheckRes.data.roles) {
                        const roles = permissionCheckRes.data.roles
                        for (let i = 0; i < roles.length; i++) {
                            const role = roles[i];
                            if (role.id == identifier) {
                                hasPermission = true
                                break
                            }
                        }
                    }
                } else {
                    logError('Discord ID not found for client id: ' + source + ' (' + GetPlayerName(source) + ')')
                }
            }
        } else if (departmentData.permissions.mode == 'everyone') {
            hasPermission = true
        }
        if (hasPermission) {
            logDebug('Client id: ' + source + ' (' + GetPlayerName(source) + ') has permission to go on duty as department: ' + department)
            const ids = ExtractIdentifiers(source);
            const steamHex = ids.steam.replace(/steam:/gi, "")
            const discordID = ids.discord.replace(/discord:/gi, "")
            let checkres = await axios({
                method: 'post',
                url: `http://${config.api.dutylogsbotip}:${config.api.dutylogsbotport}/onduty`,
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'User-Agent': '*',
                    'authorization': config.api.secretkey,
                },
                params: {
                    player: GetPlayerName(source),
                    steam: steamHex,
                    discord: discordID ? discordID : 'Not Linked',
                    playerID: source,
                    status: true,
                    department: department
                }
            }).catch((error) => {
                if (error.code === 'ECONNABORTED' || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
                    logError('Connection to DutyLogs API timed out.')
                    emitNet('OndutyLogs::Callback', playerId, { duty: false, department: null }, 'Connection to DutyLogs API timed out.')
                } else {
                    logError('Error connecting to DutyLogs API: ' + error)
                    emitNet('OndutyLogs::Callback', playerId, { duty: false, department: null }, 'Error connecting to DutyLogs API: ' + error)
                }
                return;
            });
            if (checkres) {
                checkres = customStringify(checkres)
                logDebug('checkres: ' + JSON.stringify(checkres))
                department = { name: config.departments[department].properName, abbr: department, blips: config.departments[department].blips }
                emitNet('OndutyLogs::Callback', playerId, { duty: true, department: department }, null)
                if (department.blips.enabled) {
                    ondutyPlayers.push({ id: playerId, department: department.abbr })
                    logDebug('Client id: ' + playerId + ' (' + GetPlayerName(playerId) + ') has been added to the ondutyPlayers array.')
                    activeBlips.push({ id: playerId, blips: department.blips, playerName: GetPlayerName(playerId) })
                    logDebug('Client id: ' + playerId + ' (' + GetPlayerName(playerId) + ') has been added to the activeBlips array.')
                    emitNet('OndutyLogs::CreateBlip::Client', playerId, department.blips)
                }
            }
        } else {
            emitNet('OndutyLogs::Callback', playerId, { duty: false, department: null }, 'You do not have permission to go on duty as this department.')
            logDebug('Client id: ' + playerId + ' (' + GetPlayerName(playerId) + ') does not have permission to go on duty as department: ' + department)
        }
    } else {
        const departmentKeys = Object.keys(config.departments);
        emitNet('OndutyLogs::Callback', playerId, { duty: false, department: null }, 'You specified an invalid department.\nValid departments: ' + departmentKeys.join(', '))
        logDebug('Client id: ' + playerId + ' (' + GetPlayerName(playerId) + ') specified an invalid department: ' + department)
    }
})

RegisterNetEvent('OndutyLogs::OffDuty')
on('OndutyLogs::OffDuty', async (department) => {
    const playerId = source
    department = department.toUpperCase()
    logDebug('OffDuty event triggered by client id: ' + source + ' (' + GetPlayerName(source) + ')')
    const ids = ExtractIdentifiers(source);
    const steamHex = ids.steam.replace(/steam:/gi, "")
    const discordID = ids.discord.replace(/discord:/gi, "")
    let checkres = await axios({
        method: 'post',
        url: `http://${config.api.dutylogsbotip}:${config.api.dutylogsbotport}/offduty`,
        headers: {
            Accept: 'application/json, text/plain, */*',
            'User-Agent': '*',
            'authorization': config.api.secretkey,
        },
        params: {
            player: GetPlayerName(source),
            steam: steamHex,
            discord: discordID ? discordID : 'Not Linked',
            playerID: source,
            status: false,
            department: department
        }
    }).catch((error) => {
        if (error.code === 'ECONNABORTED' || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
            logError('Connection to DutyLogs API timed out.')
            emitNet('OndutyLogs::Callback', playerId, { duty: false, department: null }, 'Connection to DutyLogs API timed out.')
        } else {
            logError('Error connecting to DutyLogs API: ' + error)
            emitNet('OndutyLogs::Callback', playerId, { duty: false, department: null }, 'Error connecting to DutyLogs API: ' + error)
        }
        return;
    });
    if (checkres) {
        checkres = customStringify(checkres)
        logDebug('checkres: ' + JSON.stringify(checkres))
        department = { name: config.departments[department].properName, abbr: department, blips: config.departments[department].blips }
        emitNet('OndutyLogs::Callback', playerId, { duty: false, department: department }, null)
        if (department.blips.enabled) {
            ondutyPlayers = ondutyPlayers.filter(player => player.id !== playerId);
            logDebug('Client id: ' + playerId + ' (' + GetPlayerName(playerId) + ') has been removed from the ondutyPlayers array because they went off duty.')
            activeBlips = activeBlips.filter(player => player.id !== playerId);
            logDebug('Client id: ' + playerId + ' (' + GetPlayerName(playerId) + ') has been removed from the activeBlips array because they went off duty.')
            emitNet('OndutyLogs::RemoveBlip::Client', playerId)
        }
    }
})

on('playerConnecting', (name, setKickReason, deferrals) => {
    const src = source;
    const ids = ExtractIdentifiers(src);
    const steamHex = ids.steam?.replace(/steam:/gi, "") || null;
    const discordId = ids.discord?.replace(/discord:/gi, "") || null;
    const licensePlayer = ids.license?.replace(/license:/gi, "") || null;
    const xblPlayer = ids.xbl?.replace(/xbl:/gi, "") || null;
    const livePlayer = ids.live?.replace(/live:/gi, "") || null;
    const fivemPlayer = ids.fivem?.replace(/fivem:/gi, "") || null;
    const license2Player = ids?.license?.replace(/license2:/gi, "") || null;
    let playerObj = {
        identifiers: [
            'steam:' + steamHex,
            'discord:' + discordId,
            'license:' + licensePlayer,
            'xbl:' + xblPlayer,
            'live:' + livePlayer,
            'fivem:' + fivemPlayer,
            'license2:' + license2Player
        ]
    };

    let checkres = axios({
        method: 'post',
        url: `http://${config.api.dutylogsbotip}:${config.api.dutylogsbotport}/playerconnect`,
        headers: {
            Accept: 'application/json, text/plain, */*',
            'User-Agent': '*',
            'authorization': config.api.secretkey,
        },
        params: {
            player: playerObj
        }
    }).catch((error) => {
        if (error.code === 'ECONNABORTED' || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
            logError('Connection to DutyLogs API timed out.')
        } else {
            logError('Error connecting to DutyLogs API: ' + error)
        }
        return;
    });
    if (checkres) {
        checkres = customStringify(checkres)
        logDebug('checkres: ' + JSON.stringify(checkres))
    }
    emitNet('OndutyLogs::getConfig::Client', src, config.showOnDutyCount)
})

on('playerDropped', async (reason) => {
    const player = ondutyPlayers.find(player => player.id === source);
    if (player) {
        let department = player.department.toUpperCase()
        logDebug('OffDuty event triggered by client id: ' + source + ' (' + GetPlayerName(source) + ')')
        const ids = ExtractIdentifiers(source);
        const steamHex = ids.steam.replace(/steam:/gi, "")
        const discordID = ids.discord.replace(/discord:/gi, "")
        let checkres = await axios({
            method: 'post',
            url: `http://${config.api.dutylogsbotip}:${config.api.dutylogsbotport}/offduty`,
            headers: {
                Accept: 'application/json, text/plain, */*',
                'User-Agent': '*',
                'authorization': config.api.secretkey,
            },
            params: {
                player: GetPlayerName(source),
                steam: steamHex,
                discord: discordID ? discordID : 'Not Linked',
                playerID: source,
                status: false,
                department: department
            }
        }).catch((error) => {
            if (error.code === 'ECONNABORTED' || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
                logError('Connection to DutyLogs API timed out.')
                emitNet('OndutyLogs::Callback', playerId, { duty: false, department: null }, 'Connection to DutyLogs API timed out.')
            } else {
                logError('Error connecting to DutyLogs API: ' + error)
                emitNet('OndutyLogs::Callback', playerId, { duty: false, department: null }, 'Error connecting to DutyLogs API: ' + error)
            }
            return;
        });
        if (checkres) {
            checkres = customStringify(checkres)
            logDebug('checkres: ' + JSON.stringify(checkres))
            ondutyPlayers = ondutyPlayers.filter(player => player.id !== source);
            logDebug('Client id: ' + source + ' (' + GetPlayerName(source) + ') has been removed from the ondutyPlayers array because they left the server.')
            activeBlips = activeBlips.filter(player => player.id !== source);
            logDebug('Client id: ' + source + ' (' + GetPlayerName(source) + ') has been removed from the activeBlips array because they left the server.')
        }
    }
})

RegisterNetEvent('OndutyLogs::CheckDuty')
onNet('OndutyLogs::CheckDuty', async (department) => {
    department.abbr = department.abbr.toUpperCase()
    if (!config.departments[department.abbr].permissions.checkDuty) return;
    emitNet('OndutyLogs::CheckDuty::Callback', source, activeBlips.filter(person => person.blips.type === department.blips.type))
})

/*
    * Threads (Ticks)
    * This thread is used to update the blips every 500ms.
    * This thread is used to update the ondutyPlayers array every 500ms.
*/
setTick(async function () {
    while (true) {
        for (let i = 0; i < activeBlips.length; i++) {
            activeBlips[i].coords = GetEntityCoords(GetPlayerPed(activeBlips[i].id))
        }
        emitNet('OndutyLogs::UpdateBlips::Client', -1, activeBlips)
        await Wait(500)
    }
})

/*
    * Functions
    * ExtractIdentifiers is used to extract the identifiers from a player.
    * logDebug is used to log debug messages to the console.
    * logError is used to log error messages to the console.
    * customStringify is used to stringify an object without circular references.
    * Wait is used to wait for a specified amount of time.
*/

/**
 *
 * @param {user} src
 * @returns {identifiers}
 */
function ExtractIdentifiers(src) {
    const identifiers = {
        steam: "",
        ip: "",
        discord: "",
        license: "",
        xbl: "",
        live: ""
    }
    for (let i = 0; i < GetNumPlayerIdentifiers(src); i++) {
        const id = GetPlayerIdentifier(src, i)
        if (id.includes("steam")) {
            identifiers.steam = id
        } else if (id.includes("ip")) {
            identifiers.ip = id
        } else if (id.includes("discord")) {
            identifiers.discord = id
        } else if (id.includes("license")) {
            identifiers.license = id
        } else if (id.includes("xbl")) {
            identifiers.xbl = id
        } else if (id.includes("live")) {
            identifiers.live = id
        }
    }
    logDebug('Extracted identifiers for client id: ' + src + ' (' + GetPlayerName(src) + '): ' + JSON.stringify(identifiers))
    return identifiers
}

/**
 *
 * @param {string} message
 * @description Log debug messages to the console.
 * @example
 * logDebug('This is a debug message.')
 * // [DEBUG] This is a debug message.
 */
function logDebug(message) {
    if (config.debugMode) {
        console.log(`[DEBUG] ${message}`)
    }
}

/**
 *
 * @param {string} message
 * @description Log error messages to the console.
 * @example
 * logError('This is an error message.')
 * // [ERROR] This is an error message.
 */
function logError(message) {
    console.log(`[ERROR] ${message}`)
}

/**
 * @param {object} obj
 * @returns {string}
 * @description Stringify an object without circular references.
 * @example
 * const obj = { foo: 'bar' };
 * obj.circularRef = obj; // Adding circular reference
 * console.log(customStringify(obj));
 * // {"foo":"bar","circularRef":"[Circular Reference]"}
 */
function customStringify(obj) {
    const seen = new WeakSet(); // Keep track of visited objects
    return JSON.stringify(obj, function (key, value) {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular Reference]';
            }
            seen.add(value);
        }
        return value;
    });
}

/**
 * @param {number} ms
 * @description Wait for a specified amount of time.
 * @example
 * await Wait(5000)
 * // Waits 5 seconds
 * console.log('5 seconds have passed.')
 * // 5 seconds have passed.
 * @returns {Promise}
 * @example
 * Wait(5000).then(() => {
 *     console.log('5 seconds have passed.')
 *    // 5 seconds have passed.
 * })
 */
function Wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
