import axios, { AxiosResponse } from 'axios';
import { JSONObj } from '../payload';
import { Translate } from '../translate';

export class NLPRapidAPI extends Translate {
  protected callTranslateAPI = (valuesForTranslation: string[]): Promise<AxiosResponse> =>
    axios.get('');

  protected onSuccess = (
    response: AxiosResponse,
    originalObject: JSONObj,
    saveTo: string
  ): void => {};

  public translate = () => {
    console.log('NLP Rapid API not yet implemented.');
  };
}
