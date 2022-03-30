
<h1 align="center">
  <br>
  i18n-auto-translation
  <br>
</h1>

<h4 align="center">Auto translate i18n JSON file(s) to desired language(s).</h4>

<p align="center">
  <a href="#description">Description</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#demo">Demo</a> •
  <a href="#translate-providers">Translate Providers</a> •
  <a href="#credits">Credits</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/i18n-auto-translation" alt="NPM Version">
    <img src="https://img.shields.io/badge/npm-v1.1.9-blue" />
  </a>
  <a href="LICENSE" alt="License">
    <img src="https://img.shields.io/github/license/while1618/i18n-auto-translation" />
  </a>
</p>
  
## Description

i18n-auto-translation helps you translate your JSON internationalization files. You need to pick one of the translation API providers that are supported, pass the subscription key, language to which you want to translate, path to the file or directory, and you are good to go.

### How It Works?

- If there is no translation for the file you provided, the complete file will be translated, and the new file will be created with the same structure as the original file, keeping the keys in original language, and translating only values.
- You can pass a file with the nested JSON objects, and everything will be translated as you expect.
- The newly created file will be named [to].json. (e.g. sr_latn.json)
- If the translation for the file already exists, the tool will only translate newly added lines, or delete the one that are no longer in the original file, keeping the structure same as the original file.
- Don't worry, tool will call an API only for the newly created lines, already translated one will be skipped.
- Translate APIs are not ideal, and that's why you will need from time to time to override some translations manually, when you manually translate some value, the tool will keep that value, and won't try to translate it again.
- If you pass a directory, the tool will recursively find all files named [from].json (e.g. en.json), and the translations will be saved in the same directory as the original file(s). All the described above will be still applicable. 

## Installation

You can install package globally on your machine:

```bash
$ npm i -g i18n-auto-translation
```

Or save it as dev dependency in your project:

```bash
$ npm i -D i18n-auto-translation
```

## Usage

```bash
$ i18n-auto-translation -k SUBSCRIPTION_KEY -d PROJECT_DIR -t DESIRED_LANGUAGE
```

### Options

| Key                                       | Alias | Description                                                                                            | Default         |
| ----------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------ | --------------- |
| --help                                    | /     | All available options.                                                                                 | /               |
| --version                                 | /     | Current version.                                                                                       | /               |
| --apiProvider                             | -a    | API Provider.                                                                                          | google-official |
| --key [required]                          | -k    | Subscription key for the API provider.                                                                 | /               |
| --location                                | -l    | Your region. Used only by the Official Azure API.                                                      | global          |
| --filePath [filePath or dirPath required] | -p    | Path to a single JSON file.                                                                            | /               |
| --dirPath [filePath or dirPath required]  | -d    | Path to a directory in which you will recursively find all JSON files named [from].json (e.g. en.json) | /               |
| --from                                    | -f    | From which language you want to translate.                                                             | en              |
| --to [required]                           | -t    | To which language you want to translate.                                                               | /               |

## Demo

https://user-images.githubusercontent.com/49982438/158603886-23c9978b-56e0-4f50-a1ce-afdb03ef1291.mp4

## Translate Providers

| Provider                                                                                                                          | CLI usage       |
| --------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| [Google Translate Official](https://cloud.google.com/translate/)                                                                  | google-official |
| [Azure Translator Official](https://azure.microsoft.com/en-us/services/cognitive-services/translator/)                            | azure-official  |
| [Azure Translator RapidAPI](https://rapidapi.com/microsoft-azure-org-microsoft-cognitive-services/api/microsoft-translator-text/) | azure-rapid     |
| [Deep Translate RapidAPI](https://rapidapi.com/gatzuma/api/deep-translate1/)                                                      | deep-rapid      |
| [Just Translated RapidAPI](https://rapidapi.com/lebedev.str/api/just-translated/)                                                 | just-rapid      |
| [Lecto Translation RapidAPI](https://rapidapi.com/lecto-lecto-default/api/lecto-translation/)                                     | lecto-rapid     |
| [Lingvanex Translate RapidAPI](https://rapidapi.com/Lingvanex/api/lingvanex-translate/)                                           | lingvanex-rapid |
| [NLP Translation RapidAPI](https://rapidapi.com/gofitech/api/nlp-translation/)                                                    | nlp-rapid       |

### Obtaining keys

- Google
  - Goto https://console.cloud.google.com/ and create a new project.
  - In the search bar find “Cloud Translation API” and enable it.
  - Click on credentials -> Create credentials -> API key.
  - Copy the key and use it.
- Azure
  - Follow the instructions [here](https://docs.microsoft.com/en-us/azure/cognitive-services/translator/quickstart-translator?tabs=nodejs#prerequisites).
- RapidAPI
  - For all RapidAPI providers, create an account [here](https://rapidapi.com/).
  - Go to desired API and switch to the pricing section. There you will find instructions on how to subscribe to the API.
  - Now you can use your key provided from RapidAPI.

### Adding Provider

You don't like supported API providers? You can easily add yours. Go to src/translate/providers, create class for your provider, extend 'Translate' class, and implement 'callTranslateAPI' method. You can check in other providers for examples on how to implement this method. After you added your provider, you just need to register it in 'translate-supplier.ts' and in 'cli.ts' and you are good to go.

## Credits

This software uses the following open source packages:

- [yargs](https://github.com/yargs/yargs)
- [deep-object-diff](https://github.com/mattphillips/deep-object-diff)
- [just-extend](https://github.com/angus-c/just)
- [glob](https://github.com/isaacs/node-glob)
- [axios](https://github.com/axios/axios)
- [@google-cloud/translate](https://github.com/googleapis/nodejs-translate)
- [html-entities](https://github.com/mdevils/html-entities)
- [uuid](https://github.com/uuidjs/uuid)

## License

- [MIT](LICENSE)
