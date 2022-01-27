import { resolve } from 'path';
import { generator, parser } from '../';

const simple = resolve(__dirname, './simple.rpy');
// prettier-ignore
const simpleBlocks = [{"meta": {"id": "start_360a07ac", "lang": "english", "nointeract": true, "source": {"file": "game/simple.rpy", "line": "60"}}, "original": {"what": "Где я?", "who": null, "with": ""}, "pass": false, "translated": {"what": "Where am I?", "who": null, "with": ""}, "type": "say"}, {"meta": {"id": "start_0a380365", "lang": "english", "nointeract": false, "source": {"file": "game/simple.rpy", "line": "61"}}, "original": {"what": "Эй", "who": "\"???\"", "with": "with vpunch"}, "pass": false, "translated": {"what": "Hey", "who": "\"???\"", "with": "with vpunch"}, "type": "say"}, {"meta": {"id": "start_657e3772", "lang": "english", "nointeract": false, "source": {"file": "game/simple.rpy", "line": "62"}}, "original": {"what": "Не переводить это!", "who": "lola", "with": ""}, "pass": true, "translated": null, "type": "say"}, {"meta": {"id": "start_0a380365", "lang": "english", "nointeract": false, "source": {"file": "game/simple.rpy", "line": "63"}}, "original": {"what": "Привет. Как тебя зовут?", "who": "lola", "with": ""}, "pass": false, "translated": {"what": "Hello. What is your name?", "who": "lola", "with": ""}, "type": "say"}, {"meta": {"id": "start_e043801d", "lang": "english", "nointeract": false, "source": {"file": "game/simple.rpy", "line": "65"}}, "original": {"what": "Пустое поле", "who": "lola", "with": ""}, "pass": false, "translated": {"what": "", "who": "lola", "with": ""}, "type": "say"}, {"meta": {"id": "start_cc3273fc", "lang": "english", "nointeract": false, "source": {"file": "game/simple.rpy", "line": "66"}}, "original": {"what": "С тебя [cost] монет!", "who": "lola", "with": ""}, "pass": false, "translated": {"what": "Give me [cost] coins, now!", "who": "lola", "with": ""}, "type": "say"}, {"meta": {"id": "start_cc3273fd", "lang": "english", "nointeract": false, "source": {"file": "game/simple.rpy", "line": "67"}}, "original": {"what": "\\\"Destroyer\\\" Его звали \\\"3000\\\"", "who": "\"Girl\"", "with": ""}, "pass": false, "translated": {"what": "\\\"Destroyer\\\" His name was \\\"3000\\\"", "who": "\"Girl\"", "with": ""}, "type": "say"}, {"meta": {"id": "start_cc3273fd", "lang": "english", "nointeract": false, "source": {"file": "game/simple.rpy", "line": "67"}}, "original": {"what": "\\\"Destroyer\\\" \\\"3000\\\"", "who": null, "with": ""}, "pass": false, "translated": {"what": "\\\"Destroyer\\\" \\\"3000\\\"", "who": null, "with": ""}, "type": "say"}, {"meta": {"lang": "english", "source": {"file": "game/simple.rpy", "line": "53"}}, "original": {"nointeract": false, "what": "Введите ваше имя", "with": ""}, "translated": {"nointeract": false, "what": "Enter your name", "with": ""}, "type": "string"}, {"meta": {"lang": "english", "source": {"file": "game/simple.rpy", "line": "104"}}, "original": {"nointeract": false, "what": "Ты кто?", "with": ""}, "translated": {"nointeract": false, "what": "Who are you?", "with": ""}, "type": "string"}]

describe('parseFile', () => {
  it('parseFile', async () => {
    const blocks = await parser.parseFile(simple);
    expect(blocks).toEqual(simpleBlocks);
  });
});

describe('generator', () => {
  it('generatorFile', () => {
    const generated = generator.generateFile(simpleBlocks);
    expect(generated).toBeTruthy();
  });
});
