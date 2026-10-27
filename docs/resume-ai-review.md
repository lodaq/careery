# Resume editor and AI Review

The Resume studio uses a centered Edit / Customize / AI Review switcher, a section rail in Edit, and a persistent document proof. Customize and Review use the entire left pane. On phones, navigation scrolls horizontally and Preview opens the document pane. Existing green semantic tokens, dark mode, keyboard controls and reduced motion remain in use. Template thumbnails render the actual Resume template with the user's current content rather than placeholder lines.

## OpenRouter

Set `OPENROUTER_API_KEY` in ignored `.env.local`. Optional `OPENROUTER_MODEL` defaults to `openrouter/free`, the model router in the user's supplied example. Keys are server-side only. No provider SDK or new runtime dependency is needed.

AI Review runs only after the user clicks Run AI Review. The editor saves successfully first. The same-origin POST route reads that saved version and checks its revision. It sends the visible headline, summary, section headings, employer/institution context, dates and achievements, plus the optional target role. Name, address, email, phone and links in the contact fields are excluded. Personal information typed into a summary or target role is still part of that wording. OpenRouter and its selected provider receive the request; the app makes no promise about their retention policies.

The route bounds request and output sizes, rejects cross-origin calls, allows one pending review per Resume, applies a 90-second upstream timeout, and validates structured feedback before returning it. Provider errors are sanitized. Model instructions treat Resume text as data and forbid invented credentials, metrics, hiring predictions and ATS claims.

The writing score is AI-generated editorial feedback, not an employability rating. Review results live in editor memory, survive switching modes, and are marked stale when reviewed content changes. A proposed summary can be applied only through an explicit button and only while the review still matches the current wording. The normal autosave flow then persists it. Existing deterministic readiness checks remain separately labeled Local checks.

## Validation

Unit tests cover response validation, contact-field exclusion, request origin checks, missing credentials and sanitized upstream errors. Browser tests cover mode switching, mobile overflow, request failure/retry, saved revision submission, stale feedback and explicit summary application. Live credential verification uses synthetic text, not personal Resume content.

API reference: https://openrouter.ai/docs/api/api-reference/chat/create-a-chat-completion
Free router: https://openrouter.ai/docs/guides/routing/model-variants/free

Finding actions now show proposed before/after wording and apply validated edits to existing descriptive fields. The server and editor allow only current visible headline, summary, project descriptions and achievement text; contact fields, dates, employers, titles and credentials cannot be patched. Each edit must match its original text and finding section. Applying one suggestion preserves other language versions and leaves unrelated suggestions available; manual edits invalidate the review. Every finding exposes Apply suggestion. If a finding has no concrete patch, clicking it requests a focused revision from OpenRouter, then validates and applies the result without requiring another review. Missing skills can create entries only by quoting existing visible Resume phrases, with evidence checked on both server and client; duplicates are excluded. Provider failures and suggestions unsupported by existing facts show a retryable inline error and leave the Resume unchanged. No credentials, tools, or other facts are invented. Concurrent manual changes invalidate an in-flight application.

Each proposed text replacement or skill addition has a separate Apply suggestion control. A click applies exactly one change; other proposals remain available. If a finding needs generation, the initial click applies only its first validated change and presents the rest as individual actions. Applied state survives switching editor modes.

Reviews now omit findings whose replacements or skill additions fail validation. Progression cannot be inferred from employment dates alone. Applying an unsupported older finding retires its action with a neutral explanation, preserving the Resume rather than trapping the user in a 422 retry loop. Provider/network failures still offer retry.

The editor preview now shows only the live document and its main toolbar. PDF rendering happens on Download PDF; the duplicate live/PDF toggles, metadata block, and footer help are removed. Contact details share a compact, wrapping row with accessible mail, phone and web links in both the live document and export.
