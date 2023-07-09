const axios = require("axios");
const { Menu, Embed, Row, Button } = require("../../../../src/structure/backend/build");
module.exports.run = async function(client, interaction, data) {
    data = data.split("-");
    switch(data[0]) {
        case "create":
            let ip = interaction.fields.get("ip")?.value;
            let port = interaction.fields.get("port")?.value;
            let server = await axios({
                method: "get",
                url: `http://${ip}:${port}/info.json`,
                headers: { "Content-Type": "application/json" }
            }).catch(function(err) {});
            if (!server?.data) return;
            let name = interaction.fields.get("name")?.value || server.data.vars.sv_projectName;
            client.db.query(`INSERT INTO servers (ip, port, guild, addedBy, name) VALUES (?, ?, ?, ?, ?);`, [ip, port, interaction.guild.id, `${interaction.user.tag}`, name], function(err, res) {
                client.db.query(`SELECT * FROM servers WHERE guild = ?;`, [interaction.guild.id], async function(err, servers) {
                    let description = "";
                    let menu = new Menu()
                        .setPlaceholder("Select a server to edit...")
                        .setMax(1)
                        .setType(3)
                        .setCustomId(`servers-edit`)
                    let data = [];
                    for (let server of servers) {
                        let name = server.name == null ? "N/A" : server.name.length <= 8 ? server.name : server.name.slice(0, 8) + "...";
                        data.push(
                            {
                                ID: server.id,
                                "Hostname / IP": server.ip,
                                Port: server.port,
                                Name: name
                            }
                        );
                        menu.addOption({
                            label: `${server.name.length <= 90 ? `ID: ${server.id} | ${server.name}` : `ID: ${server.id} | ${server.name.slice(0,87)}...`}`,
                            value: `${server.id}`
                        });
                    };
                    description = `\`\`\`ml\n${client.chart.create(data, { innerBorder: "⁞" })}\n\`\`\``;
                    let embed = new Embed()
                        .setAuthor({ name: "FiveM Servers" })
                        .setColor(client.config.color)
                        .setDescription(description);
                    let row = [
                        new Row().addComponent(
                            new Button()
                                .setCustomId(`servers-create`)
                                .setLabel("Add server")
                                .setStyle(3)
                        )
                    ];
                    if (menu) row.push(new Row().addComponent(menu));
                    interaction.update({ embeds: [embed], components: row, ephemeral: true });
                });
            });
        break;
        case "edit":
            client.db.query(`SELECT * FROM servers WHERE id = ?;`, [Number(data[1])], function(err, res) {
                let server = res[0];
                if (interaction.fields.get("name")?.value) server.name = interaction.fields.get("name").value;
                if (interaction.fields.get("ip")?.value) server.ip = interaction.fields.get("ip").value;
                if (interaction.fields.get("port")?.value) server.port = interaction.fields.get("port").value;
                if (interaction.fields.get("prefix")?.value) server.prefix = interaction.fields.get("prefix").value;
                let voice = interaction.guild.channels.cache.get(res[0].displayVoice);
                let text = interaction.guild.channels.cache.get(res[0].displayText);
                let embed = new Embed()
                    .setAuthor({ name: "FiveM Servers" })
                    .setColor(client.config.color)
                    .setDescription(`> **${server.name}**\n**IP**: \`${server.ip}\`\n**Port**: \`${server.port}\`\n**Display Voice**: ${voice ? voice : "`N/A`"}\n**Display Text**: ${text ? text : "`N/A`"}\n**Voice Prefix**: ${server.prefix ? `\`${server.prefix}\`` : "`Players Online:`"}${server.inactive ? "\n**SERVER IS MARKED INACTIVE**" : ""}\n`)
                client.db.query(`UPDATE servers SET name = ?, ip = ?, port = ?, prefix = ? WHERE id = ?;`, [
                    server.name,
                    server.ip,
                    server.port,
                    server.prefix,
                    server.id // clause
                ], function() {});
                interaction.update({ embeds: [embed] });
            });
        break;
    };
};