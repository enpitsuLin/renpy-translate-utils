import path from "path";
import { parseFile } from "../src/parser";
import generator from "../src/generator";

(async () => {
  const file = path.join(__dirname, "simple.rpy");
  const blocks = await parseFile(file);

  console.dir(blocks, { depth: 4 });

  const newFile = generator.generateFile(blocks, { language: "spanish" });

  console.log(newFile);
})();
