# Initial Setup

## 1, create next project

```bash
bun create next-app@latest my-app --yes
cd my-app
bun dev
```

## 2, install prisma

```bash
bun add prisma tsx --dev
bun add @prisma/extension-accelerate @prisma/client
npx prisma init --db --output ../src/generated/prisma
```

## 3, install & setup semantic-release

```bash
bun install
bun add semantic-release @semantic-release/commit-analyzer @semantic-release/release-notes-generator @semantic-release/changelog @semantic-release/npm @semantic-release/git
bun add -D @commitlint/cli @commitlint/config-conventional @commitlint/cz-commitlint
bun add commitizen commitlint husky
```
