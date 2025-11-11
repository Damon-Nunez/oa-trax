# OA:Trax - Git Branch Workflow Cheat Sheet

This cheat sheet outlines the Git workflow for the OA:Trax project, including branch creation, feature development, and merging strategy.

---

## 1. Initialize Git Repository

```bash
cd path/to/oa-trax
git init
git add .
git commit -m "Initial commit - project scaffold"
```

---

## 2. Connect to GitHub

```bash
git remote add origin https://github.com/yourusername/oa-trax.git
git branch -M main
git push -u origin main
```

---

## 3. Create Dev Branch

```bash
git checkout -b dev
git push -u origin dev
```

---

## 4. Create Feature Branches (From Dev)

Always create feature branches from `dev`:

```bash
git checkout dev
git checkout -b feature/teach-mode
# Work on your feature
git add .
git commit -m "Teach mode initial"
git push -u origin feature/teach-mode
```

Other examples:
```
feature/parser
feature/dashboard
feature/interview-mode
```

---

## 5. Merge Feature Back Into Dev

```bash
git checkout dev
git pull
git merge feature/teach-mode
git push
```

Repeat for all features.

---

## 6. Merge Dev Into Main

When dev is stable and ready for release:

```bash
git checkout main
git pull
git merge dev
git push
```

---

## 7. Branch Flow Diagram

```
Features (teach-mode, parser, dashboard)
       ↓
        dev branch
       ↓
        main branch (stable, deploy-ready)
```

---

## Notes

- Keep `main` clean and production-ready.
- Use feature branches for all new development.
- Merge completed features into `dev` first, then into `main`.
- Delete feature branches after merging to keep repo clean.
