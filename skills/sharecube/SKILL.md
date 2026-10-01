---
name: sharecube
description: Publish an HTML or Markdown document to ShareCube so people can read, comment on, and edit it, or update and comment on an existing ShareCube artifact. Use when the user wants to share a report, doc, page, or write-up, or mentions ShareCube.
---

# ShareCube

ShareCube stores HTML and Markdown artifacts in org projects. Use the `sharecube` MCP server tools.

## Publish something new

1. `list_projects` to pick a project. Ask the user if more than one fits.
2. `create_artifact` with the title, format, and full body.
3. Give the user the returned `console_url`. That is where they edit, comment, and change who can see it. `share_url` is the read-only share page, and whether it opens for others depends on the visibility set in the console.

## Change an existing artifact

- Find it with `search_artifact` or `list_artifacts`, then `get_artifact`.
- For a partial change, use `edit_artifact` with an `old_str` that matches exactly once. Send the whole body through `update_artifact` only for a rewrite.

## Comments

- New thread: `create_comment` with a `body`. To anchor it to text, pass `anchor` with the `quote` and its position.
- Reply: set `parent_thread_id` and leave out `anchor`.
- Mention someone with `[@Display Name](mention://user/{user_id})`. Plain `@name` text does not notify anyone.

Creating or updating needs Editor or Owner on the project. Commenting needs Commenter or above.
