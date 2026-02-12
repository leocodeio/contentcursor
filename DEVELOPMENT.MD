# Initial Setup

## 1, create next project

```bash
pnpm create next-app@latest my-app --yes
cd my-app
pnpm dev
```

## 2, install prisma

```bash
pnpm install prisma tsx --save-dev
pnpm install @prisma/extension-accelerate @prisma/client
npx prisma init --db --output ../src/generated/prisma
```

## 3, install & setup semantic-release

```bash
pnpm install
pnpm install semantic-release @semantic-release/commit-analyzer @semantic-release/release-notes-generator @semantic-release/changelog @semantic-release/npm @semantic-release/git
pnpm add -D @commitlint/cli @commitlint/config-conventional @commitlint/cz-commitlint
pnpm add commitizen commitlint husky
```
