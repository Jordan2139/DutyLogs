const { Row, Button, Menu, Embed, Modal, Text } = require("../../../../src/structure/backend/build");

module.exports.run = function (client, interaction, data) {
    data = data?.split("-") || [];
    if (data[0] && !client.cache[interaction.member.id]) return interaction.reply({ content: "It looks like the setup process has timed out. Please rerun /settings dutylogs channel to start again.", ephemeral: true });
    switch (data[0]) {
        case "submit":
            client.db.query(`INSERT INTO logchannels (guild, channelid, type) VALUES (?, ?, ?);`, [interaction.guild.id, client.cache[interaction.member.id].channel, client.cache[interaction.member.id].type], function (err, res) {
                if (err) return client.emit("errorEmbed", interaction, err?.stack ? err.stack : err);
                delete client.cache[interaction.member.id];
                interaction.update({ embeds: [], components: [], content: res?.insertId ? "The duty log channel was successfully added to the list of duty logging channels!" : "There was an error adding your duty log channel to the database." });
            });
            break;
        case "setup":
            client.cache[interaction.member.id].type = data[1];
            let embed = new Embed()
                .setColor(client.config.color)
                .setAuthor({ name: "Duty Logs Setup" })
                .setDescription(`**Type**: ${client.config.departments[data[1]].name}\n**Channel**: <#${client.cache[interaction.member.id].channel}>`)
                .setFooter({ text: "Developed by: Jordan2139." })
            let componentsRow = [
                new Row().addComponent(
                    new Button()
                        .setLabel("Change type")
                        .setStyle(1)
                        .setCustomId(`dutylogsetup-type`)
                ).addComponent(
                    new Button()
                        .setLabel("Submit")
                        .setStyle(3)
                        .setCustomId(`dutylogsetup-submit`)
                ),
                new Row().addComponent(
                    new Menu()
                        .setPlaceholder("Select a channel...")
                        .setType(8)
                        .setChannelTypes(0, 5)
                        .setMax(1)
                        .setCustomId(`dutylogsetup-channel`)
                )
            ];
            interaction.update({ embeds: [embed], components: componentsRow, content: null });
            break;
        default:
            client.cache[interaction.member.id] = {
                type: null,
                info: null,
                channel: interaction.channel.id
            };
            const departmentButtonRow = new Row()
            const departmentButtonRow2 = new Row()
            const departmentButtonRow3 = new Row()
            let count = 0;
            const userRoles = interaction.member.roles.cache;
            if (userRoles.has(client.config.departments.admin.allowedRoles[0]) || userRoles.some(role => client.config.departments.admin.allowedRoles.includes(role))) {
                for (const departmentKey in client.config.departments) {
                    const department = client.config.departments[departmentKey];
                    const departmentName = department.name;
                    if (count <= 5 ) {
                        departmentButtonRow.addComponent(
                            new Button()
                                .setLabel(departmentName)
                                .setStyle(3)
                                .setCustomId(`dutylogsetup-setup-${departmentKey}`)
                        );
                    } else if (count >= 6 && count < 10) {
                        departmentButtonRow2.addComponent(
                            new Button()
                                .setLabel(departmentName)
                                .setStyle(3)
                                .setCustomId(`dutylogsetup-setup-${departmentKey}`)
                        );
                    } else if (count >= 10) {
                        departmentButtonRow3.addComponent(
                            new Button()
                                .setLabel(departmentName)
                                .setStyle(3)
                                .setCustomId(`dutylogsetup-setup-${departmentKey}`)
                        );
                    }
                    count++;
                }
            } else {
                let count = 0;
                for (const departmentKey in client.config.departments) {
                    const department = client.config.departments[departmentKey];
                    const departmentName = department.name;
                    const allowedRoles = department.allowedRoles;
                    if (allowedRoles && allowedRoles.length > 0 && userRoles.some(role => allowedRoles.includes(role))) {
                        if (count < 5) {
                            departmentButtonRow.addComponent(
                                new Button()
                                    .setLabel(departmentName)
                                    .setStyle(3)
                                    .setCustomId(`dutylogsetup-setup-${departmentKey}`)
                            );
                        } else if (count >= 5) {
                            departmentButtonRow2.addComponent(
                                new Button()
                                    .setLabel(departmentName)
                                    .setStyle(3)
                                    .setCustomId(`dutylogsetup-setup-${departmentKey}`)
                            );
                        } else if (count >= 10) {
                            departmentButtonRow3.addComponent(
                                new Button()
                                    .setLabel(departmentName)
                                    .setStyle(3)
                                    .setCustomId(`dutylogsetup-setup-${departmentKey}`)
                            );
                        }
                        count++;
                    }
                }
            }
            if (departmentButtonRow.data.components.length === 0 && departmentButtonRow2.data.components.length === 0 && departmentButtonRow3.data.components.length === 0) return interaction.reply({ content: "It looks like you don't have access to any departments. Please contact your server administrator to get access to a department.", ephemeral: true });
            let components = [];
            if (departmentButtonRow.data.components.length > 0) components.push(departmentButtonRow);
            if (departmentButtonRow2.data.components.length > 0) components.push(departmentButtonRow2);
            if (departmentButtonRow3.data.components.length > 0) components.push(departmentButtonRow3);
            interaction.update({
                content: "Lets first start with which department you would like to configure logs for!\nYou have access to the below departments:", components: components
            });
    };
};