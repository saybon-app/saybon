SayBon dashboard update: brighter solid palette, lighter side panel, French for Schools card.

Touches only:
  public/css/dashboard-bright.css   (NEW file)
  public/dashboard/index.html       (2 small insertions, original saved as index.html.bak-bright)

French for Professionals is not modified: no rule in the new CSS can match it.

Undo: delete public/css/dashboard-bright.css, then remove the card-schools block and the
dashboard-bright.css <link> from public/dashboard/index.html (or restore the .bak-bright file).

MANUAL FALLBACK if the script can't run:
 1) In public/dashboard/index.html, after the dashboard-sharp.css <link> line add:
      <link rel="stylesheet" href="/css/dashboard-bright.css?v=1" />
 2) Directly after the closing </div> of the French for Professionals card add:
      <div class="dash-card card-schools" onclick="window.location.href='/schools/'">
        <div class="emoji">&#127979;</div>
        <h3>French for Schools</h3>
        <span>School access only</span>
      </div>
