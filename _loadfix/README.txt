SayBon page-load fix  -  how to apply (2 minutes)

1. Copy this whole "loadfix" folder into your project root as  _loadfix  (next to /public and firebase.json).
2. Preview:   node _loadfix/apply-load-fix.mjs --dry
3. Apply:     node _loadfix/apply-load-fix.mjs
   (every changed file is first copied into _backup_loadfix_<time>/ so you can undo by copying it back)
4. Test locally, then deploy:  firebase deploy --only hosting
5. First visit after deploy: hard refresh once (Ctrl+Shift+R) on your phone and laptop.
