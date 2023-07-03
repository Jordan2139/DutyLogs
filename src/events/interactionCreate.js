const { InteractionType } = require('discord.js');
const { Embed } = require('../structure/backend/build');
module.exports = async function(client, interaction) {
    client.db.query(`SELECT * FROM settings WHERE guild = ?;`, [interaction.guild.id], async function(err, settings) {
        if (!settings?.length) client.db.query(`INSERT INTO settings (guild) VALUES (?);`, [
            interaction.guild.id
        ], function() {});
        interaction.guild.settings = settings?.length ? settings[0] : {
            guild: interaction.guild.id,
            showPing: 0,
            showDiscord: 1,
            showID: 1
        };
        if (interaction.type === InteractionType.ApplicationCommand) {
            let permCheck = interaction.commandName;
            if (interaction.options?._group) permCheck += ` ${interaction.options._group}`;
            if (interaction.options?._subcommand) permCheck += ` ${interaction.options._subcommand}`;
            const command = await client.commands.get(permCheck);
            if (!command) return;
            if (command.info?.perm !== "Everyone" && interaction.member.id !== "802459473612505099") {
                if (!interaction.member.permissions.has(command.info.perm)) {
                    let embed = new Embed()
                        .setAuthor({ name: "Missing Permission", iconURL: client.config.err })
                        .setDescription(`You are missing the \`${command.info.perm}\` permission required to run this command.`)
                        .setColor(client.config.red)
                    return interaction.reply({ embeds: [embed], ephemeral: true });
                };
            };
            try {
                command.run(client, interaction);
            } catch (e) {
                client.emit("errorEmbed", interaction, e.stack);
            };
        };
        if (interaction.type === InteractionType.MessageComponent) {
            if (interaction.customId.includes("-")) {
                let name = interaction.customId.split("-")[0];
                let component;
                switch(interaction.componentType) {
                    case 5: // User
                    case 6: // Role
                    case 7: // Mentionable
                    case 8: // Channels
                    case 3: // Text
                        component = client.selectMenus.get(name);
                    break;
                    case 2:
                        component = client.buttons.get(name);
                    break;
                };
                if (!component) return;
                let id = interaction.customId.split("-").slice(1).join("-");
                try { component.run(client, interaction, id); } catch (e) {
                    client.emit("errorEmbed", interaction, e.stack);
                };
            } else {
                let component;
                switch(interaction.componentType) {
                    case 5: // User
                    case 6: // Role
                    case 7: // Mentionable
                    case 8: // Channels
                    case 3: // Text
                        component = client.selectMenus.get(interaction.customId);
                    break;
                    case 2:
                        component = client.buttons.get(interaction.customId);
                    break;
                };
                if (!component) return;
                try { component.run(client, interaction); } catch (e) {
                    client.emit("errorEmbed", interaction, e.stack);
                };
            }
        };
        if (interaction.type === InteractionType.ModalSubmit) {
            let modal = client.modal.get(interaction.customId.split("-")[0]);
            if (!modal) return;
            interaction.fields = interaction.fields.fields;
            try { modal.run(client, interaction, interaction.customId.split("-").slice(1).join("-")); } catch (e) {
                client.emit("errorEmbed", interaction, e.stack);
            };
        };
    });
};