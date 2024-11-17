/**
 * @name Disable_Discord_Link
 * @version 1.0.0
 * @description Bloque les redirections automatiques des liens cliqués sur Discord et demande une confirmation à l'utilisateur.
 * @author KALIX_Ryujin
 * @source https://github.com/CantonyEddy/Disable_Discord_Link.git
 */

module.exports = (() => {
    const config = {
        info: {
            name: "Disable_Discord_Link",
            authors: [
                {
                    name: "KALIX_Ryujin",
                    discord_id: "772065060843159612",
                    github_username: "KALIX_Ryujin"
                }
            ],
            version: "1.0.0",
            description: "Bloque les redirections automatiques des liens cliqués sur Discord et demande une confirmation.",
            github: "https://github.com/CantonyEddy/Disable_Discord_Link.git",
        },
        changelog: [
            {
                title: "Version 1.0.0",
                type: "added",
                items: [
                    "Première version du plugin.",
                    "Ajout de la confirmation avant redirection vers les liens externes."
                ]
            }
        ],
        defaultConfig: [],
        main: "index.js"
    };

    return !global.ZeresPluginLibrary ? class {
        constructor() {
            this._config = config;
        }

        getName() {
            return config.info.name;
        }

        getAuthor() {
            return config.info.authors.map(a => a.name).join(", ");
        }

        getVersion() {
            return config.info.version;
        }

        getDescription() {
            return config.info.description;
        }

        load() {
            BdApi.showConfirmationModal(
                "Library Missing",
                `The library plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`,
                {
                    confirmText: "Download Now",
                    cancelText: "Cancel",
                    onConfirm: () => {
                        require("request").get(
                            "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js",
                            async (error, response, body) => {
                                if (error) return require("electron").shell.openExternal("https://betterdiscord.app/Download");
                                await new Promise(r =>
                                    require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r)
                                );
                            }
                        );
                    }
                }
            );
        }

        start() {}

        stop() {}
    } : (([Plugin, Library]) => {
        const { Patcher, DiscordModules, ContextMenu } = Library;
        const { React } = DiscordModules;

        return class BlockLinkRedirects extends Plugin {
            onStart() {
                this.patchLinkHandler();
            }

            onStop() {
                Patcher.unpatchAll();
            }

            patchLinkHandler() {
                const Link = BdApi.findModuleByProps("defaultProps", "render").default;
                Patcher.before(Link.prototype, "onClick", (thisObject, args) => {
                    const event = args[0];
                    const url = event.currentTarget.href;

                    if (url) {
                        event.preventDefault();
                        BdApi.showConfirmationModal(
                            "Confirmation requise",
                            `Vous êtes sur le point d'ouvrir un lien externe :\n\n${url}\n\nÊtes-vous sûr ?`,
                            {
                                confirmText: "Oui",
                                cancelText: "Non",
                                onConfirm: () => {
                                    require("electron").shell.openExternal(url);
                                }
                            }
                        );
                    }
                });
            }
        };
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();