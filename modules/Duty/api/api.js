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

function formatDuration(durationInSeconds) {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = durationInSeconds % 60;

    return `${hours.toLocaleString('en-US', { minimumIntegerDigits: 2 })} hours, ${minutes.toLocaleString('en-US', { minimumIntegerDigits: 2 })} minutes, ${seconds.toLocaleString('en-US', { minimumIntegerDigits: 2 })} seconds`;
}

function calculateTotalTimeOnDuty(dutyLogs) {
    let totalTime = 0; // Total time on duty in seconds
    let onDutyStartTime = null;

    for (let i = 0; i < dutyLogs.length; i++) {
        const log = dutyLogs[i];

        if (log.starttime && !log.endtime) {
            // On-duty log
            onDutyStartTime = new Date(log.starttime);
        } else if (!log.starttime && log.endtime && onDutyStartTime) {
            // Off-duty log
            const offDutyEndTime = log.endtime !== 'null' ? new Date(log.endtime) : new Date(); // Current time if endtime is null
            const timeDiff = Math.floor((offDutyEndTime - onDutyStartTime) / 1000); // Convert milliseconds to seconds
            totalTime += timeDiff;
            onDutyStartTime = null; // Reset on-duty start time
        }
    }

    return totalTime;
}


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