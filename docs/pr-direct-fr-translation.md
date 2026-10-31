Retranslate Chinese and English directly from French

## Summary
- Retranslates all Chinese and English text (1,301 articles, titles and contents labels) directly from the French with Claude Opus 5.5, with no pivot language. This replaces the Argos machine drafts and the English-pivot Chinese.
- Generalises the Claude pipeline to both languages: `scripts/translate-claude-direct.py --lang zh|en` and `scripts/claude-direct-labels.py [zh|en]`. `finalize` in `scripts/translate-direct-zh.py` is shared, records per-language `translationProvenance`, and backfills missing labels.
- Numeric check: commas in French article lists such as `221-1,221-18` are no longer read as thousands separators. Remaining flags: 0 Chinese, 3 English (French spells out the petty-offence class, e.g. "quatrième classe" vs "4th class").
- Updates the site copy (about text and AI notice, in all three interface languages) and the README.

## Notes
- Translations are AI-generated (`ai-unreviewed`) and have had no professional legal review.
- English glossary: crime = felony, délit = misdemeanour, contravention = petty offence, réclusion criminelle = criminal imprisonment, amende = fine.
- The live site (law.xyufr.com) has not been redeployed from this branch.

## Test plan
- [x] `npm test` (12 pass)
- [x] `npm run build`
- [x] `npm run deploy:check` (dry run)
- [x] Checked in the local dev server that the new data loads and English renders

🤖 Generated with [Claude Code](https://claude.com/claude-code)
