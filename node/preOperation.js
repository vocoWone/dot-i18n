const tsNode = require("ts-node");
const path = require("path");
const fs = require("fs-extra");
const i18nStore = require("./i18n-store");

const defaultConfig = {
    localePath: "/src/locales",
    languages: ["zh", "en"],
    template: "i18n",
    exportExcelPath: "/.i18n/result.xlsx",
    importExcelPath: "/.i18n/result.xlsx",
};

function execute() {
    const configFilePath = path.resolve(__dirname, "../config/node.tsconfig.json");
    tsNode.register({project: configFilePath});

    try {
        const config = {...defaultConfig, ...JSON.parse(fs.readFileSync(process.cwd() + "/i18n.json"))};
        i18nStore.setConfig(config);

        const localePath = process.cwd() + config.localePath + "/index.ts";

        if (fs.pathExistsSync(localePath)) {
            const allLocales = require(process.cwd() + config.localePath + "/index.ts").default;
            i18nStore.setLocales(allLocales);
        } else {
            const locales = {};
            config.languages.forEach((_) => {
                locales[_] = {};
            });
            i18nStore.setLocales(locales);
        }

        const reverseLocale = {};
        const mainLanguage = config.languages[0];
        const mainLanguageLocalePath = `${process.cwd()}${config.localePath}/${mainLanguage}.ts`;
        if (fs.pathExistsSync(localePath) && fs.pathExistsSync(mainLanguageLocalePath)) {
            const accordingCodeLocale = require(mainLanguageLocalePath).default;
            Object.keys(accordingCodeLocale).forEach((_) => {
                const subLocale = accordingCodeLocale[_];
                Object.keys(subLocale).forEach((__) => {
                    if (!reverseLocale[_]) {
                        reverseLocale[_] = {};
                    }
                    reverseLocale[_][subLocale[__]] = __;
                });
            });
            i18nStore.setReverseLocale(reverseLocale);
        }
    } catch (error) {
        console.info(error);
    }
}

if (!i18nStore.getConfig()) {
    execute();
}
