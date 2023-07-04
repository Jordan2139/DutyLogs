const { Embed, Row, Button, Menu } = require("../../../../src/structure/backend/build")
module.exports.run = function (client, interaction, data) {
    data = data.split("-");
    if (data[1] !== interaction.member.id) return interaction.reply({ content: "You cannot use this menu.", ephemeral: true });
    if (data[0] && !client.cache[interaction.member.id]) return interaction.reply({ content: "It looks like the checklogs process has timed out. Please rerun the /checklogs command to start again.", ephemeral: true });
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
        case "prev25": client.db.query(`SELECT * FROM dutylogs WHERE steam = '${steamId}' AND server = ${serverRes[0].id} AND department = '${department}' AND endtime > NOW() - INTERVAL ${timeframe} ORDER BY id DESC OFFSET ${data[2].id - 25}`, function (err, logs) {
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
        case "goback":
            department = client.cache[interaction.member.id].department.toLowerCase()
            const user = client.cache[interaction.member.id].user;
            const timeframe = client.cache[interaction.member.id].timeframe;
            const userRoles = interaction.member.roles.cache.map(role => role.id);
            if (!userRoles.some(roleId => client.config.departments[department.toUpperCase()].allowedRoles.includes(roleId))) return interaction.reply({ content: "You do not have permission to use this command.", ephemeral: true })
            client.db.query(`SELECT * from players WHERE discord = ?`, [user.id], async function (err, userRes) {
                steamId = userRes[0].steam;
                if (!steamId) return interaction.reply({ content: "That user is not linked to a steam account.", ephemeral: true });
                client.db.query(`SELECT * FROM servers WHERE guild = ?`, [interaction.guild.id], async function (err, serverRes) {
                    if (!serverRes[0]) return interaction.reply({ content: "This server is not configured in the database. Please contact an administrator.", ephemeral: true });
                    client.db.query(`SELECT SUM(TIME_TO_SEC(TIMEDIFF(endtime, starttime))) AS total_time FROM dutylogs WHERE steam = ? AND server = ? AND department = ? AND starttime >= DATE_SUB(NOW(), INTERVAL ${timeframe}) AND endtime <= NOW()`, [steamId, serverRes[0].id, department], async function (err, totalTimeRes) {
                        if (totalTimeRes[0].total_time == null) return interaction.reply({ content: "No logs found for that user in that department.", ephemeral: true })
                        const embed = new Embed()
                            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
                            .setDescription(`## ${user}'s Duty Logs\n### Showing logs for ${timeframe} in ${client.config.departments[department.toUpperCase()].name}\n\n### Total time on duty in ${timeframe}: \`${formatDuration(totalTimeRes[0].total_time)}\`\n\n### Logs:`)
                            .setColor(client.config.color)
                            .setTimestamp();
                        client.db.query(`SELECT * FROM dutylogs WHERE steam = '${steamId}' AND server = ${serverRes[0].id} AND department = '${department}' AND endtime > NOW() - INTERVAL ${timeframe} ORDER BY id DESC`, function (err, logs) {
                            if (logs.length === 0) return interaction.reply({ content: "No logs found for that user in that department.", ephemeral: true });
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
                            let prevButton = new Button()
                                .setCustomId(`logmenu-prev25-${user.id}-${logs[0].id}`)
                                .setLabel("Previous 25")
                                .setStyle(3)
                                .setEmoji('◀')
                            let nextButton = new Button()
                                .setCustomId(`logmenu-next25-${user.id}-${logs[0].id}`)
                                .setLabel("Next 25")
                                .setStyle(3)
                                .setEmoji('▶')
                            let row = [];
                            if (menu) row.push(new Row().addComponent(menu));
                            if (logs.length > 25) row.push(new Row().addComponent(prevButton).addComponent(nextButton));
                            interaction.update({ embeds: [embed], components: row });
                        });
                    });
                });
                delete client.cache[interaction.member.id];
                client.cache[interaction.member.id] = {
                    user: user,
                    department: department,
                    timeframe: timeframe
                };
            });
            break;
    };
};

function formatDuration(durationInSeconds) {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = durationInSeconds % 60;
    return `${hours.toLocaleString('en-US', { minimumIntegerDigits: 2 })} hours, ${minutes.toLocaleString('en-US', { minimumIntegerDigits: 2 })} minutes, ${seconds.toLocaleString('en-US', { minimumIntegerDigits: 2 })} seconds`;
}
