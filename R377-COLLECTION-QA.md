# Moleculox R377 / v8.7.209 — Collection layout and Legends fix

Based on the supplied **R376 iOS** source. Changes are restricted to My Molecules / Science Legends collection rendering and build version/cache markers. No board/atom/level/Par data was changed.

- Molecule card grid uses minmax(0,1fr) instead of implicit min-content columns to avoid right-side overflow on phone widths. Cards and long localized descriptions can shrink/wrap.
- At widths <=359 CSS pixels, molecule cards change to one column for legibility; other phones retain two columns.
- Science Legends' LOCKED mask honors HTML `hidden`, and cannot cover an unlocked card (the prior author `display:flex` overrode the native `hidden` rule).
- Opening/reopening the Legends collection **does not** replay any pending discovery animation. Existing cards render once per list with unique IDs. The one-time reveal in level-completion path remains unchanged.
- No save fields are migrated or reset; earned Legends/rewards preserved. No Firebase/Auth/App Check/Google or email sign-in fixes are included in this UI-only patch.

Automated QA performed in a desktop Chromium layout harness (not physical iPhone): widths 320, 359, 360, 375, 390, 393, 414, 430, 480, 600, 768 CSS pixels: grid/card bounds fit; hidden unlocked overlay; locked overlay remains. Browser JS fixture: five repeated Legends entries created no duplicate nodes and no auto-reveal. Native source verifier and JS syntax checks passed after full www payload restore. Actual device and CodeMagic build should still be tested before release.

The source zip includes split full `www` payload; Codemagic/prepare scripts restore it. Unzipping and opening the tiny `www` stub does not represent the complete playable build.
