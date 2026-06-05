import { promises as fs } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const srcRoot = path.join(repoRoot, "src");
const outputFile = path.join(srcRoot, "lib", "translation-catalog.ts");

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }
    if (/\.(ts|tsx)$/.test(entry.name) && entry.name !== "translation-catalog.ts") {
      files.push(fullPath);
    }
  }

  return files;
}

function decodeQuotedString(value) {
  try {
    return JSON.parse(`"${value}"`);
  } catch {
    return value;
  }
}

function escapeAscii(value) {
  return JSON.stringify(value).replace(/[^\x20-\x7E]/g, (char) => {
    const code = char.charCodeAt(0);
    return `\\u${code.toString(16).padStart(4, "0")}`;
  });
}

function addEntry(map, english, spanish) {
  const normalizedEnglish = english.trim();
  const normalizedSpanish = spanish.trim();
  if (!normalizedEnglish || !normalizedSpanish) return;
  if (!map.has(normalizedEnglish)) {
    map.set(normalizedEnglish, normalizedSpanish);
  }
}

function extractPairsFromContent(content, map) {
  const callPatterns = [
    /\btr\(\s*"((?:\\.|[^"\\])*)"\s*,\s*"((?:\\.|[^"\\])*)"/g,
    /\btranslateCurrent\(\s*"((?:\\.|[^"\\])*)"\s*,\s*"((?:\\.|[^"\\])*)"/g,
  ];

  for (const pattern of callPatterns) {
    for (const match of content.matchAll(pattern)) {
      addEntry(map, decodeQuotedString(match[1]), decodeQuotedString(match[2]));
    }
  }
}

function extractAdminUiCopy(content, map) {
  const blockMatch = content.match(/const ADMIN_UI_COPY: Record<string, string> = \{([\s\S]*?)\n\};/);
  if (!blockMatch) return;

  const entryPattern = /"((?:\\.|[^"\\])*)"\s*:\s*"((?:\\.|[^"\\])*)"/g;
  for (const match of blockMatch[1].matchAll(entryPattern)) {
    addEntry(map, decodeQuotedString(match[1]), decodeQuotedString(match[2]));
  }
}

async function main() {
  const files = await walk(srcRoot);
  const map = new Map();

  for (const file of files) {
    const content = await fs.readFile(file, "utf8");
    extractPairsFromContent(content, map);
    if (file.endsWith(`${path.sep}admin.tsx`)) {
      extractAdminUiCopy(content, map);
    }
  }

  const rows = [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(
      ([english, spanish]) =>
        `  { english: ${escapeAscii(english)}, spanish: ${escapeAscii(spanish)} },`,
    )
    .join("\n");

  const output = `export type TranslationCatalogEntry = {\n  english: string;\n  spanish: string;\n};\n\nexport const translationCatalog: TranslationCatalogEntry[] = [\n${rows}\n];\n`;

  await fs.writeFile(outputFile, output, "utf8");
  console.log(`Wrote ${map.size} translation entries to ${path.relative(repoRoot, outputFile)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
