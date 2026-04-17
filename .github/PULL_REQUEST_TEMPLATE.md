## Description

<!-- Summarize the change. Include the policy IDs affected. -->

## Type of Change

- [ ] New policy document
- [ ] Policy correction (wrong value / path / OMA-URI)
- [ ] Script fix (PowerShell / Python)
- [ ] Documentation update
- [ ] New template
- [ ] CI/CD / tooling change

## Policy Accuracy Checklist

- [ ] Registry path verified against official Microsoft documentation or CIS/DISA source
- [ ] Expected value verified (correct data type: DWord / String / ExpandString)
- [ ] Policy ID matches canonical mapping in `policies/windows/README.md`
- [ ] OMA-URI / CSP path tested or cross-referenced with Microsoft Intune documentation
- [ ] MITRE ATT&CK technique reference included (where applicable)

## Schema Compliance

- [ ] New policy documents include YAML frontmatter (`id`, `title`, `category`, `risk`, `mitre`)
- [ ] Document sections follow `_TEMPLATE.md` structure
- [ ] No new IDs conflict with existing policy IDs in `policies/windows/README.md`

## Testing

- [ ] PowerShell scripts validated for syntax (`Test-Path` not assumed)
- [ ] Tested on at least one target Windows version (state which)
- [ ] `verify.ps1` run after any registry-touching changes

## References

<!-- Links to CIS Benchmark, DISA STIG, Microsoft Docs, or other authoritative sources used. -->
