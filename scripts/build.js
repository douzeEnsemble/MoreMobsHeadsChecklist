import { appVersion } from '../.github/scripts/app-version.mjs';
import { buildSite } from './build-site.js';

buildSite({
  root: process.cwd(),
  out: process.env.SITE_OUT ?? '_site',
  version: appVersion(),
});
console.log('Site construit');
