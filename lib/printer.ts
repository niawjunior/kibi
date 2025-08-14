export const printBadge = (printUrl?: string) => {
  const printWindow = window.open("", "_blank");

  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Badge</title>
          <style>
            /* Force the paper to 4in x 6in (portrait) */
            @page { size: 4in 6in; margin: 0; }
    
            html, body {
              width: 4in;
              height: 6in;
              margin: 0;
              padding: 0;
              background: #fff;
            }
    
            /* Center the row on the page */
            body {
              display: grid;
              place-items: center;
            }
    
            /* Two equal slots across the 4in width */
            .row {
              display: flex;
              gap: 0.2in;                /* spacing between the two badges */
              width: 4in;                 /* full page width */
              height: 6in;                /* full page height */
              justify-content: center;
              align-items: center;
            }
    
            /* Each slot is half the width (minus the gap) and full height */
            .slot {
              width: calc((4in - 0.2in) / 2);
              height: 6in;
              display: grid;
              place-items: center;
              overflow: hidden;
              background: #fff;
            }
    
            /* Image scales proportionally to fit inside the slot */
            .badge {
              max-width: 100%;
              max-height: 100%;
              width: auto;
              height: auto;
              display: block;
            }
          </style>
        </head>
        <body>
          <div class="row">
            <div class="slot">
              <img class="badge" src="${printUrl}" alt="Badge" />
            </div>
            <div class="slot">
              <img class="badge" src="${printUrl}" alt="Card" />
            </div>
          </div>
    
          <script>
            // Wait for images to load so print preview isn't blank
            const imgs = Array.from(document.querySelectorAll('img'));
            let loaded = 0;
            function maybePrint() {
              if (loaded === imgs.length) setTimeout(() => window.print(), 300);
            }
            imgs.forEach(img => {
              if (img.complete) { loaded++; maybePrint(); }
              else { img.onload = () => { loaded++; maybePrint(); }; }
            });
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  }
};
