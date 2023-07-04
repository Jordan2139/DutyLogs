const { Embed, Row, Button, Menu } = require("../../../../src/structure/backend/build")
module.exports.run = function (client, interaction, data) {
    switch (data) {
        case "select":
            client.db.query(`SELECT * FROM dutylogs WHERE id = ?;`, [Number(interaction.values[0])], function (err, res) {
                let log = res[0];
                const date1 = new Date(log.starttime);
                const date2 = new Date(log.endtime);
                const diffInMilliseconds = Math.abs(date2 - date1);
                let embed = new Embed()
                    .setAuthor({ name: "Duty Logs" })
                    .setColor(client.config.color)
                    .setDescription(`> **${log.id}**\n**Steam ID**: \`${log.steam}\`\n**Server**: \`${log.server}\`\n**Department**: \`${log.department}\`\n**Start Time**: \`${formatDate(log.starttime)}\`\n**End Time**: \`${formatDate(log.endtime)}\`\n**Total Time**: \`${formatDuration(diffInMilliseconds / 1000)}\`\n`)
                let row = [
                    new Row()
                        .addComponent(
                            new Button()
                                .setCustomId(`logmenu-goback-${interaction.member.id}`)
                                .setLabel("Back")
                                .setStyle(3)
                                .setEmoji('🔙')
                        )
                ];
                interaction.update({ embeds: [embed], components: row });
            });
            break;
    };
};

// Functions
/**
 *
 * @param {number} durationInSeconds
 * @returns {string}
 * @description Formats a duration in seconds to a human readable format.
 * @example formatDuration(3600) // 01 hours, 00 minutes, 00 seconds
 */
function formatDuration(durationInSeconds) {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = durationInSeconds % 60;
    return `${hours.toLocaleString('en-US', { minimumIntegerDigits: 2 })} hours, ${minutes.toLocaleString('en-US', { minimumIntegerDigits: 2 })} minutes, ${seconds.toLocaleString('en-US', { minimumIntegerDigits: 2 })} seconds`;
}

/**
 *
 * @param {dateObject} date
 * @returns {string}
 * @description Formats a date object to a human readable format.
 * @example formatDate(new Date()) // 01/01/2021, 12:00 AM
 */
function formatDate(date) {
    const options = {
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "numeric",
    };
    return date.toLocaleString("en-US", options);
}