import { resolve } from 'path';
import { parseFile } from '../src/parser';
import generator from '../src/generator';

describe('parseFile', () => {
  it('', async () => {
    expect(generator.generateFile(await parseFile(resolve(__dirname, './simple.rpy')))).toBeTruthy();
  });
});
