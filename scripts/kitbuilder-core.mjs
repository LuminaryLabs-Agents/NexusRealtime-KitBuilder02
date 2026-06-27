import fs from 'node:fs/promises';
import path from 'node:path';

export const KIT_STATES = Object.freeze([
  'idea_captured',
  'idea_normalized',
  'domain_classified',
  'scope_locked',
  'risk_audited',
  'api_drafted',
  'manifest_seeded',
  'scaffold_generated',
  'contracts_defined',
  'implementation_started',
  'implementation_complete',
  'unit_tested',
  'integration_tested',
  'example_1_local',
  'example_2_hosted',
  'example_3_live_or_edge',
  'documentation_complete',
  'quality_gated',
  'registry_ready',
  'promotion_ready'
]);

export const KIT_STATE_META = Object.freeze({
  idea_captured: { index: 1, category: 'ideation', artifact: 'idea.md' },
  idea_normalized: { index: 2, category: 'ideation', artifact: '.kitbuilder/projects/<kit-id>/brief.md' },
  domain_classified: { index: 3, category: 'ideation', artifact: 'kind/browserSafe/nodeSafe' },
  scope_locked: { index: 4, category: 'ideation', artifact: 'SCOPE.md' },
  risk_audited: { index: 5, category: 'ideation', artifact: 'RISK.md' },
  api_drafted: { index: 6, category: 'design', artifact: 'API.md' },
  manifest_seeded: { index: 7, category: 'design', artifact: 'kit.manifest.json' },
  scaffold_generated: { index: 8, category: 'design', artifact: 'standard kit scaffold' },
  contracts_defined: { index: 9, category: 'design', artifact: 'contracts/schema/state-machine files' },
  implementation_started: { index: 10, category: 'build', artifact: 'src/index.js' },
  implementation_complete: { index: 11, category: 'build', artifact: 'manifest exports exist' },
  unit_tested: { index: 12, category: 'build', artifact: 'unit test' },
  integration_tested: { index: 13, category: 'build', artifact: 'integration test' },
  example_1_local: { index: 14, category: 'proof', artifact: 'examples/local-basic' },
  example_2_hosted: { index: 15, category: 'proof', artifact: 'examples/hosted-integration' },
  example_3_live_or_edge: { index: 16, category: 'proof', artifact: 'examples/live-or-edge' },
  documentation_complete: { index: 17, category: 'proof', artifact: 'README/API/SCOPE/RISK/examples docs' },
  quality_gated: { index: 18, category: 'release', artifact: 'kit:check + tests' },
  registry_ready: { index: 19, category: 'release', artifact: 'dist registry entry' },
  promotion_ready: { index: 20, category: 'release', artifact: '.promotions/<kit-id>' }
});

export const REQUIRED_EXAMPLES = Object.freeze(['local-basic', 'hosted-integration', 'live-or-edge']);
export const PROJECT_ROOT = process.cwd();

export function parseArgs(argv = process.argv.slice(2)) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) args[key] = true;
      else {
        args[key] = next;
        i += 1;
      }
    } else args._.push(token);
  }
  return args;
}

export async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

export async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export async function listKitIds() {
  const kitsDir = path.join(PROJECT_ROOT, 'kits');
  try {
    const entries = await fs.readdir(kitsDir, { withFileTypes: true });
    return entries.filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
  } catch {
    return [];
  }
}

export function kitPath(kitId, ...parts) {
  return path.join(PROJECT_ROOT, 'kits', kitId, ...parts);
}

export function projectPath(kitId, ...parts) {
  return path.join(PROJECT_ROOT, '.kitbuilder', 'projects', kitId, ...parts);
}

export function issuePath(status, issueId) {
  return path.join(PROJECT_ROOT, '.kitbuilder', 'issues', status, `${issueId}.json`);
}

export function nowIso() {
  return new Date().toISOString();
}

export function stateIndex(state) {
  const idx = KIT_STATES.indexOf(state);
  return idx < 0 ? 0 : idx + 1;
}

export function stateAtIndex(index) {
  return KIT_STATES[Math.max(0, Math.min(KIT_STATES.length - 1, index - 1))];
}

export async function readKitManifest(kitId) {
  return readJson(kitPath(kitId, 'kit.manifest.json'), null);
}

export async function readProject(kitId) {
  const existing = await readJson(projectPath(kitId, 'kit.project.json'), null);
  if (existing) return existing;
  const manifest = await readKitManifest(kitId);
  return createProjectRecord({ kitId, manifest });
}

export function createProjectRecord({ kitId, manifest = null, state = 'idea_captured', owner = 'agent' } = {}) {
  const now = nowIso();
  return {
    kitId,
    title: manifest?.name ?? kitId,
    currentState: state,
    stateIndex: stateIndex(state),
    totalStates: KIT_STATES.length,
    status: manifest?.status ?? 'experimental',
    kind: manifest?.kind ?? 'browser-runtime',
    owner,
    createdAt: now,
    updatedAt: now,
    artifacts: defaultArtifacts(kitId),
    gates: {},
    history: [{ state, at: now, note: 'Project record created.' }]
  };
}

export function defaultArtifacts(kitId) {
  return {
    idea: `kits/${kitId}/idea.md`,
    manifest: `kits/${kitId}/kit.manifest.json`,
    readme: `kits/${kitId}/README.md`,
    api: `kits/${kitId}/API.md`,
    scope: `kits/${kitId}/SCOPE.md`,
    risk: `kits/${kitId}/RISK.md`,
    examples: REQUIRED_EXAMPLES.map(id => `kits/${kitId}/examples/${id}`),
    tests: [`tests/${kitId}.test.js`]
  };
}

export async function saveProject(project, note = null) {
  const next = { ...project, updatedAt: nowIso() };
  if (note) next.history = [...(next.history ?? []), { state: next.currentState, at: next.updatedAt, note }];
  await writeJson(projectPath(next.kitId, 'kit.project.json'), next);
  return next;
}

export async function hasExample(kitId, exampleId) {
  return (await exists(kitPath(kitId, 'examples', exampleId, 'README.md'))) &&
    ((await exists(kitPath(kitId, 'examples', exampleId, 'index.js'))) || (await exists(kitPath(kitId, 'examples', exampleId, 'index.html'))));
}

export async function manifestExportsExist(kitId, manifest) {
  if (!manifest?.entry || !Array.isArray(manifest.exports)) return false;
  const entryPath = kitPath(kitId, manifest.entry);
  try {
    const source = await fs.readFile(entryPath, 'utf8');
    return manifest.exports.every(name => source.includes(name));
  } catch {
    return false;
  }
}

export async function computeGates(kitId) {
  const manifest = await readKitManifest(kitId);
  const gates = {
    idea_captured: await exists(kitPath(kitId, 'idea.md')),
    idea_normalized: await exists(projectPath(kitId, 'brief.md')),
    domain_classified: Boolean(manifest?.kind),
    scope_locked: await exists(kitPath(kitId, 'SCOPE.md')),
    risk_audited: await exists(kitPath(kitId, 'RISK.md')),
    api_drafted: await exists(kitPath(kitId, 'API.md')),
    manifest_seeded: Boolean(manifest),
    scaffold_generated: await scaffoldExists(kitId),
    contracts_defined: await hasContractFiles(kitId),
    implementation_started: await exists(kitPath(kitId, 'src', 'index.js')),
    implementation_complete: await manifestExportsExist(kitId, manifest),
    unit_tested: (await exists(kitPath(kitId, 'tests', `${kitId}.test.js`))) || (await exists(path.join(PROJECT_ROOT, 'tests', `${kitId}.test.js`))),
    integration_tested: (await exists(kitPath(kitId, 'tests', `${kitId}.integration.test.js`))) || (await exists(path.join(PROJECT_ROOT, 'tests', `${kitId}.integration.test.js`))),
    example_1_local: await hasExample(kitId, 'local-basic'),
    example_2_hosted: await hasExample(kitId, 'hosted-integration'),
    example_3_live_or_edge: await hasExample(kitId, 'live-or-edge'),
    documentation_complete: await docsComplete(kitId),
    quality_gated: Boolean(manifest?.lifecycle?.qualityGated),
    registry_ready: await exists(path.join(PROJECT_ROOT, 'dist', 'kitbuilder.registry.json')),
    promotion_ready: await exists(path.join(PROJECT_ROOT, '.promotions', kitId, 'PROMOTION.md'))
  };
  return gates;
}

export async function scaffoldExists(kitId) {
  const required = ['README.md', 'idea.md', 'SCOPE.md', 'API.md', 'RISK.md', 'package.json', 'kit.manifest.json', 'src/index.js'];
  for (const rel of required) if (!(await exists(kitPath(kitId, rel)))) return false;
  return true;
}

export async function hasContractFiles(kitId) {
  const candidates = ['src/contracts.js', 'src/schema.js', 'src/state-machine.js'];
  for (const rel of candidates) if (await exists(kitPath(kitId, rel))) return true;
  return false;
}

export async function docsComplete(kitId) {
  const required = ['README.md', 'API.md', 'SCOPE.md', 'RISK.md'];
  for (const rel of required) if (!(await exists(kitPath(kitId, rel)))) return false;
  for (const exampleId of REQUIRED_EXAMPLES) if (!(await exists(kitPath(kitId, 'examples', exampleId, 'README.md')))) return false;
  return true;
}

export async function highestPassedState(kitId) {
  const gates = await computeGates(kitId);
  let highest = 0;
  for (const state of KIT_STATES) {
    if (!gates[state]) break;
    highest = stateIndex(state);
  }
  return { state: stateAtIndex(highest || 1), stateIndex: highest || 1, gates };
}

export async function rebuildProjectIndex() {
  const kitIds = await listKitIds();
  const projects = [];
  for (const kitId of kitIds) {
    const project = await readProject(kitId);
    const highest = await highestPassedState(kitId);
    projects.push({
      kitId,
      state: project.currentState ?? highest.state,
      computedState: highest.state,
      stateIndex: project.stateIndex ?? highest.stateIndex,
      computedStateIndex: highest.stateIndex,
      totalStates: KIT_STATES.length,
      status: project.status ?? 'experimental',
      kind: project.kind ?? 'browser-runtime'
    });
  }
  const index = { generatedAt: nowIso(), totalStates: KIT_STATES.length, projects };
  await writeJson(path.join(PROJECT_ROOT, '.kitbuilder', 'projects', 'index.json'), index);
  return index;
}

export async function addLesson({ source = 'manual', title, body, tags = [], issueId = null, kitId = null }) {
  if (!title) throw new Error('lesson title is required');
  const lesson = { id: `lesson-${Date.now()}`, source, issueId, kitId, title, body: body ?? '', tags, createdAt: nowIso() };
  const dir = path.join(PROJECT_ROOT, '.kitbuilder', 'agent-brain');
  await fs.mkdir(dir, { recursive: true });
  await fs.appendFile(path.join(dir, 'lessons.jsonl'), `${JSON.stringify(lesson)}\n`, 'utf8');
  await refreshAgentBrainSummary();
  return lesson;
}

export async function readLessons() {
  try {
    const text = await fs.readFile(path.join(PROJECT_ROOT, '.kitbuilder', 'agent-brain', 'lessons.jsonl'), 'utf8');
    return text.split('\n').filter(Boolean).map(line => JSON.parse(line));
  } catch {
    return [];
  }
}

export async function refreshAgentBrainSummary() {
  const lessons = await readLessons();
  const lines = [
    '# KitBuilder02 Main Agent Brain',
    '',
    'This file is generated from `.kitbuilder/agent-brain/lessons.jsonl`.',
    'Agents should read this before planning kit changes.',
    '',
    `Total lessons: ${lessons.length}`,
    ''
  ];
  for (const lesson of lessons.slice(-50)) {
    lines.push(`## ${lesson.title}`);
    lines.push('');
    lines.push(`- id: ${lesson.id}`);
    if (lesson.kitId) lines.push(`- kit: ${lesson.kitId}`);
    if (lesson.issueId) lines.push(`- issue: ${lesson.issueId}`);
    lines.push(`- source: ${lesson.source}`);
    lines.push(`- tags: ${(lesson.tags ?? []).join(', ')}`);
    lines.push('');
    lines.push(lesson.body || '_No body provided._');
    lines.push('');
  }
  await fs.writeFile(path.join(PROJECT_ROOT, '.kitbuilder', 'agent-brain', 'main-agent-brain.md'), `${lines.join('\n')}\n`, 'utf8');
}

export async function createLocalIssue({ title, body = '', kitId = null, severity = 'normal', tags = [] }) {
  if (!title) throw new Error('issue title is required');
  const safe = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'issue';
  const issueId = `kb-${Date.now()}-${safe}`;
  const issue = { issueId, title, body, kitId, severity, tags, status: 'open', createdAt: nowIso(), updatedAt: nowIso(), lessons: [] };
  await writeJson(issuePath('open', issueId), issue);
  return issue;
}

export async function listLocalIssues(status = 'open') {
  const dir = path.join(PROJECT_ROOT, '.kitbuilder', 'issues', status);
  try {
    const files = (await fs.readdir(dir)).filter(file => file.endsWith('.json')).sort();
    const issues = [];
    for (const file of files) issues.push(await readJson(path.join(dir, file), null));
    return issues.filter(Boolean);
  } catch {
    return [];
  }
}

export async function closeLocalIssue(issueId, { lessonTitle = null, lessonBody = null, tags = [] } = {}) {
  const openPath = issuePath('open', issueId);
  const issue = await readJson(openPath, null);
  if (!issue) throw new Error(`open issue not found: ${issueId}`);
  issue.status = 'closed';
  issue.updatedAt = nowIso();
  if (lessonTitle) {
    const lesson = await addLesson({ source: 'issue-close', title: lessonTitle, body: lessonBody ?? issue.body, tags, issueId, kitId: issue.kitId });
    issue.lessons = [...(issue.lessons ?? []), lesson.id];
  }
  await writeJson(issuePath('closed', issueId), issue);
  await fs.rm(openPath, { force: true });
  return issue;
}
