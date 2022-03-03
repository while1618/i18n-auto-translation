type JSONValue = string | { [x: string]: JSONValue };

export interface JSONObj {
  [x: string]: JSONValue;
}

export interface GoogleTranslateResponse {
  data: object;
}

export interface AzureTranslateResponse {
  data: [{ translations: [{ text: string }] }];
}

export interface AWSTranslateResponse {
  data: object;
}

export interface DeepTranslateResponse {
  data: { data: { translations: { translatedText: string } } };
}

export interface JustTranslateResponse {
  data: { text: string[] };
}

export interface LectoTranslateResponse {
  data: { translations: [{ translated: string[] }] };
}

export interface LingvanexTranslateResponse {
  data: { result: string };
}

export interface NLPTranslateResponse {
  data: { translated_text: { [x: string]: string } };
}
