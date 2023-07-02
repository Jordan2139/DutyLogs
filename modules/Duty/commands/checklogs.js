const { Command, Embed, Menu, Row } = require("../../../src/structure/backend/build");
const config = require("../../../config/config.json");
module.exports.info = new Command()
    .setName("checklogs")
    .setDescription("See a players time on duty in a specified department.")
    .setCategory("Utility")
    .addOption(
        new Command.optionBuilder()
            .setName("user")
            .setDescription("The users who's duty time you'd like to get")
            .setType(6)
            .setRequired(true)
    ).addOption(
        new Command.optionBuilder()
            .setName("timeframe")
            .setDescription("The timeframe you'd like to check for")
            .setType(3)
            .setRequired(true)
    ).addOption(
        new Command.optionBuilder()
            .setName("department")
            .setDescription("The department you'd like to check for")
            .setType(3)
            .setRequired(true)
            .setChoices(config.formattedDepartments)
    );
module.exports.run = async function (client, interaction) {
    if (!isValidTimeType(interaction.options.get('timeframe').value)) return interaction.reply({ content: "Invalid timeframe provided. Please use the format `1d` for 1 day, `1w` for 1 week, `1M` for 1 month, or `1y` for 1 year.", ephemeral: true });
    const user = interaction.options.get('user').user;
    const timeframe = convertAbbreviatedDuration(interaction.options.get('timeframe').value);
    let department = interaction.options.get('department').value;
    department = department.toLowerCase()
    await client.db.query(`SELECT * from players WHERE discord = ?`, [user.id], async function (err, userRes) {
        steamId = userRes[0].steam;
        if (!steamId) return interaction.reply({ content: "That user is not linked to a steam account.", ephemeral: true });
        await client.db.query(`SELECT * FROM servers WHERE guild = ?`, [interaction.guild.id], async function (err, serverRes) {
            if (!serverRes[0]) return interaction.reply({ content: "This server is not configured in the database. Please contact an administrator.", ephemeral: true });
            await client.db.query(`SELECT SUM(TIME_TO_SEC(TIMEDIFF(endtime, starttime))) AS total_time FROM dutylogs WHERE steam = ? AND server = ? AND department = ? AND starttime >= DATE_SUB(NOW(), INTERVAL ${timeframe}) AND endtime <= NOW()`, [steamId, serverRes[0].id, department], async function (err, totalTimeRes) {
                if (totalTimeRes[0].total_time == null) return interaction.reply({ content: "No logs found for that user in that department.", ephemeral: true })
                const embed = new Embed()
                    .setTitle(`Duty Logs for ${user}`)
                    .setDescription(`Showing logs for ${timeframe} in ${department}\n\nTotal time on duty in ${timeframe}: ${totalTimeRes[0].total_time}`)
                    .setColor(config.embedColor)
                    .setTimestamp();
                const logs = await client.db.query(`SELECT * FROM dutylogs WHERE steam = '${steamId}' AND server = ${serverRes[0].id} AND department = '${department}' AND endtime > NOW() - INTERVAL ${timeframe}`);
                if (logs.length === 0) return interaction.reply({ content: "No logs found for that user in that department.", ephemeral: true });
                const components = new Row().addComponent(
                    new Menu()
                        .setPlaceholder("No logs found for that user in that department.")
                        .setCustomId("dutylogs")
                        .setMax(1)
                        .setMin(1)
                        .setType(3)
                        .setOptions(
                            [
                                {
                                    label: "Select a log to view",
                                    value: "dutylogs",
                                    default: true,
                                    emoji: {
                                        name: "📜"
                                    },
                                    description: "Select a log to view"
                                }
                            ]
                        )
                )
                const logsArray = Array.from(logs);
                // for (const log of logsArray) {
                //     const row = new Row()
                //         .addComponents(
                //             new Button()
                //                 .setLabel(log.starttime)
                //                 .setStyle(1)
                //                 .setCustomId(log.id)
                //         );
                //     components.push(row);
                // }
                interaction.reply({ embeds: [embed], components: [components] });
            });
        });
    });
};

function convertAbbreviatedDuration(duration) {
    const mappings = {
        s: 'SECONDS',
        m: 'MINUTES',
        h: 'HOURS',
        d: 'DAY',
        w: 'WEEKS',
        M: 'MONTHS',
        y: 'YEARS'
    };
    const regex = /(\d+)([smhdwMy])/;
    const match = duration.match(regex);
    if (!match) {
        return null; // Invalid duration format
    }
    const numericValue = match[1];
    const unit = match[2];
    if (!(unit in mappings)) {
        return null; // Invalid duration unit
    }
    const expandedUnit = mappings[unit];
    return numericValue + ' ' + expandedUnit;
}

function isValidTimeType(timeType) {
    const regex = /^\d+[smhdwMy]$/;
    const validUnits = ['s', 'm', 'h', 'd', 'w', 'M', 'y'];
    if (!regex.test(timeType)) {
        return false; // Invalid format
    }
    const unit = timeType.slice(-1);
    if (!validUnits.includes(unit)) {
        return false; // Invalid unit
    }
    return true;
}
