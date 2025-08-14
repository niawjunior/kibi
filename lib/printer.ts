export const printBadge = (printUrl?: string, rotate: boolean = false) => {
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
    
            /* Center content on the page */
            body {
              display: grid;
              place-items: center;
            }
    
            /* Container for the badge */
            .badge-container {
              width: 4in;
              height: 6in;
              display: flex;
              justify-content: center;
              align-items: center;
            }
    
            /* Image scales proportionally to fit inside the container */
            .badge {
              max-width: 100%;
              max-height: 100%;
              width: auto;
              height: auto;
              display: block;
              ${rotate ? "transform: rotate(270deg);" : ""}
            }
          </style>
        </head>
        <body>
          <div class="badge-container">
            <img class="badge" src="${printUrl}" alt="Badge" />
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
