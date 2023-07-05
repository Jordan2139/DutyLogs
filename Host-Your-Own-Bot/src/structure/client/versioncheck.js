const axios = require('axios')
const packageJson = require('../../../package.json');
module.exports = async function(client) {
    axios.get('https://raw.githubusercontent.com/Jordan2139/DutyLogs/master/version.json')
        .then(response => {
            const data = response.data['host-your-own-bot'];
            const currentVersion = packageJson.version;
            if (data.version !== currentVersion) {
                client.logger(`New version available: ${data.version}`, "UPDATE")
                client.logger(`Current version: ${currentVersion}`, "UPDATE")
                client.logger(`Changelog: ${data.releaseTitle}`, "UPDATE")
                client.logger(`Download: https://github.com/Jordan2139/DutyLogs/releases/latest`, "UPDATE")
            } else {
                client.logger(`Bot up to date on version ${currentVersion}!`, "SUCCESS")
            }
        })
        .catch(error => {
            client.logger(error, "ERROR")
        })
};