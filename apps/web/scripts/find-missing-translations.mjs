import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const MESSAGES_PATH = path.join(PROJECT_ROOT, 'messages', 'ar.json');
const REPORT_PATH = path.join(PROJECT_ROOT, 'missing-translations.md');

// Load translations
let translations = {};
try {
    const content = fs.readFileSync(MESSAGES_PATH, 'utf8');
    translations = JSON.parse(content);
} catch (e) {
    console.error("Failed to load messages/ar.json", e);
    process.exit(1);
}

function getFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

function checkKey(keyPath) {
    const parts = keyPath.split('.');
    let current = translations;
    for (const part of parts) {
        if (current === undefined || current === null) return false;
        current = current[part];
    }
    return current !== undefined;
}

// Helper to find the block scope of a node
function findScope(node) {
    let parent = node.parent;
    while (parent) {
        if (ts.isBlock(parent) || ts.isSourceFile(parent) || ts.isFunctionLike(parent)) {
            return parent;
        }
        parent = parent.parent;
    }
    return undefined;
}

// Check if scope contains node
function isDescendant(parent, child) {
    let node = child;
    while (node) {
        if (node === parent) return true;
        node = node.parent;
    }
    return false;
}

const files = getFiles(SRC_DIR);
const missingKeys = new Map(); // Map<string, Set<string>>

console.log('Scanning for missing translations...');

files.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.Latest,
        true
    );

    const definitions = [];

    function visitDefs(node) {
        // Case 1: useTranslations hook
        if (ts.isVariableDeclaration(node) && node.initializer && ts.isCallExpression(node.initializer)) {
            const expr = node.initializer.expression;
            if (ts.isIdentifier(expr) && expr.text === 'useTranslations') {
                const args = node.initializer.arguments;
                if (args.length > 0 && ts.isStringLiteral(args[0])) {
                    const namespace = args[0].text;
                    if (ts.isIdentifier(node.name)) {
                        definitions.push({
                            name: node.name.text,
                            namespace: namespace,
                            scope: findScope(node),
                            pos: node.getStart()
                        });
                    }
                }
            }
        }
        // Case 2: Function parameters named 't' (or similar)
        else if (ts.isParameter(node) && ts.isIdentifier(node.name)) {
            const paramName = node.name.text;
            // Heuristic: if parameter is named 't', 'tCommon', 'tValidation', etc.
            if (paramName === 't' || paramName.startsWith('t') && paramName.length > 1 && paramName[1] === paramName[1].toUpperCase()) {
                 definitions.push({
                    name: paramName,
                    namespace: null, // Namespace is unknown
                    scope: findScope(node),
                    pos: node.getStart()
                });
            }
        }
        ts.forEachChild(node, visitDefs);
    }
    visitDefs(sourceFile);

    function visitUsages(node) {
        if (ts.isCallExpression(node)) {
            let varName = null;
            if (ts.isIdentifier(node.expression)) {
                varName = node.expression.text;
            } else if (ts.isPropertyAccessExpression(node.expression) && ts.isIdentifier(node.expression.expression)) {
                varName = node.expression.expression.text;
            }

            if (varName) {
                // Find matching definition
                const matches = definitions.filter(def => 
                    def.name === varName && 
                    def.pos < node.getStart() &&
                    isDescendant(def.scope, node)
                );

                if (matches.length > 0) {
                    // Sort by pos descending to find the closest definition (shadowing support)
                    matches.sort((a, b) => b.pos - a.pos);
                    const def = matches[0];

                    const args = node.arguments;
                    if (args.length > 0 && ts.isStringLiteral(args[0])) {
                        const key = args[0].text;
                        
                        if (def.namespace) {
                            // Standard check with known namespace
                            const fullKey = `${def.namespace}.${key}`;
                            if (!checkKey(fullKey)) {
                                reportMissing(fullKey, node);
                            }
                        } else {
                            // Loose check: check if key exists in ANY namespace
                            // We assume the key might be "Namespace.key" or just "key"
                            // If it's just "key", we can't easily verify it without checking ALL namespaces.
                            // But often these helpers are passed a specific namespace's t function.
                            
                            // Strategy: 
                            // 1. Check if 'key' exists as a full path (e.g. "Common.error")
                            // 2. If not, check if 'key' exists in ANY top-level namespace as a leaf
                            
                            let found = checkKey(key);
                            
                            if (!found) {
                                // Search deeply for the key in any namespace
                                const searchDeep = (obj, targetKey) => {
                                    for (const k in obj) {
                                        if (k === targetKey) return true;
                                        if (typeof obj[k] === 'object' && obj[k] !== null) {
                                            if (searchDeep(obj[k], targetKey)) return true;
                                        }
                                    }
                                    return false;
                                };
                                
                                found = searchDeep(translations, key);
                            }

                            if (!found) {
                                reportMissing(key + " (unknown namespace)", node);
                            }
                        }
                    }
                }
            }
        }
        ts.forEachChild(node, visitUsages);
    }

    function reportMissing(key, node) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        const location = `${path.relative(PROJECT_ROOT, filePath)}:${line + 1}`;
        
        if (!missingKeys.has(key)) {
            missingKeys.set(key, new Set());
        }
        missingKeys.get(key).add(location);
    }

    visitUsages(sourceFile);
});

// Generate Report
let reportContent = `# Missing Translations Report\n\n`;
reportContent += `Generated on: ${new Date().toLocaleString()}\n`;
reportContent += `Total Unique Missing Keys: ${missingKeys.size}\n\n`;

const sortedKeys = Array.from(missingKeys.keys()).sort();

sortedKeys.forEach(key => {
    reportContent += `### \`${key}\`\n`;
    const locations = Array.from(missingKeys.get(key));
    locations.forEach(loc => {
        reportContent += `- ${loc}\n`;
    });
    reportContent += '\n';
});

fs.writeFileSync(REPORT_PATH, reportContent);
console.log(`Report generated at: ${REPORT_PATH}`);
console.log(`Found ${missingKeys.size} unique missing keys.`);
