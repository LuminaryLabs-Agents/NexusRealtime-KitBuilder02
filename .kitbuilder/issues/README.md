# KitBuilder02 Local Issue Tracker

KitBuilder02 keeps a lightweight local issue tracker for kit factory work.

Open issues live in:

```txt
.kitbuilder/issues/open/
```

Closed issues live in:

```txt
.kitbuilder/issues/closed/
```

Create an issue:

```bash
npm run kit:issue -- new --title "Missing local example" --kit secure-peer-onnx-kit --severity normal --tags docs,examples
```

List issues:

```bash
npm run kit:issue -- list
```

Close an issue and teach the agent brain:

```bash
npm run kit:issue -- close --id <issue-id> --lesson "Do not advance a kit without all three examples."
```

Lessons are appended to `.kitbuilder/agent-brain/lessons.jsonl` and summarized in `.kitbuilder/agent-brain/main-agent-brain.md`.
