const { Embed, Row, Button } = require("../structure/backend/build");
module.exports = async(client) => {
    await require("../structure/client/updatemanager")(client);
    for (let module of client.modules) {
        try { require(`../../modules/${module}/src/index`)(client); } catch {};
    };
    if (!client.application) await client.application.fetch();
    if (client.user.id == "1107502492696203364") {
        let guild = client.guilds.cache.get("1045039438989905981")
        client.commands.forEach(async function(command) {
            if (!command?.info?.name) return;
            guild.commands.create(command.info).then(cmd => {});
        });
    } else {
        client.commands.forEach(async function(command) {
            if (!command?.info?.name) return;
            client.application.commands.create(command.info).then(cmd => {});
        });
    };
    status(client);
    client.emit("serverLoop");
    client.emit("playerCountLoop")
};

let i = 0;
function status(client) {
    switch(i) {
        case 0:
            client.db.query(`SELECT COUNT(*) FROM servers;`, function(err, res) {
                client.user.setPresence({
                    activities: [{
                        name: `${res[0]["COUNT(*)"].toLocaleString("en-US")} servers`,
                        type: 0,
                    }],
                    status: 'online'
                });
                i = 1;
            });
        break;
        case 1:
            client.user.setPresence({
                activities: [{
                    name: `${client.users.cache.size.toLocaleString("en-US")} users`,
                    type: 3,
                }],
                status: 'online'
            });
            i = 2;
        break;
        case 2:
            client.user.setPresence({
                activities: [{
                    name: `${client.guilds.cache.size.toLocaleString("en-US")} guilds`,
                    type: 3,
                }],
                status: 'online'
            });
            i = 0;
        break;
    };
    setTimeout(() => status(client), 180000);
};