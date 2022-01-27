import groupBy from 'lodash.groupby';
import Mustache from 'mustache';
import templates from './templates';

const generateDefaults = {
  language: 'english',
  templates
};

const generator = {
  /**
   * Generate Ren'Py translation file
   *
   * @param {array} data Array of blocks from parser
   * @param {object} [options] Options
   * @param {string} [options.language] New language
   * @return {string}
   */
  generateFile(data: any[], options = {}) {
    const realOptions = {
      ...generateDefaults,
      ...options
    };
    const { language } = realOptions;

    const grouppedData = groupBy(data, 'type');

    const renderData = {
      ...grouppedData,
      date: new Date(),
      language
    };

    const text = Mustache.render(realOptions.templates.main, renderData, realOptions.templates.partials);

    return text;
  }
};

export default generator;
