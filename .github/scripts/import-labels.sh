#!/usr/bin/env bash
# Run: bash .github/scripts/import-labels.sh
set -e
REPO="SamoTech/PolicyForge"
echo "Importing labels for $REPO..."
gh label import "$REPO" .github/labels.yml --force
echo "Done!"
