#!/usr/bin/env node
import { closeLocalIssue, createLocalIssue, listLocalIssues, parseArgs } from './kitbuilder-core.mjs';

const args = parseArgs();
const command = args._[0] ?? 'list';

if (command === 'new') {
  const title = args.title ?? args._.slice(1).join(' ');
  if (!title) {
    console.error('usage: npm run kit:issue -- new --title "..." [--kit kit-id] [--severity normal] [--tags a,b]');
    process.exit(1);
  }
  const tags = typeof args.tags === 'string' ? args.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
  const issue = await createLocalIssue({ title, body: args.body ?? '', kitId: args.kit ?? args.kitId ?? null, severity: args.severity ?? 'normal', tags });
  console.log(`Created ${issue.issueId}`);
  console.log(`.kitbuilder/issues/open/${issue.issueId}.json`);
} else if (command === 'close') {
  const issueId = args.id ?? args._[1];
  if (!issueId) {
    console.error('usage: npm run kit:issue -- close --id <issue-id> [--lesson "..."]');
    process.exit(1);
  }
  const tags = typeof args.tags === 'string' ? args.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
  const issue = await closeLocalIssue(issueId, { lessonTitle: args.lesson ?? null, lessonBody: args.lessonBody ?? args.body ?? null, tags });
  console.log(`Closed ${issue.issueId}`);
  if (args.lesson) console.log('Lesson appended to main agent brain.');
} else {
  const status = args.status ?? 'open';
  const issues = await listLocalIssues(status);
  console.log(`${status} issues: ${issues.length}`);
  for (const issue of issues) console.log(`- ${issue.issueId} [${issue.severity}] ${issue.kitId ?? 'global'}: ${issue.title}`);
}
