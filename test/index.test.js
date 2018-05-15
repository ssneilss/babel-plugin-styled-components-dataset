/* eslint-env jest */
import fs from 'fs';
import path from 'path';
import { transformFileSync } from 'babel-core';
import '../src';

describe('should transform styled-component', () => {
  const fixturesDir = path.join(__dirname, 'fixtures');
  fs.readdirSync(fixturesDir).forEach((caseName) => {
    it(`should ${caseName.replace(/-/g, ' ')}`, () => {
      const { code } = transformFileSync(`${path.join(fixturesDir, caseName)}/index.js`);
      expect(code).toMatchSnapshot();
    });
  });
});
