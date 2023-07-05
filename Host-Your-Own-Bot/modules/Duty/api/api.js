/*
    This file handles all API requests coming from the FiveM Script counterpart
    This file is not meant to be edited unless you know what you are doing
*/

/*
    Variables
    express is used to create the API
    session is used to create a session for the API
    bodyParser is used to parse the body of the request
    cookieParser is used to parse the cookies of the request
    multer is used to parse the files of the request
    app is used to create the API
    config is used to get the config
    utils is used to create the table for the logs
    chalk is used to color the console
    Embed is used to create the embeds
*/
const express = require("express");
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const app = express();
const config = require('../../../config/config.json');
const { utils } = require("string-table");
const chalk = require("chalk");
const { Embed } = require("../../../src/structure/backend/build");

module.exports = function (client) {
    /*
        This is the main function of the API
        This function is used to create the API and start it
    */
    var multerStorage = multer.memoryStorage()
    app.use(multer({ storage: multerStorage }).any());
    app.use(express.static('public'));
    app.use(bodyParser.urlencoded({ extended: false }))
    app.set('view engine', 'ejs');
    app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 253402300000000 },
    }));
    app.use(cookieParser());
    const server = app.listen(config.api.port, config.api.listenAddress, function () {
        const { address, port } = server.address();
        console.log(chalk.bold.green("[ SUCCESS ]") + `: API Online under address: http://${address}:${port}`);
    });

    /*
        * This is the handling for the /onduty endpoint
        * This endpoint is used to set a player to on duty
        * This endpoint requires a secret key to be used
        * This endpoint requires the following query parameters:
        * player: The player's name
        * steam: The player's steam name
        * discord: The player's discord ID
        * status: The status of the player (true/false)
        * department: The department the player is going on duty as
        * This endpoint returns a message saying the request was received
        * This endpoint also logs the request to the console
        * This endpoint also logs the request to the database
        * This endpoint also sends a message to the log channel
        * This endpoint also sends a message to the duty logs channel
    */
    app.post(`/onduty`, function (req, res) {
        const serverIp = req.ip
        const player = req.query.player
        const steam = req.query.steam
        const discordID = req.query.discord
        const status = req.query.status
        const department = req.query.department
        if (req.headers.authorization !== config.api.secretkey) {
            console.log(`A request was made using an Invalid Secret Auth Key`)
            return res.send(`A request was made using an Invalid Secret Auth Key`)
        } else {
            res.send(`Request Received`)
            console.log(`Request Received`)
            if (status) {
                client.db.query(`SELECT * FROM servers WHERE ip = ?;`, [serverIp], async function (err, res) {
                    if (err) return console.log(err);
                    if (!res?.length) return console.log(`No server found with IP: ${serverIp}`);
                    const server = res[0];
                    client.db.query(`SELECT * FROM logchannels WHERE guild = ? AND type = ?;`, [server.guild, department.toUpperCase()], async function (err, res) {
                        if (err) return console.log(err);
                        if (!res?.length) return console.log(`No log channel found for ${department} in ${server.guild}`);
                        const logChannel = client.channels.cache.get(res[0].channelid);
                        const embed = new Embed()
                            .setColor(client.config.color)
                            .setDescription(`## ${player} is now **ON** duty as ${client.config.departments[department.toUpperCase()].name}\n## __**Player Information**__\n**Server ID**: \`${req.query.playerID}\`\n**Steam Name**: ${steam}\n**Discord ID**: ${discordID} (<@${discordID}>)\n## __**Server Information**__\n**Server Name**: ${server.name}\n**Server ID**: \`${server.id}\``)
                            .setFooter({ text: `Developed by: Jordan2139.` })
                        logChannel.send({ embeds: [embed] })
                    })
                    const dutyLog = {
                        steam: steam,
                        guild: server.guild,
                        server: server.id,
                        onduty: true,
                        starttime: new Date(),
                        endtime: null,
                        department: department.toLocaleLowerCase()
                    };
                    client.db.query(`INSERT INTO dutylogs SET ?`, dutyLog, function (err, res) {
                        if (err) return console.log(err);
                    });
                    const sessionLog = {
                        steam: steam,
                        server: server.id,
                    };

                    client.db.query(`INSERT INTO sessions SET?`, sessionLog, function (err, res) {
                        if (err) return console.log(err);
                    });
                })
                console.log(`Player ${player} is now on duty in ${department}`)
            } else {
                console.log(`Ignoring request to set ${player} to on duty`)
            }
        }
    });

    /*
        * This is the handling for the /offduty endpoint
        * This endpoint is used to set a player to off duty
        * This endpoint requires a secret key to be used
        * This endpoint requires the following query parameters:
        * player: The player's name
        * steam: The player's steam name
        * discord: The player's discord ID
        * status: The status of the player (true/false)
        * department: The department the player is going off duty as
        * This endpoint returns a message saying the request was received
        * This endpoint also logs the request to the console
        * This endpoint also logs the request to the database
        * This endpoint also sends a message to the log channel
        * This endpoint also sends a message to the duty logs channel
    */

    app.post(`/offduty`, function (req, res) {
        const serverIp = req.ip
        const player = req.query.player
        const steam = req.query.steam
        const discordID = req.query.discord
        const status = req.query.status
        const department = req.query.department
        if (req.headers.authorization !== config.api.secretkey) {
            console.log(`A request was made using an Invalid Secret Auth Key`)
            return res.send(`A request was made using an Invalid Secret Auth Key`)
        } else {
            res.send(`Request Received`)
            console.log(`Request Received`)
            if (status) {
                client.db.query(`SELECT * FROM servers WHERE ip = ?;`, [serverIp], async function (err, res) {
                    if (err) return console.log(err);
                    if (!res?.length) return console.log(`No server found with IP: ${serverIp}`);
                    const server = res[0];
                    client.db.query(`SELECT * FROM logchannels WHERE guild = ? AND type = ?;`, [server.guild, department.toUpperCase()], async function (err, res2) {
                        if (err) return console.log(err);
                        if (!res2?.length) return console.log(`No log channel found for ${department} in ${server.guild}`);
                        client.db.query(`UPDATE dutylogs SET endtime = ?,  onduty = 0 WHERE steam = ? AND onduty = 1 AND endtime IS NULL AND id = (SELECT id FROM (SELECT id FROM dutylogs WHERE steam = ? ORDER BY starttime DESC LIMIT 1) AS subquery)`, [new Date(), steam, steam], function (err, _) { });
                        client.db.query(`SELECT SUM(TIME_TO_SEC(TIMEDIFF(endtime, starttime))) AS total_time FROM dutylogs WHERE steam = ? AND server = ? AND starttime >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND endtime <= NOW()`, [steam, server.id], function (err, res1) {
                            client.db.query(`SELECT TIME_TO_SEC(TIMEDIFF(NOW(), starttime)) AS total_time FROM dutylogs WHERE steam = ? AND server = ? AND department = ? ORDER BY starttime DESC LIMIT 1`, [steam, server.id, department.toLocaleLowerCase()], function (err, res3) {
                                const logChannel = client.channels.cache.get(res2[0].channelid);
                                const embed = new Embed()
                                    .setColor(client.config.color)
                                    .setDescription(`## ${player} is now **OFF** duty as ${client.config.departments[department.toUpperCase()].name}\n## __**Player Information**__\n**Server ID**: \`${req.query.playerID}\`\n**Steam Name**: ${steam}\n**Discord ID**: ${discordID} (<@${discordID}>)\n## __**Server Information**__\n**Server Name**: ${server.name}\n**Server ID**: \`${server.id}\`\n## __**Duty Information**__\n**Time Spent On Duty**: ${formatDuration(res3[0].total_time)} \n**Duty Time In The Last 7 Days**: ${formatDuration(res1[0].total_time)}`)
                                    .setFooter({ text: `Developed by: Jordan2139.` })
                                logChannel.send({ embeds: [embed] })
                            })
                        })
                    })
                })
                console.log(`Player ${player} is now off duty in ${department}`)
            } else {
                console.log(`Ignoring request to set ${player} to off duty`)
            }
        }
    });

    /*
        * This is the handling for the /playerconnect endpoint
        * This endpoint is used to log a player connecting to the server
        * This endpoint requires a secret key to be used
        * This endpoint requires the following query parameters:
        * player: The player's name
        * identifiers: The player's identifiers
        * This endpoint returns a message saying the request was received
        * This endpoint also logs the request to the console
        * This endpoint also logs the request to the database
    */
    app.post('/playerconnect', function (req, res) {
        const serverIp = req.ip
        const player = JSON.parse(req.query.player)
        client.logger(`${JSON.stringify(player)} connected to ${serverIp}`, "DEBUG")
        if (req.headers.authorization !== config.api.secretkey) {
            console.log(`A request was made using an Invalid Secret Auth Key`)
            return res.send(`A request was made using an Invalid Secret Auth Key`)
        } else {
            res.send(`Request Received`)
            console.log(`Request Received`)
            client.db.query(`SELECT * FROM servers WHERE ip = ?;`, [serverIp], async function (err, serverres) {
                let server = serverres[0];
                let identifiers = {};
                let idNames = [];
                for (let data of player.identifiers) {
                    data = data.split(':');
                    idNames.push(`${data[0]} = '${data[1]}'`);
                    identifiers[data[0]] = data[1];
                };
                console.log(idNames.join(" OR "))
                client.db.query(`SELECT steam, license, license2, xbl, live, discord, fivem FROM players WHERE server = ${server.id} AND (${idNames.join(" OR ")});`, function (err, foundPlayer) {
                    client.logger(`Found Player: ${JSON.stringify(foundPlayer)}`, "DEBUG")
                    if (!foundPlayer?.length) {
                        client.db.query(`INSERT INTO players (steam, license, license2, xbl, live, discord, fivem, guild, server) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`, [identifiers?.steam || null, identifiers?.license || null, identifiers?.license2 || null, identifiers?.xbl || null, identifiers?.live || null, identifiers?.discord || null, identifiers?.fivem || null, server.guild, server.id], function () {
                        });
                    } else if (foundPlayer?.length == 1) {
                        let samePerson = compareObjs([foundPlayer[0], identifiers]);
                        if (samePerson == true) {
                            client.db.query(`INSERT INTO players (steam, license, license2, xbl, live, discord, fivem, guild) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`, [identifiers?.steam || null, identifiers?.license || null, identifiers?.license2 || null, identifiers?.xbl || null, identifiers?.live || null, identifiers?.discord || null, identifiers?.fivem || null, server.guild], function () { });
                        } else {
                            for (let key in foundPlayer[0]) {
                                if (foundPlayer[0[key] == null && identifiers[key] !== null]) {
                                    client.db.query(`UPDATE players SET ${key} = ? WHERE id = ?;`, [identifiers[key], foundPlayer[0].id], function () { });
                                }
                            }
                        }
                    } else {
                        console.log(`Multiple players found with the same identifiers`)
                        let accounts = [];
                        for (let account of foundPlayer) {
                            let altAccount = compareObjs([account, identifiers]);
                            accounts.push(altAccount);
                        };
                        if (accounts.includes(false)) {
                            foundPlayer.push(identifiers);
                            client.db.query(`INSERT INTO players (steam, license, license2, xbl, live, discord, fivem, guild) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`, [identifiers?.steam || null, identifiers?.license || null, identifiers?.license2 || null, identifiers?.xbl || null, identifiers?.live || null, identifiers?.discord || null, identifiers?.fivem || null, server.guild], function () { });
                        }
                    }
                });
            });
        }
    })
}


/**
 *
 * @param {number} durationInSeconds
 * @returns {string}
 * @description Formats a duration in seconds to a human readable format
 * @example formatDuration(3600) // 01 hours, 00 minutes, 00 seconds
 */
function formatDuration(durationInSeconds) {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = durationInSeconds % 60;

    return `${hours.toLocaleString('en-US', { minimumIntegerDigits: 2 })} hours, ${minutes.toLocaleString('en-US', { minimumIntegerDigits: 2 })} minutes, ${seconds.toLocaleString('en-US', { minimumIntegerDigits: 2 })} seconds`;
}

/**
 *
 * @param {object} object
 * @returns {boolean}
 * @description Compares two objects and returns true if they are different
 * @example compareObjs({name: 'Jordan'}, {name: 'Jordan'}) // false
 * @example compareObjs({name: 'Jordan'}, {name: 'Jordan', age: 19}) // true
 */
function compareObjs(object) {
    if (object.length < 2) {
        return false;
    };
    const firstObj = object[0];
    for (let i = 1; i < object.length; i++) {
        const obj = object[i];
        for (let key in firstObj) {
            if (!firstObj[key] || !obj[key] || key == 'id') continue;
            if (firstObj[key] !== obj[key]) return true
        };
    };
    return false;
}