# Agent Guidelines

This document outlines the core principles and workflows for all agents working on this project.

## 1. Use Context7 MCP for Documentation

**Always use `context7` MCP** to fetch and reference official documentation when implementing features, fixing bugs, or making architectural decisions.

- Before writing code for a library or framework, consult its official docs via context7
- Verify API signatures, best practices, and recommended patterns from the source documentation
- Cross-reference Stack Overflow or blog posts with official docs

**Examples:**
```
Use context7 to get Next.js 15 routing docs
Use context7 to get Prisma ORM documentation
Use context7 to get Better Auth documentation
```

## 2. Use MCP Tools for Up-to-Date Information

**Leverage MCP (Model Context Protocol) tools** throughout development to access current, accurate information:

- Use `fetch` for external APIs and documentation
- Use `web_search` for recent information, tutorials, and community solutions
- Use `web_fetch` to extract content from specific URLs
- Use relevant MCP tools for the task at hand (e.g., database MCP, cloud provider MCP)

**Best Practices:**
- Prefer official documentation and authoritative sources
- Verify information is current (check publication dates)
- Use web search for troubleshooting common issues
- Reference specific sections of documentation when making decisions

## 3. No Commits or Pushes Without Explicit Permission

**Do NOT commit, push, or push to production without explicit user approval.**

- Always ask the user before committing changes
- Wait for confirmation before pushing to any remote repository
- Never deploy or push to production without explicit instruction
- Ask for clarification if you're unsure whether to proceed with a git operation

**Workflow:**
1. Make changes locally
2. Ask: "Shall I commit these changes?"
3. Wait for user confirmation
4. If approved, proceed with commit
5. Ask: "Shall I push to [branch/repo]?"
6. Wait for user confirmation before pushing

---

## Additional Guidelines

- Follow the existing code style and conventions in the project
- Write clear, descriptive commit messages
- Keep changes focused and atomic
- Test locally before asking to commit
