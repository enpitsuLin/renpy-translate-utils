import { readFile, readdir, stat } from "fs/promises";
import path from "path";
import { Block } from "./block";

const REGEX_SOURCE = /^# ((?:.+[\/|\\])+.+\.\w+):+(\d+)/;
const REGEX_META = /^translate (\w+) (.+):/;
const REGEX_SAY = /^(?:#\s)?("?.+?"?\s)?"(.*?)"(\snointeract)?(\swith (?:[^\s]*))?$/;

const parseSayLine = (line) => {
  const reg = line.match(REGEX_SAY);
  let who = null;
  let what = "";
  let nointeract = false;
  let withEffect = "";

  if (!reg) return null;

  who = reg[1];
  what = reg[2];
  nointeract = reg[3] === " nointeract";
  withEffect = (reg[4] || "").trim();

  if (who) who = who.trim();
  what = what.trim();

  return {
    who,
    what,
    with: withEffect,
    nointeract
  };
};

const parseSource = (line) => {
  const reg = line.match(REGEX_SOURCE);

  if (!reg) return null;

  const [, file, lineNum] = reg;

  return {
    file,
    line: lineNum
  };
};

/**
 * Parse Ren'Py translation file
 *
 * @async
 * @param {string} filePath Path to the file
 * @return {Promise<array>} Array of blocks with info
 */
export async function parseFile(filePath: string) {
  if (!filePath) throw new Error("File path is missing.");

  const fileContent = await readFile(filePath, "utf8");

  return parseFileContent(fileContent);
}

/**
 * Parse Ren'Py translation file
 *
 * @param {string} file File content
 * @return {array} Array of blocks with info
 */
export function parseFileContent(file: string): any[] {
  const lines = file.split(/\r|\n/);
  const blocks: Block[] = [];
  let currentLanguage = "";

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    if (line.startsWith("translate ")) {
      if (line.match(/strings:/)) {
        // This catch language for strings
        const [, lang] = line.match(REGEX_META);

        currentLanguage = lang;
        continue;
      }

      const [, lang, id] = line.match(REGEX_META);
      let source = null;
      let original = null;
      let translated = null;

      if (i > 0) {
        const prevLine = lines[i - 1].trim();

        if (prevLine.startsWith("# ")) {
          source = parseSource(prevLine);
        }
      }

      line = lines[++i].trim();
      if (line === "") line = lines[++i].trim();

      if (line.startsWith("# ")) {
        original = parseSayLine(line);
      }

      let pass = false;
      line = lines[++i].trim();
      if (line !== "pass" && line.match(REGEX_SAY)) {
        translated = parseSayLine(line);
      } else if (line === "pass") {
        pass = true;
      }

      let nointeract = false;

      if (original) {
        nointeract = original.nointeract;
        delete original.nointeract;
        if (translated) delete translated.nointeract;
      }

      blocks.push({
        type: "say",
        meta: {
          lang,
          id,
          source,
          nointeract
        },
        original,
        translated,
        pass
      } as Block);
    } else if (line.startsWith("old")) {
      let source = null;

      if (i > 0) {
        const prevLine = lines[i - 1].trim();

        if (prevLine.startsWith("# ")) {
          source = parseSource(prevLine);
        }
      }

      const original = parseSayLine(line);
      delete original.who;

      line = lines[++i].trim();

      const translated = parseSayLine(line);
      delete translated.who;

      blocks.push({
        type: "string",
        meta: {
          source,
          lang: currentLanguage
        },
        original,
        translated
      } as Block);
    }
  }

  return blocks;
}

interface Folder {
  path: string;
  type: string;
  children?: (string | Folder)[];
}


/**
 * process `language folder` to parse all language file
 * @desc WIP
 */
export async function parseLanguageFolder(folderPath: string) {
  const data: Folder = {
    path: folderPath,
    type: "folder",
    children: []
  };

  const children = await readdir(folderPath);
  data.children = children;

  await Promise.all(
    children.map(async (file) => {
      let fileObj = {
        path: path.join(folderPath, file),
        type: "file"
      };

      const stats = await stat(fileObj.path);

      if (stats.isDirectory()) {
        fileObj = await parseLanguageFolder(fileObj.path);
      } else if (fileObj.path.endsWith(".rpy")) {
        fileObj.type = "file";
      }

      data.children.push(fileObj);
    })
  );

  return data;
}
