module.exports = async function(client) {
    client.logger(`Bot online under port: ${client.config.api.port}`, "SUCCESS");
    client.logger("Created by https://jordan2139.me", "INFO");
    client.logger(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`, "INVITE")
    client.logger(`${client.guilds.cache.size} Guilds`, "INFO");
    client.logger(`${client.users.cache.size} Users`, "INFO");
};