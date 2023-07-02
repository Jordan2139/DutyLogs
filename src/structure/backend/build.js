module.exports = {
    Embed: class Embed {
        constructor(data = {}) {
            this.data = { ...data };
            if (!this.data?.type) this.data.type = "rich";
            if (this.data.timestamp) this.data.timestamp = new Date(data.timestamp).toISOString();
        };
        /**
         * The color for the Embed.
         * @param {*} color A HEX color code.
         * @param {*} color A decimal color code.
         */
        setColor(color) {
            if (typeof color === "string" && color?.startsWith("#")) color = color.slice(1);
            this.data.color = !isNaN(color) ? color : parseInt(color, 16);
            return this;
        };
        /**
         * The title for the embed.
         * @param {String} title A string with no more than 256 characters.
         */
        setTitle(title) {
            if (title?.length > 256) throw new Error("Embed titles have a limit of 256 characters.");
            this.data.title = title;
            return this;
        };
        /**
         * The description for the embed.
         * @param {String} description A string with no more than 4096 characters.
         * @returns
         */
        setDescription(description) {
            if (description?.length > 4096) throw new Error("Embed descriptions have a limit of 4096 characters.");
            this.data.description = description;
            return this;
        };
        /**
         * The title URL for the embed.
         * @param {URL} url A url.
         * @returns
         */
        setURL(url) {
            if (!url.startsWith("http")) throw new Error("Embed urls must contain a common (http, https) URL.");
            this.data.url = url;
            return this;
        };
        /**
         * The timestamp for the embed.
         * @param {Date} timestamp A millisecond date.
         * @returns
         */
        setTimestamp(timestamp) {
            this.data.timestamp = (timestamp) ? new Date(timestamp).toISOString() : new Date().toISOString();
            return this;
        };
        /**
         * The author for the embed.
         * @param {Object} options The options for an author.
         * @param {String} options.name Display text of the author.
         * @param {URL} options.url The url for the author.
         * @param {URL} options.iconURL The url for the icon of the author.
         * @returns
         */
        setAuthor(options) {
            if (options === null) {
                this.data.author = void 0;
            } else {
                this.data.author = { name: options.name, url: options.url, icon_url: options.iconURL };
            };
            return this;
        };
        /**
         * The footer for the embed.
         * @param {Object} options The options for a footer.
         * @param {String} options.text Display text for the footer.
         * @param {URL} options.iconURL The url for the icon of the footer.
         * @returns
         */
        setFooter(options) {
            if (options === null) {
                this.data.author = void 0;
            } else {
                this.data.footer = { text: options.text, icon_url: options.iconURL }
            };
            return this;
        };
        /**
         * The fields for the embed.
         * @param {Array} fields An array of field objects.
         * @param {String} field.name A field name.
         * @param {String} field.value A field description / value.
         * @param {Boolean} field.inline Wether hoist a field or not.
         * @example
         * [
         *      {
         *          name: "Field Name",
         *          value: "Field Value",
         *          inline: true
         *      }
         * ]
         */
        setFields(fields) {
            if (!fields?.length) {
                this.data.fields = void 0;
            } else if (fields?.length > 25) {
                throw new Error("Embed fields can not exceed 25 in length.");
            } else {
                validate.fields(fields);
                this.data.fields = fields;
            };
            return this;
        };
        /**
         * Add a field to an embed.
         * @param {String} name A field name.
         * @param {String} value A field description / value.
         * @param {Boolean} inline Wether hoist a field or not.
         */
        addField(name, value, inline) {
            if (!this.data?.fields) this.data.fields = [];
            if (this.data.fields.length > 25) throw new Error("Embed fields can not exceed 25 in length.");
            validate.fields([{ name: name, value: value }]);
            this.data.fields.push({
                name: name,
                value: value,
                inline: inline
            });
            return this;
        };
        /**
         *
         * @param {Object} options An array of image options
         * @param {String} options.url source url of image (only supports http(s) and attachments)
         * @param {String} options.proxyURL a proxied url of the image
         * @param {Number} options.height height of image
         * @param {Number} options.width width of image
         * @returns
         */
        setImage(options) {
            if (options === null) {
                this.data.image = void 0;
            } else {
                this.data.image = {
                    url: options.url,
                    proxy_url: options.proxyURL,
                    height: options.height,
                    width: options.width
                };
            };
            return this;
        };
        /**
         *
         * @param {Object} options An array of image options
         * @param {String} options.url source url of image (only supports http(s) and attachments)
         * @param {String} options.proxyURL a proxied url of the image
         * @param {Number} options.height height of image
         * @param {Number} options.width width of image
         * @returns
         */
        setThumbnail(options) {
            if (options === null) {
                this.data.thumbnail = void 0;
            } else {
                this.data.thumbnail = {
                    url: options.url,
                    proxy_url: options.proxyURL,
                    height: options.height,
                    width: options.width
                };
            };
            return this;
        };
        toJSON() {
            return {
                ...this.data
            };
        };
        /**
         * Import an existing embed to utilize the builder with.
         * @param {Object} embed A prebuilt embed to modify.
         * @returns
         */
        importEmbed(embed) {
            this.data = embed.data ? embed.data : embed;
            return this;
        };
        /**
         * Set the type of embed. "rich" is recommended for most embeds.
         * @param {String} type The type of embed defaulted to rich.
         * @default "rich"
         */
        setType(type = "rich") {
            this.data.type = type;
            return this;
        };
    },
    Row: class Row {
        constructor(data = {}) {
            this.data = { type: 1, ...data };
            if (!this.data?.components?.length) this.data.components = [];
        };
        toJSON() {
            return {
                ...this.data
            };
        };
        /**
         * Add a component to the action row.
         * @param {Object} component A component object to add.
         * @returns
         */
        addComponent(component) {
            if (!this.data.components?.length) this.data.components = [];
            if (this.data.components.length < 5) this.data.components.push(component);
            return this;
        };
        /**
         * Set the components of the action row.
         * @param {Array} components An array of component objects to set the action row to.
         * @returns
         */
        setComponents(components) {
            this.data.components = components;
            return this;
        };
        toJSON() {
            return {
                ...this.data
            };
        };
    },
    Button: class Button {
        constructor(data = {}) {
            this.data = { type: 2, ...data };
        };
        toJSON() {
            return {
                ...this.data
            };
        };
        /**
         * 1:Primary 2:Secondary 3:Success 4:Danger 5:Link
         * @param {Number} style A button style
         */
        setStyle(style) {
            if (typeof style === "string") style = validate.buttonSyles[style.toLowerCase()];
            if (![1,2,3,4,5].includes(style)) throw new Error("Please use proper button styles. https://discord.com/developers/docs/interactions/message-components#button-object-button-styles");
            this.data.style = style;
            return this;
        };
        /**
         * Set the label of the button.
         * @param {String} label Text that appears on the button; max 80 characters;
         */
        setLabel(label) {
            if (label.length > 80) throw new Error("Button labels have a 80 character limit.");
            this.data.label = label;
            return this;
        };
        /**
         * Set the emoji to display on the button.
         * @param {Object} options
         * @param {String} options.name
         * @param {String} options.id
         * @param {Boolean} options.animated
         */
        setEmoji(options) {
            this.data.emoji = { name: options.name, id: options.id, animated: options.animated };
            return this;
        };
        /**
         * Set the custom ID of the button.
         * @param {String} id Developer-defined identifier for the button; max 100 characters
         */
        setCustomId(id) {
            if (id.length > 100) throw new Error("Button ID's have a 100 character limit.");
            this.data.custom_id = id;
            return this;
        };
        /**
         * Set the redirect URL for the button.
         * @param {URL} url URL for link-style buttons.
         */
        setURL(url) {
            this.data.url = url;
            return this;
        };
        /**
         * Set the disabled state of the button.
         * @param {Bool} bool Whether the button is disabled (defaults to `false`)
         */
        setDisabled(bool) {
            this.data.disabled = bool;
            return this;
        };
        toJSON() {
            return {
                ...this.data
            };
        };
    },
    Menu: class Menu {
        constructor(data = {}) {
            this.data = { ...data };
        };
        toJSON() {
            return {
                ...this.data
            };
        };
        /**
         * 3:text 5:user 6:role 7:mentionable 8:channels
         * @param {Number} type The type of select menu component
         * @returns
         */
        setType(type) {
            if (typeof type === "string") type = validate.menuTypes[type];
            if (![3,5,6,7,8].includes(type)) throw new Error("Please use proper select menu types. https://discord.com/developers/docs/interactions/message-components#component-object-component-types");
            this.data.type = type;
            return this;
        };
        /**
         * Set the ID for the select menu.
         * @param {String} id ID for the select menu; max 100 characters
         */
        setCustomId(id) {
            this.data.custom_id = id;
            return this;
        };
        /**
         * The options for the select menu.
         * @param {Array} options An array of field objects.
         * @param {String} option.label User-facing name of the option; max 100 characters
         * @param {String} option.value Dev-defined value of the option; max 100 characters
         * @param {String} option.description Additional description of the option; max 100 characters
         * @param {Boolean} option.default 	Will show this option as selected by default
         * @param {String} option.emoji.id The ID for the emoji
         * @param {String} option.emoji.name The unicode of the emoji
         * @param {Boolean} options.emoji.animated If the emoji is animated
         * @requires Type 3 select menu
         */
        setOptions(options) {
            if (this.data.type !== 3) throw new Error("Select Menu Channel Options are only available with type 3 select menus.");
            validate.selectMenuOptions(options);
            this.data.options = options;
            return this;
        };
        /**
         * Add an option to the select menu.
         * @param {Object} options A select menu option
         * @param {String} options.label User-facing name of the option; max 100 characters
         * @param {String} options.value Dev-defined value of the option; max 100 characters
         * @param {String} options.description Additional description of the option; max 100 characters
         * @param {Boolean} options.default 	Will show this option as selected by default
         * @param {String} options.emoji.id The ID for the emoji
         * @param {String} options.emoji.name The unicode of the emoji
         * @param {Boolean} options.emoji.animated If the emoji is animated
         * @requires Type 3 select menu
         */
        addOption(options) {
            if (this.data.type !== 3) throw new Error("Select Menu Channel Options are only available with type 3 select menus.");
            validate.selectMenuOptions([options]);
            if (!this.data?.options?.length) this.data.options = [];
            if (this.data?.options.length < 25) this.data.options.push(options);
            return this;
        };
        /**
         * Set the channel types for Channel Select Menus
         * @param {Number} types 0 - Guild Text Channel
         * @param {Number} types 2 - Guild Voice Channel
         * @param {Number} types 4 - Guild Category Channel
         * @param {Number} types 5 - Guild Announcement Channel
         * @requires Type 8 select menu
         */
        setChannelTypes(...types) {
            if (this.data.type !== 8) throw new Error("Select Menu Channel Types are only available with type 8 select menus.");
            this.data.channel_types = types;
            return this;
        };
        /**
         * Set the place holder for the select menu
         * @param {String} placeholder Placeholder text if nothing is selected; max 150 characters
         */
        setPlaceholder(placeholder) {
            if (placeholder.length > 150) throw new Error("Select Menu Placeholders have a limit of 150 characters.");
            this.data.placeholder = placeholder;
            return this;
        };
        /**
         * Set the minimum amount of options to select in a select menu
         * @param {Number} min 	Minimum number of items that must be chosen (defaults to 1); min 0, max 25
         */
        setMin(min) {
            this.data.min_values = isNaN(min) ? 1 : min > 25 ? 25 : min;
            return this;
        };
        /**
         * Set the maximum amount of options to select in a select menu
         * @param {Number} max 	Maximum number of items that can be chosen (defaults to 1); max 25
         */
        setMax(max) {
            this.data.max_values = isNaN(max) ? 1 : max > 25 ? 25 : max;
            return this;
        };
        /**
         * Set whether the select menu is disabled
         * @param {Boolean} bool Whether select menu is disabled (defaults to `false`)
         * @returns
         */
        setDisabled(bool) {
            this.data.disabled = bool;
            return this;
        };
        toJSON() {
            return {
                ...this.data
            };
        };
    },
    Modal: class Modal {
        constructor(data = {}) {
            this.data = { ...data };
            if (!this.data?.components?.length) this.data.components = [];
        };
        toJSON() {
            return {
                ...this.data
            };
        };
        /**
         * Set the custom ID of the modal
         * @param {String} id a developer-defined identifier for the modal, max 100 characters
         * @returns
         */
        setCustomId(id) {
            if (id.length > 100) throw new Error("Modal IDs have a limit of 100 characters.");
            this.data.custom_id = id;
            return this;
        };
        /**
         *
         * @param {String} title the title of the popup modal, max 45 characters
         * @returns
         */
        setTitle(title) {
            if (title.length > 45) throw new Error("Modal titles have a limit of 45 characters.");
            this.data.title = title;
            return this;
        };
        /**
         * Add an action row to the modal.
         * @param {Array} component An action row to add.
         * @returns
         */
        addComponent(component) {
            if (!this.data.components?.length) this.data.components = [];
            if (this.data.components.length < 5) this.data.components.push(component);
            return this;
        };
        /**
         * Set the action rows to the modal
         * @param {Array} components An array of action rows to add to the modal.
         * @returns
         */
        setComponents(components) {
            this.components = components;
            return this;
        };
        toJSON() {
            return {
                ...this.data
            };
        };
    },
    Text: class Text {
        constructor(data = {}) {
            this.data = { ...data };
            this.data.type = 4;
        };
        toJSON() {
            return {
                ...this.data
            };
        };
        /**
         * Set the custom ID for the text input
         * @param {String} id Developer-defined identifier for the input; max 100 characters
         * @returns
         */
        setCustomId(id) {
            if (id.length > 100) throw new Error("Text Input Custom Id has a limit of 1000 characters.");
            this.data.custom_id = id;
            return this;
        };
        /**
         * Set the style of the text input
         * @param {Number} style 1 - Short line text
         * @param {Number} style 2 - Paragraph text
         */
        setStyle(style) {
            if (![1,2].includes(style)) throw new Error("Text Input Styles only includes (1,2)");
            this.data.style = style;
            return this;
        };
        /**
         * Set the label for the text input
         * @param {String} label Label for this component; max 45 characters
         * @returns
         */
        setLabel(label) {
            if (label.length > 45) throw new Error("Text Input Labels have a limit of 45 characters.");
            this.data.label = label;
            return this;
        };
        /**
         * Set the minimum amount of characters for the text input
         * @param {Number} min Minimum input length for a text input; min 0, max 4000
         */
        setMin(min) {
            this.data.min_length = isNaN(min) ? 0 : min;
            return this;
        };
        /**
         * Set the maximum amount of characters for the text input
         * @param {Number} max Maximum input length for a text input; min 1, max 4000
         */
        setMax(max) {
            this.data.max_length = isNaN(max) ? 4000 : max > 4000 ? 4000 : max;
            return this;
        };
        /**
         * Set whether the text input is required
         * @param {Boolean} bool Whether this component is required to be filled (defaults to `true`)
         */
        setRequired(bool) {
            this.data.required = bool;
            return this;
        };
        /**
         * Set the default input of the text input
         * @param {String} value Pre-filled value for this component; max 4000 characters
         */
        setValues(value) {
            if (value.length > 4000) throw new Error("Text Input Values have a limit of 4000 characters.");
            this.data.value = value;
            return this;
        };
        /**
         * Set the placeholder for the text input
         * @param {String} placeholder Custom placeholder text if the input is empty; max 100 characters
         */
        setPlaceholder(placeholder) {
            if (placeholder.length > 100) throw new Error("Text Input Placeholders have a limit of 100 characters.");
            this.data.placeholder = placeholder;
            return this;
        };
        toJSON() {
            return {
                ...this.data
            };
        };
    },
    Command: class Command {
        constructor(data = {}) {
            this.data = { ...data };
            if (!this.data.perm) this.data.perm = "Everyone";
        };
        toJSON() {
            return {
                ...this.data
            };
        };
        static subCommandGroup = class {
            constructor(data = {}) {
                this.data = { ...data };
                this.data.type = 2;
            };
            /**
             * Set the name of the application command
             * @param {String} name Name of command, 1-32 characters
             * @example
             * let command = Command().setName("help");
             */
            setName(name) {
                this.data.name = name;
                validate.command.name(name);
                return this;
            };
            /**
             * Set the description of the command.
             * @param {String} description 	Description for CHAT_INPUT commands, 1-100 characters. Empty string for USER and MESSAGE commands
             * @example
             * let command = Command().setDescription("Description");
             */
            setDescription(description) {
                this.data.description = description;
                validate.command.description(description);
                return this;
            };
            /**
             * Add a subcommand
             * @param {Command.subCommand} subCommand Subcommand class
             * @example
             * let command = Command().addSubCommandGroup(
             *      new Command.subCommandGroupBuilder()
             *          .addSubCommand(new Command.subCommand())
             * );
             */
            addSubCommand(subCommand) {
                if (!this.data.options?.length) this.data.options = [];
                this.data.options.push(subCommand?.data ? subCommand.data : subCommand);
                return this;
            };
        };
        static subCommand = class {
            constructor(data = {}) {
                this.data = { ...data };
                this.data.type = 1;
            };
            /**
             * Set the name of the application command
             * @param {String} name Name of command, 1-32 characters
             * @example
             * let command = Command().setName("help");
             */
            setName(name) {
                this.data.name = name;
                validate.command.name(name);
                return this;
            };
            /**
             * Set the description of the command.
             * @param {String} description 	Description for CHAT_INPUT commands, 1-100 characters. Empty string for USER and MESSAGE commands
             * @example
             * let command = Command().setDescription("Description");
             */
            setDescription(description) {
                this.data.description = description;
                validate.command.description(description);
                return this;
            };
            /**
             * Set the DM permission of a command
             * @param {Boolean} boolean Indicates whether the command is available in DMs with the app, only for globally-scoped commands. By default, commands are visible.
             * @example
             * let command = Command().setDMPermission(true);
             */
            setDMPermission(boolean) {
                this.data.dm_permission = boolean;
                validate.command.dm_permission(boolean);
                return this;
            };
            /**
             *
             * @param {Boolean} boolean Indicates whether the command is age-restricted, defaults to false
             * @example
             * let command = Command().setNSFW(true);
             */
            setNSFW(boolean) {
                this.data.nsfw = boolean;
                validate.command.nsfw(boolean);
                return this;
            };
            /**
             * Add an option to the command.
             * @param {Command.optionBuilder} option An application command option object.
             * @requires No subcommand group or subcommand, subcommand / subcommand group builders have addOption built in to them.
             * @example
             * Command.optionBuilder()
             *       .setType(3)
             *       .setName("Name")
             *       .setDescription("Description")
             *       .setRequired(true)
             *       .setChoices([
             *           {
             *               name: "Guild",
             *               value: "guild"
             *           }, {
             *               name: "Server",
             *               value: "server"
             *           }
             *       ])
             */
            addOption(option) {
                if (!this.data.options?.length) this.data.options = [];
                this.data.options.push(option?.data ? option.data : option);
                return this;
            };
            /**
             * Set the options for the command.
             * @param {Array} options An array of options.
             * @requires No subcommand group or subcommand, subcommand / subcommand group builders have addOption built in to them.
             * @example
             * See ...Command.addOption
             * [option1, option2]
             */
            setOptions(options) {
                this.data.option = options;
                return this;
            };
            /**
             * Set the default permission for the command.
             * No type checking is done with this function. Use at own risk.
             * @param {String} permission A Discord string permission.
             * @default "Everyone"
             * @example
             * let command = new Command().setPermission("BanMembers");
             */
            setPermission(permission) {
                this.data.perm = permission;
                return this;
            };
            /**
             * Set the category for the command.
             * @param {String} category Category for a command utilized in the help menu.
             * @example
             * let command = new Command().setCategory("Settings");
             */
            setCategory(category) {
                this.data.category = category;
                return this;
            };
        };
        static optionBuilder = class {
            constructor(data = {}) {
                this.data = { ...data };
            };
            toJSON() {
                return {
                    ...this.data
                };
            };
            /**
             * Set the type of the option.
             * @param {Number} type 3:string 4:integer 5:boolean 6:user 7:channel 8:role 9:mentionable 10:number 11:attachment
             * @example
             * ...optionBuilder().setType(3);
             * ...optionBuilder().setType("STRING");
             */
            setType(type) {
                if (typeof type == "string") type.toLowerCase() == "string" ? 3 : type.toLowerCase() == "integer" ? 4 : type.toLowerCase() == "boolean" ? 5 : type.toLowerCase() == "user" ? 6 : type.toLowerCase() == "channel" ? 7 : type.toLowerCase() == "role" ? 8 : type.toLowerCase() == "mentionable" ? 9 : type.toLowerCase() == "number" ? 10 : type.toLowerCase() == "attachment" ? 11 : 3;
                this.data.type = type;
                return this;
            };
            /**
             * Set the name of the option.
             * @param {String} name 1-32 character name
             * @example
             * ...optionBuilder().setName("Name");
             */
            setName(name) {
                this.data.name = name;
                validate.command.option.name(name);
                return this;
            };
            /**
             * Set the description of the option.
             * @param {String} description 1-100 character description
             * @example
             * ...optionBuilder().setDescription("Description");
             */
            setDescription(description) {
                this.data.description = description;
                validate.command.option.description(description);
                return this;
            };
            /**
             * Set if the option is required.
             * @param {Boolean} boolean If the parameter is required or optional--default false
             * @example
             * ...optionBuilder().setRequired(true);
             */
            setRequired(boolean) {
                this.data.required = boolean;
                return this;
            };
            /**
             * Set the minimum number / integer if using option type integer / number.
             * @param {Number} value If the option is an INTEGER or NUMBER type, the minimum value permitted
             * @example
             * ...optionBuilder().setMinValue(1);
             */
            setMinValue(value) {
                this.data.min_value = value;
                return this;
            };
            /**
             * Set the maximum number / integer if using option type integer / number.
             * @param {Number} value If the option is an INTEGER or NUMBER type, the maximum value permitted
             * @example
             * ...optionBuilder().setMaxValue(1000);
             */
            setMaxValue(value) {
                this.data.max_value = value;
                return this;
            };
            /**
             * Set the minimum length of a string if using option type string.
             * @param {Number} length For option type STRING, the minimum allowed length (minimum of 0, maximum of 6000)
             * @example
             * ...optionBuilder().setMinLength(25);
             */
            setMinLength(length) {
                this.data.min_length = length;
                return this;
            };
            /**
             * Set the maximum length of a string if using option type string.
             * @param {Number} length For option type STRING, the maximum allowed length (minimum of 1, maximum of 6000)
             * @example
             * ...optionBuilder().setMaxLength(3000);
             */
            setMaxLength(length) {
                this.data.max_length = length;
                return this;
            };
            /**
             * Set if autocomplete should be enabled on the option.
             * @param {Boolean} boolean If autocomplete interactions are enabled for this STRING, INTEGER, or NUMBER type option
             * @example
             * ...optionBuilder().setAutocomplete(true);
             */
            setAutocomplete(boolean) {
                this.data.autocomplete = boolean;
                return this;
            };
            /**
             * Add a choice to the option.
             * @param {String} name 1-100 character choice name
             * @param {Value} value Value for the choice, up to 100 characters if string
             * @example
             * ...optionBuilder().addChoice("name", "value");
             */
            addChoice(name, value) {
                if (!this.data.choices?.length) this.data.choices = [];
                this.data.choices.push({ name: name, value: value });
                validate.command.option.choices([{ name: name, value: value }]);
                return this;
            };
            /**
             * Set the choices for the option.
             * @param {Array} choices An array of option choices.
             * @example
             * ...optionBuilder().setChoices(
             *     [{
             *         name: "Name1",
             *         value: "value1"
             *     }, {
             *         name: "Name2",
             *         value: "value2"
             *     }]
             * )
             */
            setChoices(choices) {
                this.data.choices = choices;
                validate.command.option.choices(choices);
                return this;
            };
        }
        /**
         * Set the guild ID for the command.
         * @param {import("discord.js").Snowflake} gid Guild ID of the command, if not global
         * @example
         * let command = new Command().setGuild("358072894867111966");
         */
        setGuild(gid) {
            this.data.guild_id = gid;
            return this;
        };
        /**
         * Set the name of the application command
         * @param {String} name Name of command, 1-32 characters
         * @example
         * let command = Command().setName("help");
         */
        setName(name) {
            this.data.name = name;
            validate.command.name(name);
            return this;
        };
        /**
         * Set the type of command
         * @param {Number} type 1 - CHAT_INPUT
         * @param {Number} type 2 - USER
         * @param {Number} type 3 - MESSAGE
         * @default 1
         * @example
         * let command = Command().setType(1);
         * let command = Command().setType("CHAT_INPUT");
         */
        setType(type) {
            if (typeof type == "string") type = type == "CHAT_INPUT" ? 1 : type == "USER" ? 2 : type == "MESSAGE" ? 3 : 1;
            validate.command.type(type);
            this.data.type = type;
            return this;
        };
        /**
         * Set the description of the command.
         * @param {String} description 	Description for CHAT_INPUT commands, 1-100 characters. Empty string for USER and MESSAGE commands
         * @example
         * let command = Command().setDescription("Description");
         */
        setDescription(description) {
            this.data.description = description;
            validate.command.description(description);
            return this;
        };
        /**
         * Set the DM permission of a command
         * @param {Boolean} boolean Indicates whether the command is available in DMs with the app, only for globally-scoped commands. By default, commands are visible.
         * @example
         * let command = Command().setDMPermission(true);
         */
        setDMPermission(boolean) {
            this.data.dm_permission = boolean;
            validate.command.dm_permission(boolean);
            return this;
        };
        /**
         *
         * @param {Boolean} boolean Indicates whether the command is age-restricted, defaults to false
         * @example
         * let command = Command().setNSFW(true);
         */
        setNSFW(boolean) {
            this.data.nsfw = boolean;
            validate.command.nsfw(boolean);
            return this;
        };
        /**
         * Add an option to the command.
         * @param {Command.optionBuilder} option An application command option object.
         * @requires No subcommand group or subcommand, subcommand / subcommand group builders have addOption built in to them.
         * @example
         * Command.optionBuilder()
         *       .setType(3)
         *       .setName("Name")
         *       .setDescription("Description")
         *       .setRequired(true)
         *       .setChoices([
         *           {
         *               name: "Guild",
         *               value: "guild"
         *           }, {
         *               name: "Server",
         *               value: "server"
         *           }
         *       ])
         */
        addOption(option) {
            if (!this.data.options?.length) this.data.options = [];
            this.data.options.push(option?.data ? option.data : option);
            return this;
        };
        /**
         * Set the options for the command.
         * @param {Array} options An array of options.
         * @requires No subcommand group or subcommand, subcommand / subcommand group builders have addOption built in to them.
         * @example
         * See ...Command.addOption
         * [option1, option2]
         */
        setOptions(options) {
            this.data.option = options;
            return this;
        };
        /**
         * Add a subcommand group
         * @param {Command.subCommandGroup} subCommandGroup Subcommand group class
         * @example
         * let command = Command().addSubCommandGroup(new Command.subCommandGroupBuilder());
         */
        addSubCommandGroup(subCommandGroup) {
            if (!this.data.options?.length) this.data.options = [];
            this.data.options.push(subCommandGroup.data);
            return this;
        };
        /**
             * Add a subcommand
             * @param {Command.subCommand} subCommand Subcommand class
             * @example
             * let command = Command().addSubCommandGroup(
             *      new Command.subCommandGroupBuilder()
             *          .addSubCommand(new Command.subCommand())
             * );
             */
        addSubCommand(subCommand) {
            if (!this.data.options?.length) this.data.options = [];
            this.data.options.push(subCommand?.data ? subCommand.data : subCommand);
            return this;
        };
        /**
         * Set the default permission for the command.
         * No type checking is done with this function. Use at own risk.
         * @param {String} permission A Discord string permission.
         * @default "Everyone"
         * @example
         * let command = new Command().setPermission("BanMembers");
         */
        setPermission(permission) {
            this.data.perm = permission;
            return this;
        };
        /**
         * Set the category for the command.
         * @param {String} category Category for a command utilized in the help menu.
         * @example
         * let command = new Command().setCategory("Settings");
         */
        setCategory(category) {
            this.data.category = category;
            return this;
        };
    },
    Permission: class Permission {
        constructor(data = {}) {
            this.data = { ...data };
        };
        /**
             * Set the default permission for the button.
             * No type checking is done with this function. Use at own risk.
             * @param {String} permission A Discord string permission.
             * @default "Everyone"
             * @example
             * module.exports.info = new Permission().setPermission("BanMembers");
             */
        setPermission(permission) {
            this.data.perm = permission;
            return this;
        };
        /**
         * Set the category for the button.
         * @param {String} category Category for a button utilized in the permission menu.
         * @example
         * module.exports.info = new Permission().setCategory("Settings");
         */
        setCategory(category) {
            this.data.category = category;
            return this;
        };
        /**
         * Set the type of permission. THIS IS NOT FOR COMMANDS.
         * @param {String} type The type of permission.
         * @example
         * module.exports.info = new Permission().setType("button");
         * module.exports.info = new Permission().setType("menu");
         */
        setType(type) {
            this.data.type = type.toLowerCase();
            return this;
        };
        toJSON() {
            return { ...this.data };
        }
    }
};

const validate = {
    command: {
        name(name) {
            if (typeof name !== "string") throw new Error("A command name will only accept a string input.");
            if (name.length > 32) throw new Error("Command names have a limit of 32 characters.");
        },
        type(type) {
            if (![1,2,3].includes(type)) throw new Error("An invalid command type was provided.");
        },
        description(description) {
            if (typeof description !== "string") throw new Error("A command description will only accept a string input.");
            if (description.length > 100) throw new Error("Command descriptions have a limit of 100 characters.")
        },
        dm_permission(boolean) {
            if (typeof boolean !== "boolean") throw new Error("A command dm permission will only accept a boolean input.");
        },
        nsfw(boolean) {
            if (typeof boolean !== "boolean") throw new Error("A command nsfw will only accept a boolean input.");
        },
        option: {
            name(name) {
                if (typeof name !== "string") throw new Error("Command option names will only accept a string input.");
                if (name.length > 32) throw new Error("Command option names have a limit of 32 characters.");
            },
            description(description) {
                if (typeof description !== "string") throw new Error("Command option descriptions will only accept a string input.");
                if (description.length > 100) throw new Error("Command option descriptions have a limit of 100 characters.");
            },
            choices(choices) {
                for (let choice of choices) {
                    if (choice.name.length > 100) throw new Error("Command option choice names have a limit of 100 characters.");
                    if (typeof choice.value == "string" && choice.value?.length > 100) throw new Error("Command option choice string values have a limit of 100 characters.");
                };
            }
        }
    },
    fields(fields) {
        for (let field of fields) {
            if (!field.name && !field.value) throw new Error("A name and value are required in an embed field.");
            if (field.name.length > 256) throw new Error("Embed field names have a limit of 256 characters.");
            if (field.value.length > 1024) throw new Error("Embed field values have a limit of 1024 characters.");
        };
    },
    selectMenuOptions(options) {
        for (let option of options) {
            if (!option.label && !option.value) throw new Error("A label and value are required in a select menu option.");
            if (option.label.length > 100) throw new Error("Select Menu option labels have a limit of 100 characters.");
            if (option.value.length > 100) throw new Error("Select Menu option values have a limit of 100 characters.");
            if (option?.description && option?.description?.length > 100) throw new Error("Select Menu option descriptons have a limit of 100 characters.");
        };
    },
    buttonSyles: {
        'primary': 1,
        'secondary': 2,
        'success': 3,
        'danger': 4,
        'link': 5
    },
    menuTypes: {
        'text': 3,
        'user': 5,
        'role': 6,
        'mentionable': 7,
        'channels': 8
    }
};