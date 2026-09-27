# Frontend Figma update — 2026-09-16

Source: Figma `q23yWUXBoWa8GIzD0tvLcj`.

## Implementation

- `apps/web/scripts/ui-enhancements.js` loads after the existing application, extending route renderers and API-backed interactions without replacing the approved homepage/dictionary templates.
- `apps/web/styles/features.css` loads last. All routes share the same 1440 × 1201 shell scaling, 285px sidebar and 80px header. Assets and Inter fonts remain local.
- Frames referenced: dashboard 8:66; dictionary 27:137; catalog 69:4; saved 70:654; quiz setup 71:1313; progress 71:1851; history 84:105; flashcards 84:1465/84:1610/84:1292; quiz 71:2075/84:1027; results 84:1749.
- CRUD controls and source filters supplement Figma. Question count remains a 5/10/20 dropdown per the user's earlier decision. Actual vocabulary, counts and progress replace design sample data.
- Bookmark removal does not delete a word. Topic deletion retains the existing cascade confirmation. No authentication or external data storage added.
- Daily counters use local calendar dates. Full local activity history is read from the existing export endpoint to avoid truncating streak calculations to 200 events.

## Verified in the browser

- Topic → flashcards → flip → rate → completion; bookmark and unbookmark.
- Both written quiz directions, correct/incorrect answers, results, answer review and retry mistakes.
- Progress chart data and recent activity.
- Create a word with an inline new topic; edit its meaning.
- Dictionary lookup and local translation (`Hello, how are you?` → `Xin chào, anh khỏe không?`).
- Figma screenshots reviewed at source dimensions; laptop viewport 1366 × 768 checked for horizontal overflow and missing images.
- `node --check` for both JavaScript files and `git diff --check` passed.

Write tests used a separate temporary copy of data, with the frontend junction pointing at the workspace. The application was then restarted against the real workspace data. Test words, quiz attempts and study progress were not copied back.

## Maintenance notes

- Keep background exports un-dimmed: their alpha and crop are already baked in.
- Do not claim automated pixel-diff verification: validation here is screenshot/geometry inspection and interaction tests.
- Legacy learning records without activity timestamps cannot reconstruct historical daily streaks or study duration.
- Browser speech playback depends on voices installed on the machine. Translation requires the local LibreTranslate service started by `run.bat`.
