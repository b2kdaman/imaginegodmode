---
description: Create a new release with version bump, tag, and GitHub release
---

Create a new release by following these steps:

1. Ask the user which version to bump to (e.g., 2.8.7, 2.9.0, 3.0.0)
2. Read the current version from package.json to show the user
3. Update package.json with the new version number
4. Get the previous tag to calculate changes since last release
5. Generate release notes based on commits since the last tag
6. Ask the user if they want to add any extra notes to the release
7. Build the project (run `npm run build`)
8. Build and create zip file (run `npm run build:zip`)
9. Stage all changes (git add .)
10. Commit with message "chore: Bump version to X.X.X"
11. Create a git tag with format "vX.X.X"
12. Push the commit and tag to remote
13. Create a GitHub release using `gh release create` with:
    - The tag name (vX.X.X)
    - Title: "vX.X.X"
    - Release notes including:
      - "## What's Changed" section with commit list since last tag
      - Any extra notes provided by the user
      - Link to full changelog
    - Attach the zip file from the build

Use the AskUserQuestion tool to get the version number and any extra notes from the user.
