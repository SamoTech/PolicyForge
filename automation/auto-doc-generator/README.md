# Auto Documentation Generator

Converts raw ADMX/ADML files into standardized PolicyForge Markdown documents, fully conformant with `POLICY_SCHEMA.json`.

## How It Fits the Pipeline

```
Microsoft ADMX Files
        │
        ▼
  admx-parser/          ← Extracts raw policy data from XML
  admx_parser.py
        │
        ▼
  auto-doc-generator/   ← This tool: normalizes + enriches → PolicyForge Markdown
  doc_generator.py
        │
        ▼
  policies/windows/     ← Ready-to-commit policy documents
  WIN-SECURITY-XXX.md
```

## Difference from ADMX Parser

| Tool | Input | Output | Enrichment |
|---|---|---|---|
| `admx-parser/` | ADMX XML | Raw Markdown | Minimal (name, path, description) |
| `auto-doc-generator/` | Parser JSON output | Full PolicyForge docs | Risk level, use cases, MITRE mapping stubs, CSP lookup |

## Usage (Coming in Phase 2 → Phase 3)

```bash
# Step 1: Parse ADMX files to JSON
python automation/admx-parser/admx_parser.py \
  --admx-dir "C:\Windows\PolicyDefinitions" \
  --output-dir ./parsed-output \
  --format json

# Step 2: Generate PolicyForge docs
python automation/auto-doc-generator/doc_generator.py \
  --input ./parsed-output \
  --output ./policies/windows/generated \
  --template ./policies/_TEMPLATE.md \
  --schema ./POLICY_SCHEMA.json
```

## Planned Features

- [ ] Auto-detect risk level from policy name keywords ("disable", "restrict", "block" → higher risk)
- [ ] MITRE ATT&CK technique stub generation based on policy category
- [ ] Intune CSP lookup via Microsoft Graph API
- [ ] Duplicate detection (skip policies already documented)
- [ ] Batch validation against `POLICY_SCHEMA.json`
- [ ] GitHub Actions integration — auto-PR new policies on Windows release

## Files

| File | Status | Description |
|---|---|---|
| `doc_generator.py` | 🔜 Phase 3 | Main generator script |
| `requirements.txt` | 🔜 Phase 3 | Dependencies |
| `mitre_mapper.py` | 🔜 Phase 3 | Auto MITRE technique suggestion |
| `csp_lookup.py` | 🔜 Phase 3 | Graph API CSP resolver |

## GitHub Actions Integration (Phase 3)

When Windows releases a new build:
1. Action downloads new ADMX templates
2. Runs parser → doc generator pipeline
3. Opens a PR with new/changed policies for human review
4. Labels PR `auto-generated` + `needs-review`
