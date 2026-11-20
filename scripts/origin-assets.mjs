import { mkdir, readFile, writeFile } from "node:fs/promises";
import ts from "typescript";

const source = new URL("../components/motion/", import.meta.url);
const output = new URL("../public/motion/origin/", import.meta.url);
await mkdir(output, { recursive: true });

for (const name of ["origin-word", "brand-particles"]) {
  const input = await readFile(new URL(name + ".ts", source), "utf8");
  const { outputText } = ts.transpileModule(input, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
      removeComments: true,
    },
  });
  await writeFile(new URL(name + ".js", output), outputText);
}
