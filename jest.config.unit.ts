import type { Config } from '@jest/types';

import base from './jest.config';

const config: Config.InitialOptions = { ...base, testRegex: '.*\\.spec\\.ts$' };

export default config;
