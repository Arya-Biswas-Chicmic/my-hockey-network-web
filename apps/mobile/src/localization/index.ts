/* eslint-disable import/no-named-as-default-member */
import en from '@/localization/resources/en.json';
import hi from '@/localization/resources/hi.json';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: en,
    hi: hi,
  },
  lng: 'en',
  fallbackLng: 'en',
});
export default i18n;
