const { Command } = require("../../../src/structure/backend/build");
module.exports.info = new Command()
    .setName("settings")
    .setDescription("Manage settings in your server.")
    .setPermission("ManageGuild")
    .addSubCommand(
        new Command.subCommand()
            .setName("servers")
            .setDescription("Manage your FiveM servers.")
    ).addSubCommandGroup(
        new Command.subCommandGroup()
            .setName("dutylogs")
            .setDescription("Manage duty logging channels.")
            .addSubCommand(
                new Command.subCommand()
                    .setName("channel")
                    .setDescription("Manage your FiveM servers\' duty logs channels.")
            ))