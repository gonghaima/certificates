# Certificates

A static showcase page for completed courses and certifications (AI agents, cloud platforms,
developer tooling). Live at the GitHub Pages URL once deployed.

Certificate PDFs live under `certs/`, grouped by issuer. `index.html` renders a filterable
gallery with client-side PDF thumbnails (via [pdf.js](https://mozilla.github.io/pdf.js/)) — no
build step required.

To add a certificate: drop the PDF into `certs/`, add an entry to `assets/certs.js`, commit.
