
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
  <a href="#translate-providers">Translate Providers</a> •
  <a href="#credits">Credits</a> •
  <a href="#license">License</a>
</p>

## Description

i18n-auto-translation helps you translate your JSON internationalization files. You need to pick one of the translate API providers we support, pass the subscription key, language to which you want to translate, path to the file or directory, and you are good to go.

## Installation

```bash
$ npm i i18n-auto-translation
```

## Usage

```bash
$ i18n-auto-translation -k SUBSCRIPTION_KEY -d PROJECT_DIR -t DESIRED_LANGUAGE
```

### Options

| Key                                       | Alias | Description                                                                                          | Default         |
| ----------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------- | --------------- |
| --help                                    | /     | Open CLI help                                                                                        | /               |
| --version                                 | /     | Check current version                                                                                | /               |
| --apiProvider                             | -a    | API Provider.                                                                                        | google-official |
| --key [required]                          | -k    | Subscription key for the API provider.                                                               | /               |
| --location                                | -l    | Your region. Used only by the Official Azure API.                                                    | global          |
| --filePath [filePath or dirPath required] | -p    | Path to the single JSON file you want to translate.                                                  | /               |
| --dirPath [filePath or dirPath required]  | -d    | Path to the directory in which you want to translate all JSON files(named <from>.json e.g. en.json). | /               |
| --from                                    | -f    | From which language you want to translate.                                                           | en              |
| --to [required]                           | -t    | To which language you want to translate.                                                             | /               |

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
  - Goto https://console.cloud.google.com/ and create new project.
  - In the search bar find “Cloud Translation API” and enable it.
  - Click on credentials -> Create credentials -> API key.
  - Copy the key and use it for your translations.
- Azure
  - Follow the instructions [here](https://docs.microsoft.com/en-us/azure/cognitive-services/translator/quickstart-translator?tabs=nodejs#prerequisites).
- RapidAPI
  - For all RapidAPI providers, create an account [here](https://rapidapi.com/).
  - Go to desired API and switch to the pricing section. There you will find instructions on how to subscribe to the API.
  - Now you can use your key provided from RapidAPI.


## Credits

This software uses the following open source packages:

- [yargs](https://github.com/yargs/yargs)
- [deep-object-diff](https://github.com/mattphillips/deep-object-diff)
- [just-extend](https://github.com/angus-c/just)
- [glob](https://github.com/isaacs/node-glob)
- [axios](https://github.com/axios/axios)
- [@google-cloud/translate](https://github.com/googleapis/nodejs-translate)
- [uuid](https://github.com/uuidjs/uuid)

## License

- [MIT](LICENSE)
