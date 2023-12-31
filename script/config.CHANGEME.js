module.exports = {
    debugMode: false,
    api: {
        secretkey: '', // Secret key to verify requests
        dutylogsbotip: '', // IP of the duty logs bot
        dutylogsbotport: '', // Port of the duty logs bot
    },
    dutyCount: {
        enabled: true, // Enable the duty count
        groupBy: 'department', // Options: department, blipType
        display: {
            pos: {
                x: 0.158,
                y: 0.90
            }
        }
    },
    departments: {
        ['LSPD']: {
            properName: 'Los Santos Police Department',
            permissions: {
                mode: 'ace', // Options: Ace = Ace Permissions, Discord = Discord Roles, Everyone = Everyone can use
                allowedIdentifiers: ['group.lspd'], // Allowed Identifiers - Ace groups or Discord roles
                checkDuty: true, // Allow this department to use the checkduty command
            },
            blips: {
                enabled: true,
                sprite: 60,
                color: 38,
                scale: 0.8,
                label: 'LSPD',
                type: 'leo'
            }
        },
        ['BCSO']: {
            properName: 'Blaine County Sheriff\'s Office',
            permissions: {
                mode: 'ace', // Options: Ace = Ace Permissions, Discord = Discord Roles, Everyone = Everyone can use
                allowedIdentifiers: ['group.bcso'], // Allowed Identifiers - Ace groups or Discord roles
                checkDuty: true, // Allow this department to use the checkduty command
            },
            blips: {
                enabled: true,
                sprite: 60,
                color: 38,
                scale: 0.8,
                label: 'BCSO',
                type: 'leo'
            }
        },
        ['SAHP']: {
            properName: 'San Andreas Highway Patrol',
            permissions: {
                mode: 'everyone', // Options: Ace = Ace Permissions, Discord = Discord Roles, Everyone = Everyone can use
                allowedIdentifiers: ['group.sahp'], // Allowed Identifiers - Ace groups or Discord roles
                checkDuty: true, // Allow this department to use the checkduty command
            },
            blips: {
                enabled: true,
                sprite: 60,
                color: 38,
                scale: 0.8,
                label: 'SAHP',
                type: 'leo'
            }
        },
        ['LSCFD']: {
            properName: 'Los Santos County Fire Department',
            permissions: {
                mode: 'ace', // Options: Ace = Ace Permissions, Discord = Discord Roles, Everyone = Everyone can use
                allowedIdentifiers: ['group.lscfd'], // Allowed Identifiers - Ace groups or Discord roles
                checkDuty: true, // Allow this department to use the checkduty command
            },
            blips: {
                enabled: true,
                sprite: 60,
                color: 38,
                scale: 0.8,
                label: 'LSCFD',
                type: 'fire'
            }
        },
        ['CIV']: {
            properName: 'Civilian',
            permissions: {
                mode: 'everyone', // Options: Ace = Ace Permissions, Discord = Discord Roles, Everyone = Everyone can use
                allowedIdentifiers: [], // Allowed Identifiers - Ace groups or Discord roles
                checkDuty: true, // Allow this department to use the checkduty command
            },
            blips: {
                enabled: true,
                sprite: 1,
                color: 3,
                scale: 0.8,
                label: 'CIV',
                type: 'civ'
            }
        },
        ['CC']: {
            properName: 'Certified Civilian',
            permissions: {
                mode: 'ace', // Options: Ace = Ace Permissions, Discord = Discord Roles, Everyone = Everyone can use
                allowedIdentifiers: ['group.certciv'], // Allowed Identifiers - Ace groups or Discord roles
                checkDuty: true, // Allow this department to use the checkduty command
            },
            blips: {
                enabled: false,
                sprite: 60,
                color: 38,
                scale: 0.8,
                label: 'CC',
                type: 'civ'
            }
        }
    }
}