import { LANGS, LANGUAGE_COOKIE_NAME, LANGUAGE_HEADER_NAME } from "@/lib/i18n";
import { getServiceUrlFromHeaders } from "@/lib/service-url";
import { getHostedLoginTranslation } from "@/lib/zitadel";
import { JsonObject } from "@zitadel/client";
import deepmerge from "deepmerge";
import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

// Static imports for all locales to ensure they're bundled in standalone mode
import frMessages from "../../locales/fr.json";
import enMessages from "../../locales/en.json";
import deMessages from "../../locales/de.json";
import esMessages from "../../locales/es.json";
import itMessages from "../../locales/it.json";
import jaMessages from "../../locales/ja.json";
import plMessages from "../../locales/pl.json";
import ruMessages from "../../locales/ru.json";
import zhMessages from "../../locales/zh.json";

const localeMap: Record<string, Record<string, unknown>> = {
  fr: frMessages,
  en: enMessages,
  de: deMessages,
  es: esMessages,
  it: itMessages,
  ja: jaMessages,
  pl: plMessages,
  ru: ruMessages,
  zh: zhMessages,
};

export default getRequestConfig(async () => {
  const fallback = "fr";
  const cookiesList = await cookies();

  let locale: string = fallback;

  const _headers = await headers();
  const { serviceUrl } = getServiceUrlFromHeaders(_headers);

  const languageHeader = await (await headers()).get(LANGUAGE_HEADER_NAME);
  if (languageHeader) {
    const headerLocale = languageHeader.split(",")[0].split("-")[0]; // Extract the language code
    if (LANGS.map((l) => l.code).includes(headerLocale)) {
      locale = headerLocale;
    }
  }

  const languageCookie = cookiesList?.get(LANGUAGE_COOKIE_NAME);
  if (languageCookie && languageCookie.value) {
    if (LANGS.map((l) => l.code).includes(languageCookie.value)) {
      locale = languageCookie.value;
    }
  }

  const i18nOrganization = _headers.get("x-zitadel-i18n-organization") || "";

  let translations: JsonObject | {} = {};
  try {
    const i18nJSON = await getHostedLoginTranslation({
      serviceUrl,
      locale,
      organization: i18nOrganization,
    });

    if (i18nJSON) {
      translations = i18nJSON;
    }
  } catch (error) {
    console.warn("Error fetching custom translations:", error);
  }

  const customMessages = translations;
  const localeMessages = localeMap[locale] || localeMap[fallback];
  const fallbackMessages = localeMap[fallback];

  return {
    locale,
    messages: deepmerge.all([
      customMessages,
      fallbackMessages,
      localeMessages,
    ]) as Record<string, string>,
  };
});
