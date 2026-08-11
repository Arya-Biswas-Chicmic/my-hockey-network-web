import { t } from 'i18next';

export const STRINGS = new Proxy(
  {
    HI: 'HI',
  },
  {
    get: function (target, prop) {
      return t(target[prop as keyof typeof target]);
    },
  },
);
