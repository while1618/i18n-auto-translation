type JSONValue = string | { [x: string]: JSONValue };

export interface JSONObj {
  [x: string]: JSONValue;
}

export interface AzureTranslateResponse {
  data: [{ translations: [{ text: string }] }];
}

export interface JustTranslateResponse {
  data: { text: string[] };
}

export interface DeepTranslateResponse {
  data: { data: { translations: { translatedText: string } } };
}

export interface NLPTranslateResponse {
  data: { translated_text: { [x: string]: string } };
}
