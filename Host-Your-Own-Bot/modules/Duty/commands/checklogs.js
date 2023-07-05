const { Command, Embed, Menu, Row, Button } = require("../../../src/structure/backend/build");
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
    const userRoles = interaction.member.roles.cache.map(role => role.id);
    if (!userRoles.some(roleId => config.departments[department.toUpperCase()].allowedRoles.includes(roleId))) return interaction.reply({ content: "You do not have permission to use this command.", ephemeral: true })
    await client.db.query(`SELECT * from players WHERE discord = ?`, [user.id], async function (err, userRes) {
        steamId = userRes[0].steam;
        if (!steamId) return interaction.reply({ content: "That user is not linked to a steam account.", ephemeral: true });
        await client.db.query(`SELECT * FROM servers WHERE guild = ?`, [interaction.guild.id], async function (err, serverRes) {
            if (!serverRes[0]) return interaction.reply({ content: "This server is not configured in the database. Please contact an administrator.", ephemeral: true });
            await client.db.query(`SELECT SUM(TIME_TO_SEC(TIMEDIFF(endtime, starttime))) AS total_time FROM dutylogs WHERE steam = ? AND server = ? AND department = ? AND starttime >= DATE_SUB(NOW(), INTERVAL ${timeframe}) AND endtime <= NOW()`, [steamId, serverRes[0].id, department], async function (err, totalTimeRes) {
                if (totalTimeRes[0].total_time == null) return interaction.reply({ content: "No logs found for that user in that department.", ephemeral: true })
                const embed = new Embed()
                    .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
                    .setDescription(`## ${user}'s Duty Logs\n### Showing logs for ${timeframe} in ${config.departments[department.toUpperCase()].name}\n\n### Total time on duty in ${timeframe}: \`${formatDuration(totalTimeRes[0].total_time)}\`\n\n### Logs:`)
                    .setColor(config.color)
                    .setTimestamp();
                await client.db.query(`SELECT * FROM dutylogs WHERE steam = '${steamId}' AND server = ${serverRes[0].id} AND department = '${department}' AND endtime > NOW() - INTERVAL ${timeframe} ORDER BY id DESC`, function (err, logs) {
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
                    interaction.reply({ embeds: [embed], components: row });
                });
            });
            client.cache[interaction.member.id] = {
                checklogs: {
                    user: user,
                    timeframe: timeframe,
                    department: department
                }
            };
        });
    });
};

// Functions
/**
 *
 * @param {string} duration
 * @returns {string}
 * @example convertAbbreviatedDuration('1d') // '1 DAY'
 * @example convertAbbreviatedDuration('1M') // '1 MONTHS'
 */
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

/**
 * @param {string} timeType
 * @returns {boolean}
 * @example isValidTimeType('1d') // true
 * @example isValidTimeType('1x') // false
*/
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

/**
 * @param {number} durationInSeconds
 * @returns {string}
 * @example formatDuration(3600) // '01 hours, 00 minutes, 00 seconds'
 */
function formatDuration(durationInSeconds) {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = durationInSeconds % 60;
    return `${hours.toLocaleString('en-US', { minimumIntegerDigits: 2 })} hours, ${minutes.toLocaleString('en-US', { minimumIntegerDigits: 2 })} minutes, ${seconds.toLocaleString('en-US', { minimumIntegerDigits: 2 })} seconds`;
}
