# Eventy360 Mobile

Researcher-focused Flutter mobile app for the Eventy360 MVP.

## Local Checks

Use the canonical Phase 6 mobile check command set before opening a PR:

### PowerShell

```powershell
cd C:\Users\raouf\projects\eventy360\apps\mobile
.\tool\check_mobile.ps1
```

### Bash

```bash
cd apps/mobile
bash tool/check_mobile.sh
```

These commands enforce:

1. dependency resolution
2. Riverpod/Freezed code generation
3. localization generation
4. static analysis
5. automated tests
6. generated-source cleanliness

## Quality Gates

See [phase6-mobile-quality-gates.md](C:/Users/raouf/projects/eventy360/docs/tasks/mvp/phase6-mobile-quality-gates.md:1) for:

1. milestone validation template
2. acceptance criteria
3. push operational checklist
4. release-quality evidence requirements
