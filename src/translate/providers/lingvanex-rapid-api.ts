import axios, { AxiosResponse } from 'axios';
import { JSONObj } from '../payload';
import { Translate } from '../translate';

export class LingvanexRapidAPI extends Translate {
  protected callTranslateAPI = (valuesForTranslation: string[]): Promise<AxiosResponse> =>
    axios.get('');

  protected onSuccess = (
    response: AxiosResponse,
    originalObject: JSONObj,
    saveTo: string
  ): void => {};

  public translate = () => {
    console.log('Lingvanex Rapid API not yet implemented.');
  };
}
