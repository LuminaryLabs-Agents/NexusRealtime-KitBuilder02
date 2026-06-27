#!/usr/bin/env node
import { addLesson, parseArgs } from './kitbuilder-core.mjs';

const args = parseArgs();
const title = args.title ?? args._.join(' ');
if (!title) {
  console.error('usage: npm run kit:lesson -- --title "Lesson title" --body "What changed" [--kit kit-id]');
  process.exit(1);
}
const tags = typeof args.tags === 'string' ? args.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
const lesson = await addLesson({
  source: 'manual',
  title,
  body: args.body ?? '',
  tags,
  kitId: args.kit ?? args.kitId ?? null
});
console.log(`Added lesson ${lesson.id}: ${lesson.title}`);
