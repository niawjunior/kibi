export const printBadge = (printUrl?: string, rotate: boolean = false) => {
  const printWindow = window.open("", "_blank");

  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Badge</title>
          <style>
            /* Remove fixed paper size to make it responsive */
            @page { margin: 0; }
    
            html, body {
              width: 100%;
              height: 100%;
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
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              box-sizing: border-box;
              position: relative;
            }
    
            /* Image scales proportionally to fit inside the container */
            .badge {
              max-width: 600px;
              max-height: 990px;
              height: auto;
              display: block;
              position: absolute;
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
