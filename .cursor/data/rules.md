# Development Guidelines for Eventy360

## 1. Project Overview

- **Purpose**: Eventy360 (details to be filled in from `Eventy360_Project_Summary.md` or `memory-bank/projectbrief.md` when available).
- **Tech Stack**: Primarily Markdown documentation and JSON data at this stage. Further stack details will be added as the project evolves.
- **Core Features**: Currently focused on project setup and documentation structure.

## 2. Project Architecture

- **`memory-bank/`**: MUST contain core project documentation following the specified structure (`projectbrief.md`, `productContext.md`, `activeContext.md`, `systemPatterns.md`, `techContext.md`, `progress.md`). MUST read ALL files in this directory at the start of EVERY task.
- **`.cursorrules`**: Captures learned project-specific patterns, preferences, and workflows. This file WILL be updated iteratively.
- **`Eventy360_Project_Summary.md`**: Provides a high-level overview. Refer to `memory-bank/` for detailed, actionable context.
- **`wilayas.json`**: Static JSON data file containing Algerian Wilayas. Treat as read-only unless explicitly instructed otherwise.
- **`.cursor/data/rules.md`**: This file. Contains the rules governing AI operation within this project.

## 3. Coding Standards (Initial)

- **Documentation**: MUST use Markdown (`.md`) for all documentation files within `memory-bank/` and for general project notes.
- **File Naming**: Follow standard conventions (e.g., `snake_case` or `kebab-case` for files, `PascalCase` for potential future components/classes - TBD).

## 4. Feature Implementation Standards

- **Focus on Memory Bank**: All development MUST be preceded by reading and potentially updating the `memory-bank/` files, especially `activeContext.md` and `progress.md`.
- **Incremental Updates**: Update documentation and `.cursorrules` as new patterns or significant changes occur.

## 7. Key File Interaction Standards

- **Memory Bank Interdependency**: Files within `memory-bank/` are interconnected as per the custom instructions. Updates to one may necessitate checks or updates in others.
- **Summary vs. Detail**: `Eventy360_Project_Summary.md` is for overview; `memory-bank/` holds the detailed, current state.

## 8. AI Decision Standards

- **Prioritize Memory Bank**: Base all actions and plans on the information within the `memory-bank/`.
- **Consult `.cursorrules`**: Apply learned patterns from `.cursorrules` to guide actions.
- **Data Handling (`wilayas.json`)**: Assume read-only access. Confirm before attempting modification or integration.
- **Tool Usage**: Adhere to tool usage preferences specified in custom instructions (e.g., using `mcp_context7` tools for library docs).

## 9. Prohibitions

- **DO NOT** modify `wilayas.json` without explicit instruction.
- **DO NOT** start tasks without first reading the *entire* `memory-bank/` directory.
- **DO NOT** rely solely on `Eventy360_Project_Summary.md` for task execution context.
- **DO NOT** include general development knowledge (already known) in this `rules.md` file.

This initial set of rules reflects the current minimal state. It will be expanded as the project grows. 