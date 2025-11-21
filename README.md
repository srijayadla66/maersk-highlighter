# Maersk PDF Highlighter - React App

This is a minimal React project that loads a PDF and highlights a specified piece of text when you click the `[3]` button in the analysis panel.

## Files included
- `src/App.jsx` — main app component (renders PDF and analysis panel)
- `public/index.html` — base HTML
- `src/index.js` — React entrypoint
- `package.json` — scripts & dependencies
- `README.md` — this file

## Important: PDF path included for local testing

The project references the PDF file using the **absolute local path** you uploaded earlier:

`/mnt/data/Maersk Q2 2025 Interim Report (1).pdf`

That path works **only** when running locally on the same machine where the PDF exists at that exact path (for example, in your current environment). When deploying to the web (Vercel/Netlify), you'll need to **put the PDF in the project's `public/` folder** and update the `PDF_URL` in `src/App.jsx` to `'/Maersk Q2 2025 Interim Report (1).pdf'` or another public URL.

----

## Quick local run (on your machine / same environment):

1. Unzip the project.
2. `cd maersk-highlighter-project`
3. `npm install`
4. `npm start`
5. Open http://localhost:3000 — the app will load the PDF using the absolute path `/mnt/data/Maersk Q2 2025 Interim Report (1).pdf` (so make sure it exists there).

## Deploying to Vercel or Netlify (summary)
- Place the PDF into `public/`.
- Update the `PDF_URL` constant in `src/App.jsx` to `'/Maersk Q2 2025 Interim Report (1).pdf'`.
- Push the repo to GitHub.
- Import the repo into Vercel (or Netlify), build command `npm run build`, publish directory `build`.
- Both platforms will serve the PDF from the `public/` folder so the above relative URL will work.

If you want, I can update the project now to include the PDF in `public/` and prepare a version ready for immediate deploy (without changing the PDF path). Tell me which you'd prefer.
