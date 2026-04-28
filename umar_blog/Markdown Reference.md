---
title: Markdown & code reference
pubDatetime: 2026-04-27T19:00:00Z
description: Reference for the formatting, frontmatter, and code-block tricks available when writing posts on this site.
format: notes
tags:
  - meta
  - reference
featured: true
draft: false
---

A cheat sheet for everything you can do in a post. View the source of this file in Obsidian, then check the rendered output on the live site.

## Frontmatter

| Field | Required | Type | Notes |
|---|---|---|---|
| `title` | yes | string | Post title |
| `pubDatetime` | yes | ISO datetime | Publication time, e.g. `2026-04-27T19:00:00Z` |
| `description` | yes | string | SEO + card preview |
| `format` | no | enum | `essay`, `tutorial`, `talk-notes`, `notes` |
| `tags` | no | list of strings | Defaults to `["others"]` |
| `featured` | no | boolean | Show on landing page if true |
| `draft` | no | boolean | Hide from site if true |
| `modDatetime` | no | ISO datetime | Updated timestamp |
| `ogImage` | no | path or url | Custom social card image |

## Headings

```markdown
# H1
## H2
### H3
#### H4
```

# H1 example
## H2 example
### H3 example

## Text formatting

`**bold**`, `*italic*`, `***bold italic***`, `~~strikethrough~~`, `` `inline code` ``, `[a link](https://example.com)`.

Renders as: **bold**, *italic*, ***bold italic***, ~~strikethrough~~, `inline code`, [a link](https://example.com).

## Lists

Unordered:

- item one
- item two
  - nested
  - nested two

Ordered:

1. first
2. second
3. third

## Blockquote

> The document chunking is usually harder than the retrieval.

## Code blocks

### Basic

```ts
const x = 42;
```

### With filename badge

Use ` ```language file=name.ext ` to get a filename pill:

````markdown
```ts file=astro.config.ts
import { defineConfig } from "astro/config";
export default defineConfig({});
```
````

Renders as:

```ts file=astro.config.ts
import { defineConfig } from "astro/config";
export default defineConfig({});
```

### Line highlight

Add `// [!code highlight]` to highlight a line:

```ts
const a = 1;
const b = 2; // [!code highlight]
const c = 3;
```

### Diff

Use `// [!code --]` and `// [!code ++]` for diff styling:

```ts
function add(a, b) {
  return a - b; // [!code --]
  return a + b; // [!code ++]
}
```

### Word highlight

Use `// [!code word:term]` to highlight every occurrence of a word:

```ts
// [!code word:retrieval]
const retrieval = await runRetrieval();
```

## Tables

```markdown
| Format       | Use case             |
| ------------ | -------------------- |
| `essay`      | personal opinion     |
| `tutorial`   | step-by-step how-to  |
| `talk-notes` | recap of a talk      |
```

| Format       | Use case             |
| ------------ | -------------------- |
| `essay`      | personal opinion     |
| `tutorial`   | step-by-step how-to  |
| `talk-notes` | recap of a talk      |

## Images

From the `_assets` folder, standard markdown:

```markdown
![Alt text](_assets/image-20260427184607.png)
```

For filenames with spaces, wrap the path in angle brackets:

```markdown
![Crew shot](<_assets/My FIrst test blog-.png>)
```

Astro auto-optimizes anything referenced this way (resize, WebP, lazy-load).

## Horizontal rule

Three hyphens on their own line: `---`

---

## Auto table of contents

Add a heading named exactly `Table of contents` and `remark-toc` will populate it from the rest of your headings:

```markdown
## Table of contents
```

It also auto-collapses (via `remark-collapse`) so readers can expand it on demand.

## Raw HTML

Markdown not enough? Drop raw HTML inline:

```html
<details>
  <summary>Click to expand</summary>
  Hidden content here.
</details>
```

<details>
  <summary>Click to expand</summary>
  Hidden content here.
</details>


## Footnotes

Inline footnote like this[^1].

[^1]: This is the footnote, rendered at the bottom of the post.
