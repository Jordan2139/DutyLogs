const { Embed, Menu, Row, Button } = require("../../../../src/structure/backend/build");

module.exports.run = function(client, interaction) {
    client.db.query(`SELECT * FROM servers WHERE guild = ?;`, [interaction.guild.id], async function(err, servers) {
        let embed = new Embed()
            .setAuthor({ name: "FiveM Servers" })
            .setColor(client.config.color)
        let description = "";
        let menu;
        if (servers?.length) {
            let data = [];
            menu = new Menu()
                .setPlaceholder("Select a server to edit...")
                .setMax(1)
                .setType(3)
                .setCustomId(`servers-edit`)
            for (let server of servers) {
                let voice = interaction.guild.channels.cache.get(server.displayVoice);
                let text = interaction.guild.channels.cache.get(server.displayText);
                let name = server.name == null ? "N/A" : server.name.length <= 8 ? server.name : server.name.slice(0, 8) + "...";
                data.push(
                    {
                        ID: server.id,
                        "Hostname / IP": server.ip,
                        Port: server.port,
                        Voice: voice?.name || "N/A",
                        Text: text?.name || "N/A",
                        Name: name
                    }
                );
                menu.addOption({
                    label: `${server.name.length <= 90 ? `ID: ${server.id} | ${server.name}` : `ID: ${server.id} | ${server.name.slice(0,87)}...`}`,
                    value: `${server.id}`
                });
            };
            description = `\`\`\`ml\n${client.chart.create(data, { innerBorder: "⁞" })}\n\`\`\``;
        } else description = "No servers found.";
        embed.setDescription(description);
        let row = [
            new Row().addComponent(
                new Button()
                    .setCustomId(`servers-create`)
                    .setLabel("Add server")
                    .setStyle(3)
            )
        ];
        if (menu) row.push(new Row().addComponent(menu));
        interaction.reply({ embeds: [embed], components: row, ephemeral: true });
    });
};

module.exports.info = {
    perm: "ManageGuild"
};