import React, { useEffect, useRef, useState } from 'react';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/build/pdf';
import 'pdfjs-dist/build/pdf.worker.entry';
import './index.css';

const PDF_URL = '/Maersk Q2 2025 Interim Report (1).pdf';


GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

export default function App() {
  const containerRef = useRef(null);
  const [pdf, setPdf] = useState(null);
  const overlaysRef = useRef({});

  useEffect(() => {
    (async () => {
      try {
        // encodeURI to safely handle spaces/parentheses in file name
        const loadingTask = getDocument(encodeURI(PDF_URL));
        const pdfDoc = await loadingTask.promise;
        setPdf(pdfDoc);
      } catch (err) {
        console.error('Failed to load PDF:', err);
        alert('Failed to load PDF. Make sure the file exists at: ' + PDF_URL);
      }
    })();
  }, []);

  useEffect(() => {
    if (!pdf) return;
    (async () => {
      const num = pdf.numPages;
      const container = containerRef.current;
      container.innerHTML = '';

      for (let p = 1; p <= num; p++) {
        const page = await pdf.getPage(p);
        const viewport = page.getViewport({ scale: 1.5 });

        const pageDiv = document.createElement('div');
        pageDiv.className = 'page-container';
        pageDiv.style.position = 'relative';
        pageDiv.style.marginBottom = '16px';

        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;

        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.style.position = 'absolute';
        overlay.style.left = 0;
        overlay.style.top = 0;
        overlay.style.width = `${viewport.width}px`;
        overlay.style.height = `${viewport.height}px`;
        overlay.style.pointerEvents = 'none';

        overlaysRef.current[p] = { overlay, viewport };

        pageDiv.appendChild(canvas);
        pageDiv.appendChild(overlay);
        container.appendChild(pageDiv);
      }
    })();
  }, [pdf]);

  const highlightText = async (query) => {
    if (!pdf) return;
    // clear previous highlights
    Object.values(overlaysRef.current).forEach(({ overlay }) => (overlay.innerHTML = ''));

    let foundAny = false;

    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const textContent = await page.getTextContent();
      const entry = overlaysRef.current[p];
      if (!entry) continue;
      const { overlay, viewport } = entry;
      const matches = [];

      // find matching text items and compute approximate bounding boxes
      textContent.items.forEach((item) => {
        const str = item.str || '';
        if (str.toLowerCase().includes(query.toLowerCase())) {
          const tx = item.transform;
          const x = tx[4];
          const y = tx[5];
          const fontHeight = Math.hypot(tx[1], tx[3]) || 10;
          const [sx, , , sy, txv, tyv] = viewport.transform;
          const vx = x * sx + txv;
          const vy = viewport.height - (y * sy + tyv);
          const width = (item.width || str.length * fontHeight * 0.5) * sx;
          const height = fontHeight * sy;
          matches.push({ x: vx, y: vy - height, width, height });
        }
      });

      // draw highlights for matches on this page
      if (matches.length > 0) {
        foundAny = true;
        matches.forEach((m) => {
          const rect = document.createElement('div');
          rect.style.position = 'absolute';
          rect.style.left = `${m.x}px`;
          rect.style.top = `${m.y}px`;
          rect.style.width = `${Math.max(2, m.width)}px`;
          rect.style.height = `${Math.max(6, m.height)}px`;
          rect.style.background = 'rgba(255, 255, 0, 0.6)';
          rect.style.pointerEvents = 'none';
          overlay.appendChild(rect);
        });

        // Scroll the highlighted page into view (smooth)
        const overlayEl = overlaysRef.current[p].overlay;
        overlayEl.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // === UX improvement: pulse the analysis card for feedback ===
    // This is the exact place you asked to add the two lines.
    // It runs after highlights are drawn and will briefly animate the analysis card.
    const card = document.querySelector('.analysis-card');
    if (card) {
      card.classList.remove('pulse');
      // small timeout to re-trigger animation class
      setTimeout(() => card.classList.add('pulse'), 10);
    }

    // optional: if nothing found, you can notify user
    if (!foundAny) {
      // small UI feedback instead of alert; adjust as you prefer
      console.info('No matches found for query:', query);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', gap: 12, padding: 12 }}>
      <div style={{ flex: 1, overflow: 'auto', border: '1px solid #ddd', padding: 8 }}>
        <div ref={containerRef} />
      </div>

      {/* Analysis panel — styled via src/index.css (replace your right column with this) */}
      <div className="analysis-panel">
        <div className="analysis-card">
          <header className="analysis-header">
            <h3>Analysis</h3>
            <small className="muted">A short summary of findings</small>
          </header>

          <div className="analysis-body">
            <p className="lead">
              No extraordinary or one-off items affecting <strong>EBITDA</strong> were reported in Maersk’s Q2 2025 results.
            </p>

            <h4>Findings</h4>
            <ul className="findings">
              <li>Page 3 — Highlights Q2 2025 <span className="ref">[1]</span></li>
              <li>Page 5 — Review Q2 2025 <span className="ref">[2]</span></li>
              <li>
                Page 15 — Condensed Income Statement
                <button
                  className="ref-button"
                  onClick={() => highlightText('Gain on sale of non-current assets')}
                  title="Highlight on page"
                >
                  [3]
                </button>
              </li>
            </ul>

            <h4 className="support-title">Supporting Evidence</h4>
            <p className="support">
              [3] A.P. Moller – Maersk Q2 2025 Interim Report — Page 15 →
            </p>
          </div>

          <footer className="analysis-footer">
            <button
              className="small-btn"
              onClick={() => {
                const left = document.querySelector('.page-container');
                if (left) left.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              Reset view
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
