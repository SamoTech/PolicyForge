#!/usr/bin/env python3
"""PolicyForge — Policy Document Validator
Checks all policy Markdown files for required front-matter fields.
Missing sections are reported as warnings (not errors) to allow
gradual enrichment of policy files without blocking CI.
"""
import os
import re
import json
import sys
from pathlib import Path

REQUIRED_FIELDS = [
    "Policy Path",
    "Registry",
    "PowerShell",
    "Description",
    "Impact",
    "Use Cases",
    "MITRE ATT&CK",
]

RECOMMENDED_FIELDS = [
    "Intune CSP",
    "References",
    "Metadata",
]

RISK_LEVELS = ["Low", "Medium", "High", "Critical"]


def validate_policy_file(filepath: Path) -> dict:
    """Validate a single policy Markdown file."""
    errors = []
    warnings = []

    # Critical: file must be readable and non-empty
    try:
        content = filepath.read_text(encoding="utf-8")
    except Exception as e:
        errors.append(f"Cannot read file: {e}")
        return {"file": str(filepath), "valid": False, "errors": errors, "warnings": warnings}

    if not content.strip():
        errors.append("File is empty")
        return {"file": str(filepath), "valid": False, "errors": errors, "warnings": warnings}

    # Warn (not error) on missing required sections
    for field in REQUIRED_FIELDS:
        if f"## {field}" not in content and f"# {field}" not in content:
            warnings.append(f"Missing recommended section: '## {field}'")

    # Warn on missing recommended sections
    for field in RECOMMENDED_FIELDS:
        if field not in content:
            warnings.append(f"Missing recommended section: '{field}'")

    # Warn on missing risk level
    risk_found = any(risk in content for risk in ["🔴", "🟠", "🟡", "🟢"])
    if not risk_found:
        warnings.append("No risk level indicator found (🔴🟠🟡🟢)")

    # Warn on filename convention
    name = filepath.name
    pattern = r'^[A-Z]+-[A-Z]+-\d{3}-.+\.md$'
    if not re.match(pattern, name):
        warnings.append(f"Filename doesn't follow convention: CATEGORY-TYPE-NNN-name.md")

    # Warn on empty code blocks
    code_blocks = re.findall(r'```[\w]*\n([\s\S]*?)```', content)
    empty_blocks = [i for i, b in enumerate(code_blocks) if b.strip() == '']
    if empty_blocks:
        warnings.append(f"{len(empty_blocks)} empty code block(s) found")

    return {
        "file": str(filepath),
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
    }


def main():
    root = Path(".")
    policy_files = list(root.glob("policies/**/*.md"))

    # Exclude index/placeholder READMEs
    policy_files = [
        f for f in policy_files
        if f.name != "README.md" and f.name != "_TEMPLATE.md"
    ]

    print(f"\n🔍 PolicyForge Schema Validator")
    print(f"   Checking {len(policy_files)} policy files...\n")

    results = []
    errors_total = 0
    warnings_total = 0

    for filepath in sorted(policy_files):
        result = validate_policy_file(filepath)
        results.append(result)

        status = "✅" if result["valid"] else "❌"
        print(f"  {status} {filepath.name}")

        for error in result["errors"]:
            print(f"       ❌ ERROR: {error}")
            errors_total += 1

        for warning in result["warnings"]:
            print(f"       ⚠️  WARN:  {warning}")
            warnings_total += 1

    print(f"\n{'='*60}")
    print(f"  Files checked : {len(policy_files)}")
    print(f"  Errors        : {errors_total}")
    print(f"  Warnings      : {warnings_total}")
    print(f"  Valid files   : {sum(1 for r in results if r['valid'])}")
    print(f"{'='*60}\n")

    # Write report
    report = {
        "total": len(policy_files),
        "errors": errors_total,
        "warnings": warnings_total,
        "results": results,
    }
    with open("validation-report.json", "w") as f:
        json.dump(report, f, indent=2)

    print("📄 Report saved to validation-report.json")

    if errors_total > 0:
        print(f"\n🚫 Validation FAILED — {errors_total} critical error(s) must be fixed before merge.")
        sys.exit(1)
    else:
        print(f"\n✅ Validation PASSED — {warnings_total} warning(s) to address over time.")
        sys.exit(0)


if __name__ == "__main__":
    main()
