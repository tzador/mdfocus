# GitHub Flavored Markdown Demo

Welcome to this comprehensive demonstration of **GitHub Flavored Markdown** (GFM). This document showcases the full range of formatting options available to you when writing documentation, README files, issues, and pull requests.

---

## Table of Contents

1. [Headers](#headers)
2. [Text Formatting](#text-formatting)
3. [Lists](#lists)
4. [Links](#links)
5. [Images](#images)
6. [Code](#code)
7. [Tables](#tables)
8. [Blockquotes](#blockquotes)
9. [Task Lists](#task-lists)
10. [Footnotes](#footnotes)
11. [Horizontal Rules](#horizontal-rules)
12. [Emojis](#emojis)
13. [Mathematical Expressions](#mathematical-expressions)
14. [Alerts](#alerts)
15. [Collapsed Sections](#collapsed-sections)

---

## Headers

Headers are created using the `#` symbol. The number of `#` symbols determines the header level:

# H1 - The Largest Header

## H2 - Second Level

### H3 - Third Level

#### H4 - Fourth Level

##### H5 - Fifth Level

###### H6 - Smallest Header

---

## Text Formatting

GitHub Flavored Markdown supports various text styling options:

### Emphasis

- _Italic text_ using single asterisks or _underscores_
- **Bold text** using double asterisks or **underscores**
- **_Bold and italic_** using triple asterisks
- ~~Strikethrough~~ using double tildes
- <sub>Subscript</sub> using HTML tags
- <sup>Superscript</sup> using HTML tags

### Special Text

You can also use `inline code` with backticks for technical terms like `console.log()` or file names like `package.json`.

> **Note:** Combining formats is powerful! You can have **_~~bold italic strikethrough~~_** text.

---

## Lists

### Unordered Lists

- First item
- Second item
  - Nested item 2.1
  - Nested item 2.2
    - Deeply nested item 2.2.1
    - Deeply nested item 2.2.2
- Third item

### Ordered Lists

1. First step
2. Second step
3. Third step
   1. Sub-step 3.1
   2. Sub-step 3.2
4. Fourth step

### Mixed Lists

1. **Introduction**
   - Overview of the project
   - Goals and objectives
2. **Installation**
   - Prerequisites
   - Step-by-step guide
3. **Usage**
   - Basic commands
   - Advanced features

---

## Links

### Inline Links

- [Visit GitHub](https://github.com)
- [Markdown Guide](https://www.markdownguide.org "The ultimate Markdown reference")
- [Relative link to another file](./countries/index.md)

### Reference Links

Here's a reference to [GitHub][github-link] and [MDN Web Docs][mdn].

[github-link]: https://github.com
[mdn]: https://developer.mozilla.org "Mozilla Developer Network"

### Autolinks

GitHub automatically converts URLs and email addresses:

- https://github.com
- support@github.com

---

## Images

### Embedded Image

Here's an embedded image from the same directory:

![Demo Image](demo.jpg)

### Image with Alt Text and Title

![A beautiful demonstration image](demo.jpg "Click to view full size")

### Image as a Link

[![Demo Thumbnail](demo.jpg)](demo.jpg)

### Inline Image Reference

You can also reference images: ![icon][demo-img]

[demo-img]: demo.jpg "Demo"

---

## Code

### Inline Code

Use the `npm install` command to install dependencies. Access environment variables with `process.env.NODE_ENV`.

### Fenced Code Blocks

#### JavaScript

```javascript
// A simple function to greet users
function greet(name) {
  const greeting = `Hello, ${name}!`;
  console.log(greeting);
  return greeting;
}

// Arrow function variant
const greetArrow = (name) => `Hello, ${name}!`;

// Usage
greet("World");
```

#### TypeScript

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

class UserService {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
  }

  findById(id: number): User | undefined {
    return this.users.find((user) => user.id === id);
  }
}
```

#### Python

```python
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class Article:
    title: str
    author: str
    content: str
    tags: List[str]
    published: bool = False

def publish_article(article: Article) -> None:
    """Publish an article to the blog."""
    article.published = True
    print(f"Published: {article.title} by {article.author}")

# Example usage
my_article = Article(
    title="Introduction to Python",
    author="Jane Doe",
    content="Python is a versatile programming language...",
    tags=["python", "programming", "tutorial"]
)
```

#### Rust

```rust
use std::collections::HashMap;

fn main() {
    let mut scores: HashMap<String, i32> = HashMap::new();

    scores.insert(String::from("Blue"), 10);
    scores.insert(String::from("Red"), 50);

    for (key, value) in &scores {
        println!("{}: {}", key, value);
    }
}
```

#### Shell/Bash

```bash
#!/bin/bash

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Deploy to production
if [ "$CI" = "true" ]; then
    echo "Deploying to production..."
    npm run deploy
fi
```

#### JSON

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "description": "A sample project",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "lodash": "^4.17.21"
  }
}
```

#### YAML

```yaml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm test
```

#### SQL

```sql
-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Query with joins
SELECT
    u.username,
    COUNT(p.id) AS post_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
GROUP BY u.id
HAVING COUNT(p.id) > 5
ORDER BY post_count DESC;
```

#### Diff

```diff
- const oldValue = "deprecated";
+ const newValue = "updated";

  function example() {
-   return oldValue;
+   return newValue;
  }
```

---

## Tables

### Basic Table

| Feature | Supported | Notes                |
| ------- | --------- | -------------------- |
| Headers | ✅        | H1 through H6        |
| Bold    | ✅        | Double asterisks     |
| Italic  | ✅        | Single asterisks     |
| Tables  | ✅        | Pipe syntax          |
| Images  | ✅        | Inline and reference |

### Aligned Table

| Left Aligned | Center Aligned | Right Aligned |
| :----------- | :------------: | ------------: |
| Content      |    Content     |       Content |
| More content |  More content  |  More content |
| Even more    |   Even more    |     Even more |

### Complex Table

| Package | Version | Size   | Downloads/week | License |
| ------- | ------- | ------ | -------------- | ------- |
| React   | 18.2.0  | 2.5 kB | 19,847,234     | MIT     |
| Vue     | 3.3.4   | 34 kB  | 4,523,891      | MIT     |
| Angular | 16.1.0  | 95 kB  | 2,891,456      | MIT     |
| Svelte  | 4.0.0   | 10 kB  | 892,341        | MIT     |
| Solid   | 1.7.6   | 7 kB   | 156,789        | MIT     |

---

## Blockquotes

### Simple Quote

> "The only way to do great work is to love what you do."
> — Steve Jobs

### Nested Quotes

> This is the first level of quoting.
>
> > This is a nested blockquote.
> >
> > > And this is even more deeply nested.
>
> Back to the first level.

### Quote with Formatting

> ### Important Notice
>
> This blockquote contains **bold text**, _italic text_, and even `inline code`.
>
> - It can also contain lists
> - With multiple items
>
> ```javascript
> // And code blocks too!
> console.log("Hello from a blockquote!");
> ```

---

## Task Lists

### Project Checklist

- [x] Initialize project repository
- [x] Set up development environment
- [x] Create project structure
- [ ] Implement core features
  - [x] User authentication
  - [x] Database integration
  - [ ] API endpoints
  - [ ] Frontend components
- [ ] Write documentation
- [ ] Add unit tests
- [ ] Deploy to staging
- [ ] Production release

### Sprint Tasks

- [x] **FEAT-001**: Implement user login
- [x] **FEAT-002**: Add password reset functionality
- [ ] **FEAT-003**: OAuth integration
- [ ] **BUG-042**: Fix memory leak in cache
- [ ] **DOCS-007**: Update API documentation

---

## Footnotes

Here's a statement that needs a citation[^1]. You can also use named footnotes[^note].

Multiple paragraphs can reference the same footnote[^1].

Footnotes can contain **formatted text** and even `code`[^complex].

[^1]: This is the first footnote with a simple explanation.
[^note]: This is a named footnote. Named footnotes are useful for memorable references.
[^complex]: This footnote contains more complex content:

    - A list item
    - Another list item

    And even a code block:

    ```javascript
    console.log("From a footnote!");
    ```

---

## Horizontal Rules

You can create horizontal rules in three ways:

Using hyphens:

---

Using asterisks:

---

Using underscores:

---

---

## Emojis

GitHub supports emoji shortcodes! Here are some examples:

### Reactions

:thumbsup: :thumbsdown: :heart: :fire: :rocket: :eyes:

### Faces

:smile: :laughing: :wink: :grin: :joy: :thinking:

### Objects

:computer: :keyboard: :bulb: :book: :pencil: :package:

### Nature

:sunny: :cloud: :snowflake: :rainbow: :star: :moon:

### Symbols

:warning: :x: :white_check_mark: :heavy_check_mark: :question: :exclamation:

---

## Mathematical Expressions

GitHub supports LaTeX-style math expressions:

### Inline Math

The quadratic formula is $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$ which solves equations of the form $ax^2 + bx + c = 0$.

### Block Math

$$
\begin{aligned}
\nabla \times \vec{E} &= -\frac{\partial \vec{B}}{\partial t} \\
\nabla \times \vec{B} &= \mu_0 \vec{J} + \mu_0 \epsilon_0 \frac{\partial \vec{E}}{\partial t}
\end{aligned}
$$

### More Examples

The Euler's identity:
$$e^{i\pi} + 1 = 0$$

Sum notation:
$$\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}$$

---

## Alerts

GitHub supports special alert syntax:

> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.

---

## Collapsed Sections

<details>
<summary>Click to expand: Installation Instructions</summary>

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Git

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/example/project.git
   ```

2. Install dependencies:

   ```bash
   cd project
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

</details>

<details>
<summary>Click to expand: Frequently Asked Questions</summary>

### How do I report a bug?

Please open an issue on our GitHub repository with a detailed description of the bug, steps to reproduce, and your environment information.

### Can I contribute to this project?

Absolutely! We welcome contributions. Please read our CONTRIBUTING.md file for guidelines.

### What license is this project under?

This project is licensed under the MIT License. See LICENSE for details.

</details>

<details>
<summary>Click to expand: Full Configuration Options</summary>

```yaml
# config.yml
server:
  port: 3000
  host: localhost
  timeout: 30000

database:
  type: postgresql
  host: localhost
  port: 5432
  name: myapp
  pool:
    min: 2
    max: 10

logging:
  level: info
  format: json
  destination: stdout

features:
  authentication: true
  caching: true
  rateLimit:
    enabled: true
    requests: 100
    window: 60
```

</details>

---

## Keyboard Keys

Use HTML kbd tags to display keyboard keys:

Press <kbd>Ctrl</kbd> + <kbd>C</kbd> to copy.

Press <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> to open the command palette.

Navigate using <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> arrow keys.

---

## Abbreviations and Definitions

<dl>
  <dt>HTML</dt>
  <dd>HyperText Markup Language - the standard markup language for web pages</dd>
  
  <dt>CSS</dt>
  <dd>Cascading Style Sheets - describes how HTML elements should be displayed</dd>
  
  <dt>JavaScript</dt>
  <dd>A programming language that enables interactive web pages</dd>
  
  <dt>API</dt>
  <dd>Application Programming Interface - a set of protocols for building software</dd>
</dl>

---

## Escaping Characters

To display literal characters that have special meaning in Markdown:

- \*Not italic\*
- \*\*Not bold\*\*
- \# Not a header
- \[Not a link\]
- \`Not code\`

---

## Comments

<!-- This is a comment that won't be rendered -->

<!--
Multi-line comments
are also possible
using HTML comment syntax
-->

---

## Combining Everything

Here's a complex example combining multiple features:

> ### 🚀 Release Notes v2.0.0
>
> We're excited to announce our latest release with the following changes:
>
> | Type       | Description       | Status   |
> | ---------- | ----------------- | -------- |
> | ✨ Feature | Dark mode support | Complete |
> | 🐛 Bug Fix | Memory leak fixed | Complete |
> | 📚 Docs    | Updated README    | Complete |
>
> **Breaking Changes:**
>
> - [x] Minimum Node.js version is now 18
> - [x] Deprecated `oldAPI()` removed
>
> ```javascript
> // New API usage
> import { newAPI } from "our-package";
> const result = await newAPI.fetch();
> ```
>
> See the [full changelog](#) for more details[^release].

[^release]: This release was tested on Node.js 18, 20, and 21.

---

## Conclusion

This document has demonstrated the extensive capabilities of GitHub Flavored Markdown. From basic text formatting to complex tables, code blocks, and interactive elements, GFM provides powerful tools for creating rich documentation.

### Quick Reference

| Syntax        | Result      |
| ------------- | ----------- |
| `**bold**`    | **bold**    |
| `*italic*`    | _italic_    |
| `~~strike~~`  | ~~strike~~  |
| `` `code` ``  | `code`      |
| `[link](url)` | [link](url) |
| `![alt](img)` | image       |

---

<div align="center">

**Made with ❤️ using GitHub Flavored Markdown**

[⬆ Back to Top](#github-flavored-markdown-demo)

</div>
