import 'i18next';
import { en } from '../locales/en';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof en.common;
      company: typeof en.company;
      users: typeof en.users;
      settings: typeof en.settings;
      vehicles: typeof en.vehicles;
      apiToken: typeof en.apiToken;
      events: typeof en.events;
      costs: typeof en.costs;
      workflows: typeof en.workflows;
      shootInspect: typeof en.shootInspect;
    };
  }
}
