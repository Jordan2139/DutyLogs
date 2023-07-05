const fs = require("fs");const path = require("path");
module.exports = async function(client) {
    // Installme Formatter
    let mySQLTables = await fs.readFileSync(path.join(__dirname, "../", "../", "../", "installme.sql"), "utf-8");
    let tables = {};
    let data = mySQLTables.replaceAll("(", "").replaceAll(",", "").split("\r\n").slice(4);
    let table;
    for (let str of data) {
        if (str.startsWith("CREATE TABLE")) {
            table = str.split(" ")[2];
            tables[table] = {};
        } else {
            let columnData = str.split(" ").slice(4);
            if (!columnData.length) continue;
            if (columnData[0] == "CHARSET=utf8mb4") continue;
            tables[table][columnData[0]] = columnData.slice(1).join(" ");
        };
    };
    // Main Table Check
    for (let table of Object.keys(tables)) {
        client.db.query(`SELECT * FROM ${table};`, function(err, res) {
            if (err?.code !== "ER_NO_SUCH_TABLE") {
                client.db.query(`SHOW COLUMNS FROM ${client.config.sql.database}.${table};`, function(err, foundColumns) {
                    for (let column of Object.keys(tables[table])) {
                        let foundColumn = foundColumns.filter(col => col.Field == column);
                        if (!foundColumn?.length) {
                            client.db.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${tables[table][column]};`, function() {
                                client.logger(`Creating ${client.config.sql.database}.${table}.${column}...`, "UPDATE");
                            });
                        } else {
                            let dataType = tables[table][column]
                        };
                    };
                });
            } else {
                let tableCreate = `CREATE TABLE ${table}(\n`;
                for (let column of Object.keys(tables[table])) {
                    tableCreate += `${column} ${tables[table][column]},\n`;
                };
                tableCreate += `PRIMARY KEY (id)) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;`;
                client.db.query(tableCreate, function(err, res) {
                    client.logger(`Creating ${client.config.sql.database}.${table}...`, "UPDATE");
                });
            }
        });
    };

    require("./starter")(client)
    require("./versioncheck")(client)
};