import type { InitOptions } from "i18next";

export const supportedLngs = ["en", "es", "hi", "ja", "zh"] as const;
export type SupportedLanguages = (typeof supportedLngs)[number];

export const defaultNS = "common";
export const fallbackLng: SupportedLanguages = "en";

export function getOptions(lng: SupportedLanguages | undefined): InitOptions {
  return {
    supportedLngs,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns: [defaultNS],
    resources: {
      en: {
        common: {
          greeting: "Hello",
          welcome: "Welcome to Spectral",
          hero: {
            title: "Spectral",
            description: "Focus on creating, let us handle the rest",
          },
        },
      },
      es: {
        common: {
          greeting: "Hola",
          welcome: "Bienvenido a Spectral",
          hero: {
            title: "Spectral",
            description: "Conecta tu podcast con el mundo",
          },
        },
      },
      hi: {
        common: {
          greeting: "नमस्ते",
          welcome: "स्पेक्ट्रल में आपका स्वागत है",
          hero: {
            title: "स्पेक्ट्रल",
            description:
              "आपके द्वारा बनाए गए विकास को हम बाकी सब को हासिल करेंगे",
          },
        },
      },
      ja: {
        common: {
          greeting: "こんにちは",
          welcome: "スペクトラルにごようび",
          hero: {
            title: "スペクトラル",
            description: "創造に集中し、残りのすべてを私たちに任せましょう",
          },
        },
      },
      zh: {
        common: {
          greeting: "你好",
          welcome: "欢迎来到Spectral",
          hero: {
            title: "Spectral",
            description: "专注于创造，让我们处理剩下的",
          },
        },
      },
    },
  };
}

export const languageNames: Record<SupportedLanguages, string> = {
  en: "English",
  es: "Español",
  hi: "हिन्दी",
  ja: "日本語",
  zh: "中文",
};
