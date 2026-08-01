# Zscaler AI Security Workshop - Lab Guide

## Open locally

1. Extract the ZIP file.
2. For the recommended local experience—especially so the Credential Store follows you across every module—start the included lightweight local server:
   - Windows: double-click `serve-local.bat`, then open `http://localhost:8000`
   - macOS/Linux: run `./serve-local.sh`, then open `http://localhost:8000`

The guide is offline-ready. Screenshots, styling, navigation, search, task completion, glossary, Credential Store, and dark/light mode are included locally. Opening `index.html` directly also works, but browser storage behavior can vary for local `file://` pages.

## Progress and preferences

Task completion, theme preference, and the Credential Store are kept in browser-local storage. Credential values are not transmitted by the guide. Use only temporary workshop credentials, and clear browser site data—or use the in-page clear control—to remove them.

## Review before publishing

- Confirm workshop URLs, credentials placeholders, participant IDs, product labels, and screenshots against the current lab tenant.
- Review all sample prompts and sample data for suitability before external distribution.
- The source guide is marked ZSCALER CONFIDENTIAL INFORMATION; publish only to an approved repository or bucket with the required access controls.

## Later deployment options

### GitHub Pages

1. Create an approved private or public repository as appropriate.
2. Upload the extracted contents to the repository root.
3. In repository Settings → Pages, select the branch and root folder.
4. Use the generated Pages URL after organizational review.

### Amazon S3 static website

1. Create an approved S3 bucket.
2. Upload all extracted files while preserving folders.
3. Configure `index.html` as the index document.
4. Apply the required bucket policy, encryption, logging, and access controls.
5. Optionally place CloudFront in front of the bucket for HTTPS and controlled distribution.

No build tool or external JavaScript framework is required.


Note: Embedded YouTube videos may be blocked by some local `file://` or browser security settings. For best results, launch the lab using `serve-local.sh` or `serve-local.bat`, or use the direct YouTube fallback link on the Resources page.
