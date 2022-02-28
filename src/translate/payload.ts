type JSONValue = string | { [x: string]: JSONValue };

export interface JSONObj {
  [x: string]: JSONValue;
}

export interface AzureTranslateResponse {
  data: [{ translations: AzureTranslateResponseValue[] }];
}

export interface AzureTranslateResponseValue {
  text: string;
}

export interface JustTranslateResponse {
  data: { text: string[] };
}
