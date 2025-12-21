/**
 * health-check service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::health-check.health-check');
