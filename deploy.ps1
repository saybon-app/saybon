# Run from the SayBon project root (the folder that contains "public"), in PowerShell
git add public/talkletics/index.html public/talkletics/talkletics.css public/talkletics/talkletics.js
git commit -m "Talkletics landing: static smaller header + button, home/dashboard buttons, smaller characters, sequential scene changes, slower pan"
git push origin main   # the GitHub Action deploys hosting automatically
# or deploy straight away:
# firebase deploy --only hosting --project saybon-3e3c2
