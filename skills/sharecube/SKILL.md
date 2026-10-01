---
name: sharecube
description: Work with ShareCube through its MCP tools. Publish HTML or Markdown as a shareable artifact, find and edit existing artifacts without overwriting other people's changes, and read, write, and resolve comments. Use when the user wants to share a report, doc, page, or write-up, pastes a ShareCube link, or mentions ShareCube.
---

# ShareCube

ShareCube stores HTML and Markdown artifacts in org projects. People edit and comment on them in the web app while agents write to them, so treat every artifact as a shared document someone else may be changing.

## IDs come from the tools, never guesses

- `project_id` comes from `list_projects`. Artifact ids come from `search_artifact` (full text), `list_artifacts` (optionally scoped to a project), or a link the user pasted: `/projects/{project_id}/artifacts/{artifact_id}` or `/share/{artifact_id}`. A `/s/{slug}` short link does not contain the id, so search for the artifact by title instead.
- User ids for mentions come from `created_by` on artifacts and `author_sub` on comments. There is no user lookup, so you can only mention someone who has created or commented on something you can read.
- Never invent an id or reuse one from an earlier conversation. Look it up again.

## Publishing

1. `list_projects`. If more than one project fits, ask the user which one. `create_project` does not check for duplicate names, so only create a project when the user asks for one.
2. `create_artifact` with `type` set to `html` or `md`, a `display_name`, and the full `content`.
3. Give the user the `console_url`. That is where they edit, comment, and set who can see it. `share_url` only opens for other people once visibility allows it, and visibility can only be changed in the web app, so don't promise anyone a link will work.

HTML artifacts are one self-contained file rendered in a sandboxed frame:

- Scripts run, and scripts and fonts from public CDNs load.
- There is nowhere to put a second file, so relative paths like `./style.css` or `img/chart.png` break. Inline CSS and images, or use absolute URLs.
- The frame has no origin of its own. `localStorage`, cookies, form submission, and links that open a new window do not work.

## Editing without clobbering

- `get_artifact` first and keep its `current_version_id`.
- For a targeted change, use `edit_artifact`. `old_str` must match the current content exactly, whitespace included, and appear once. Extend it with surrounding text until it is unique, or pass `replace_all`.
- Use `update_artifact` only to rewrite the whole body or to change just the title.
- Always pass `base_version_id`. Without it, a save someone made in the web app since you read the document is silently overwritten. On a conflict error, `get_artifact` again, re-apply your change to the new content, and retry.
- Add a short `message`. It shows in the artifact's History next to your change.
- Each successful write returns a new version id. Use that as `base_version_id` for your next edit.

## Large documents

Inline `create_artifact` and `update_artifact` reject bodies over 4 MB. `request_artifact_upload` is only for bodies over about 2 MB, and only when you can make a raw HTTP PUT yourself outside of tool calls. To revise an existing artifact, use its update mode (`id` plus `base_version_id`). Calling create mode again makes a new artifact and strands the old one's comments and share link.

For a large artifact, `get_artifact` omits `content` and returns a `content_url` to GET instead.

## Comments

- `list_comments` returns threads with their replies. Filter with `status`: `open`, `resolved`, or `orphaned`. A thread is orphaned when the text it was anchored to was edited away.
- New thread: `create_comment` with a `body`. To anchor it to a passage, pass `anchor` with `quote`, `start`, and `end` taken from the content `get_artifact` returned. `quote` must equal `content.slice(start, end)`. When the quote appears more than once, `occurrenceIndex` picks which one, counting from 0.
- Reply: set `parent_thread_id` and leave out `anchor`.
- Mention: `[@Display Name](mention://user/{user_id})`. Plain `@name` text notifies nobody.
- `resolve_comment` is the only way to resolve a thread. Editing the text a comment points at does not resolve it. Leave resolved threads alone unless asked to reopen one.

## Deleting

`delete_artifact` is permanent. There is no trash and no undo. It removes every version, every comment thread, and the share link. Only delete when the user explicitly asks, confirm which artifact first, and never delete and recreate to make a change. Edit instead.

## Permissions and errors

- Creating and editing need Editor or Owner on the project. Commenting needs Commenter or above. A permission error is a fact about the user's role, not a transient failure, so don't retry it. Tell the user which role they need.
- `search_graph` searches the concepts and relationships ShareCube extracts from artifacts. It needs a plan entitlement. If it is refused, use `search_artifact` instead.

## Verify your work

After a write, `get_artifact` and check that `current_version_id` changed and the content is yours. After commenting, `get_comment` or `list_comments` shows exactly what landed.
