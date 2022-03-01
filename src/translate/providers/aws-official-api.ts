import axios, { AxiosResponse } from 'axios';
import { JSONObj } from '../payload';
import { Translate } from '../translate';

export class AWSOfficialAPI extends Translate {
  protected callTranslateAPI = (valuesForTranslation: string[]): Promise<AxiosResponse> =>
    axios.get('');

  protected onSuccess = (
    response: AxiosResponse,
    originalObject: JSONObj,
    saveTo: string
  ): void => {};

  public translate = () => {
    console.log('AWS Official API not yet implemented.');
  };
}
