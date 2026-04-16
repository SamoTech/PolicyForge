# ADMX Parser

Automatically converts Microsoft ADMX policy definition files into structured PolicyForge Markdown documentation.

## Setup

```bash
pip install -r requirements.txt
```

## Usage

```bash
# Basic usage
python admx_parser.py --input "C:\Windows\PolicyDefinitions" --output ../../policies/windows/

# Specify language
python admx_parser.py --input "C:\Windows\PolicyDefinitions" --output ../../policies/ --lang en-US

# Output JSON instead of Markdown
python admx_parser.py --input "C:\Windows\PolicyDefinitions" --output ../../policies/ --format json

# Output both formats
python admx_parser.py --input "C:\Windows\PolicyDefinitions" --output ../../policies/ --format both

# Limit for testing
python admx_parser.py --input "C:\Windows\PolicyDefinitions" --output ../../policies/ --limit 5
```

## Output

For each `.admx` file, the parser creates a subfolder with one `.md` file per policy:

```
policies/windows/
  └── windowsdefender/
        ├── allowrealtimemonitoring.md
        ├── disablebehaviormonitoring.md
        └── ...
```

## Notes

- Auto-generated files are marked with `*Auto-generated*` at the bottom
- Add `use_cases`, `impact`, and `mitre_attack` fields manually after generation
- ADML string tables must be present for human-readable policy names
