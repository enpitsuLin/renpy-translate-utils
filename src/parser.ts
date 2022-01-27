import { readFile, readdir, stat } from "fs/promises";
import { Block } from "./block";
import path from "path";

const REGEX_SOURCE = /^# ((?:.+[\/|\\])+.+\.\w+):+(\d+)/;
const REGEX_META = /^translate (\w+) (.+):/;
const REGEX_SAY = /^(?:#\s)?("?.+?"?\s)?"(.*?)"(\snointeract)?(\swith (?:[^\s]*))?$/;

/**
 * parse dialog saying line
 */
function parseSayLine(line: string) {
  const reg = line.match(REGEX_SAY);

  if (!reg) return null;

  let [, who = null, what = "", nointeract, withEffect = ""] = reg;

  if (who) who = who.trim();
  what = what.trim();
  withEffect = withEffect.trim();

  return {
    who,
    what,
    with: withEffect,
    nointeract: nointeract == " nointeract"
  };
}

/**
 * parse source
 */
function parseSource(str: string) {
  const reg = str.match(REGEX_SOURCE);
  if (!reg) return null;
  const [, file, line] = reg;
  return { file, line };
}

/**
 * Parse Ren'Py translation file
 *
 * @async
 * @param filePath Path to the file
 * @return Array of blocks with info
 */
export async function parseFile(filePath: string): Promise<Block[]> {
  if (!filePath) throw new Error("File path is missing.");

  const fileContent = await readFile(filePath, "utf8");

  return parseFileContent(fileContent);
}

/**
 * Parse Ren'Py translation file
 *
 * @param file File content
 * @return Array of blocks with info
 */
export function parseFileContent(file: string): Block[] {
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
        meta: { lang, id, source, nointeract },
        original,
        translated,
        pass
      });
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
        meta: { source, lang: currentLanguage },
        original,
        translated
      });
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
