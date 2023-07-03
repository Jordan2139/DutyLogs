const { Embed, Row, Button, Menu } = require("../../../../src/structure/backend/build")
module.exports.run = function (client, interaction, data) {
    data = data.split("-");
    switch (data[0]) {
        case "next25":
            client.db.query(`SELECT * FROM dutylogs WHERE steam = '${steamId}' AND server = ${serverRes[0].id} AND department = '${department}' AND endtime > NOW() - INTERVAL ${timeframe} ORDER BY id DESC OFFSET ${data[2].id + 25}`, function (err, logs) {
                if (logs.length === 0) return interaction.reply({ content: "There's not more than 25 logs for that user.", ephemeral: true });
                let menu;
                menu = new Menu()
                    .setPlaceholder("📄Select a log to view...")
                    .setMax(1)
                    .setType(3)
                    .setCustomId("logmenu-select")
                for (let i = 0; i < 25; i++) {
                    if (logs[i]) {
                        const date = new Date(logs[i].endtime)
                        const optins = {
                            month: "2-digit",
                            day: "2-digit",
                            hour: "numeric",
                            minute: "numeric",
                        };
                        const formattedDate = date.toLocaleString("en-US", optins);
                        const date1 = new Date(logs[i].starttime);
                        const date2 = new Date(logs[i].endtime);
                        const diffInMilliseconds = Math.abs(date2 - date1);
                        menu.addOption({
                            label: `${formattedDate}  - ${formatDuration(diffInMilliseconds / 1000)}`,
                            value: logs[i].id
                        })
                    }
                }
                let row = [
                    new Row()
                        .addComponent(
                            new Button()
                                .setCustomId(`logmenu-prev25-${user.id}-${logs[0].id}`)
                                .setLabel("Previous 25")
                                .setStyle(3)
                                .setEmoji('◀')
                        ).addComponent(
                            new Button()
                                .setCustomId(`logmenu-next25-${user.id}-${logs[0].id}`)
                                .setLabel("Next 25")
                                .setStyle(3)
                                .setEmoji('▶')
                        )
                ];
                if (menu) row.push(new Row().addComponent(menu));
                interaction.reply({ embeds: [embed], components: row });
            });
            break;
        case "prev25":
            break;
        case "back":
            
            break;
    };
};