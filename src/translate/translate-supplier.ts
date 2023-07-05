import { AzureOfficialAPI } from './providers/azure-official-api';
import { AzureRapidAPI } from './providers/azure-rapid-api';
import { DeepRapidAPI } from './providers/deep-rapid-api';
import { GoogleOfficialAPI } from './providers/google-official-api';
import { LectoRapidAPI } from './providers/lecto-rapid-api';
import { LingvanexRapidAPI } from './providers/lingvanex-rapid-api';
import { NLPRapidAPI } from './providers/nlp-rapid-api';
import { DeepLProAPI } from './providers/deepl-pro-api';
import { DeepLFreeAPI } from './providers/deepl-free-api';
import { Translate } from './translate';

interface Providers {
  'google-official': GoogleOfficialAPI;
  'azure-official': AzureOfficialAPI;
  'azure-rapid': AzureRapidAPI;
  'deep-rapid': DeepRapidAPI;
  'lecto-rapid': LectoRapidAPI;
  'lingvanex-rapid': LingvanexRapidAPI;
  'nlp-rapid': NLPRapidAPI;
  'deepl-pro': DeepLProAPI;
  'deepl-free': DeepLFreeAPI;
}

export class TranslateSupplier {
  private static readonly providers: Providers = {
    'google-official': new GoogleOfficialAPI(),
    'azure-official': new AzureOfficialAPI(),
    'azure-rapid': new AzureRapidAPI(),
    'deep-rapid': new DeepRapidAPI(),
    'lecto-rapid': new LectoRapidAPI(),
    'lingvanex-rapid': new LingvanexRapidAPI(),
    'nlp-rapid': new NLPRapidAPI(),
    'deepl-pro': new DeepLProAPI(),
    'deepl-free': new DeepLFreeAPI(),
  };

  public static getProvider = (provider: string): Translate =>
    TranslateSupplier.providers[provider as keyof Providers];
}
