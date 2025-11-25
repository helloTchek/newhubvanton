import { common } from './common';
import { company } from './company';
import { users } from './users';
import { settings } from './settings';
import { vehicles } from './vehicles';
import { apiToken } from './apiToken';
import { events } from './events';
import { costs } from './costs';
import { workflows } from './workflows';
import { shootInspect } from './shootInspect';

export const fr = {
  common,
  company,
  users,
  settings,
  vehicles,
  apiToken,
  events,
  costs,
  workflows,
  shootInspect,
} as const;
