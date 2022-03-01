import axios, { AxiosResponse } from 'axios';
import { JSONObj } from '../payload';
import { Translate } from '../translate';

export class GoogleOfficialAPI extends Translate {
  protected callTranslateAPI = (valuesForTranslation: string[]): Promise<AxiosResponse> =>
    axios.get('');

  protected onSuccess = (
    response: AxiosResponse,
    originalObject: JSONObj,
    saveTo: string
  ): void => {};

  public translate = () => {
    console.log('Google Official API not yet implemented.');
  };
}
