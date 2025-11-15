# Git: Merging `dev` into `main` and Committing

```bash
# 1. Switch to main branch
git checkout main

# 2. Merge dev branch into main
git merge dev
# Resolve any merge conflicts if prompted

# 3. Add changes and commit
git add .
git commit -m "Merge dev branch changes: user CRUD + AI integration"

# 4. Push to remote
git push origin main
