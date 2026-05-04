# Security & Stability Weaknesses
> Full checklist of problems that cause React / HTML web apps to fail, crash, or become dysfunctional.
> Every problem number matches the same number in `security_measures.md`.
> Labels: [React] = React specific · [HTML] = Plain HTML/JS · [Both] = Affects either

---

## 🏗️ ARCHITECTURE & STRUCTURE

1. **No separation of concerns** `[Both]` — UI, business logic, and data fetching all jammed into the same file or function. Changing one thing breaks three others.

2. **Prompt-stitched codebase** `[Both]` — Each AI session adds code without awareness of what came before. Duplicate functions, conflicting logic, redundant components doing the same job differently.

3. **No single source of truth** `[React]` — The same data stored in multiple `useState` hooks across different components, updated inconsistently, showing different values in different places.

4. **God components** `[React]` — One massive component doing 15 things — fetching, rendering, handling forms, managing modals. Impossible to debug or extend.

5. **God functions / spaghetti scripts** `[HTML]` — One giant `script.js` with every interaction, fetch, and DOM manipulation crammed in with no structure.

6. **Circular dependencies** `[React]` — Components or modules importing each other in loops, causing silent failures or full build crashes.

7. **No folder/file structure** `[React]` — Everything dumped in `/src` with no organisation. Imports break as the project scales.

8. **Tight coupling everywhere** `[Both]` — Components and modules so intertwined that touching one forces changes across the entire codebase.

9. **Mixing concerns across layers** `[React]` — Database logic inside UI components, API calls inside event handlers, business rules scattered randomly.

---

## 💥 RUNTIME CRASHES & ERRORS

10. **No error handling** `[Both]` — No `try/catch` around API calls, async operations, or risky logic. One bad response causes a full crash.

11. **No error boundaries** `[React]` — One component throwing an error takes down the entire page. React's error boundary system is never set up.

12. **No defensive rendering** `[React]` — Code like `{user.profile.name}` with no null check. The moment the API returns `null` or `undefined`, the whole component crashes.

13. **Unhandled promise rejections** `[Both]` — Async functions fail silently or throw uncaught errors that kill the app with no user feedback.

14. **Type mismatches** `[Both]` — A function expects a number, receives a string. Works during development, silently breaks in production.

15. **Null/undefined chaining without guards** `[Both]` — Accessing `data.user.profile.avatar.url` without optional chaining (`?.`) or null checks. One missing layer = instant crash.

16. **Division by zero / NaN math** `[Both]` — Calculations on user-supplied or API-supplied numbers with no check for zero, `null`, or `NaN`.

17. **Infinite loops** `[Both]` — Logic conditions that never resolve, locking up the browser tab entirely.

18. **Infinite re-render loops** `[React]` — A `useEffect` updating state that triggers the same `useEffect` again. The most common React-specific crash.

19. **Stack overflow from bad recursion** `[Both]` — Recursive functions with no base case, especially in AI-generated tree or nested data handling.

20. **Calling setState on unmounted component** `[React]` — Async operations that complete after a component unmounts, triggering state updates on something that no longer exists.

---

## 🔄 STATE MANAGEMENT

21. **State chaos / no structure** `[React]` — `useState` hooks scattered randomly across deeply nested components with no clear ownership or flow.

22. **Prop drilling hell** `[React]` — Passing the same prop through 6 layers of components because no context or state manager was set up.

23. **Mutating state directly** `[React]` — Doing `state.items.push(newItem)` instead of spreading a new array. Re-renders never trigger because reference equality doesn't change.

24. **Stale closures** `[React]` — Event handlers and effects capture old values of state at the time they were created and act on outdated data.

25. **useEffect with wrong or missing dependencies** `[React]` — Effects either fire too often (causing loops) or not enough (causing stale data) due to incorrect dependency arrays.

26. **Derived state stored in state** `[React]` — Storing values in `useState` that could just be computed from other state. They drift out of sync constantly.

27. **Local state that should be global** `[React]` — Critical app data (auth status, cart, user info) buried in a component that gets unmounted and lost.

28. **Global state that should be local** `[React]` — Trivial UI state (tooltip open, dropdown toggle) polluting a global store and causing unnecessary re-renders across the whole app.

29. **Over-fetching / redundant state** `[React]` — The same data fetched multiple times by sibling components with no shared cache, causing inconsistency and wasted requests.

30. **No optimistic updates** `[React]` — Every action waits for a server round trip, making the app feel broken and slow even when the network is fine.

---

## ⏱️ ASYNC & TIMING

31. **Race conditions** `[Both]` — Two async calls fire and the first to resolve wins, regardless of which is newer. Wrong data is shown in the UI.

32. **No loading guards** `[Both]` — Functions run on data before it has been fetched. Invisible in development, fails constantly in the real world.

33. **No debouncing or throttling** `[Both]` — Search inputs or scroll listeners firing hundreds of times per second, hammering APIs and choking the browser.

34. **Memory leaks — uncleaned intervals** `[Both]` — `setInterval` keeps running after the component or page that created it is gone.

35. **Memory leaks — uncleaned event listeners** `[HTML]` — `addEventListener` calls stacking up every time a function runs, never removed.

36. **Memory leaks — uncleaned subscriptions** `[React]` — WebSocket connections, observables, or third-party listeners set up in `useEffect` with no cleanup return function.

37. **`setTimeout` used as a timing hack** `[Both]` — Using `setTimeout(fn, 300)` to "wait" for something to be ready instead of properly awaiting it. Breaks on slow devices.

38. **Async/await mixed with raw `.then()` chains** `[Both]` — Inconsistent async patterns that interact unpredictably and are impossible to debug.

39. **No AbortController on fetch** `[React]` — API requests from effects that cannot be cancelled when the component unmounts. Causes stale updates and memory leaks.

---

## 🌐 API & NETWORK

40. **No input validation** `[Both]` — Raw user input fed directly into API calls. Empty strings, special characters, and unexpected types crash things immediately.

41. **Hardcoded API endpoints** `[Both]` — URLs baked into source code that break the moment the environment changes.

42. **API keys exposed in frontend code** `[Both]` — Credentials sitting in client-side JS, visible to anyone who opens DevTools. Catastrophic for React SPAs.

43. **No rate limit handling** `[Both]` — Code hammers an API with no retry logic, backoff, or queue. Hits the limit and dies silently.

44. **No pagination handling** `[Both]` — Fetching page 1 of results and treating it as the full dataset.

45. **No timeout handling** `[Both]` — API calls that hang indefinitely, freezing the UI forever with no recovery.

46. **CORS misconfiguration** `[Both]` — Works in development, completely blocked in production. Very common in React apps calling external APIs.

47. **Assuming API response shape never changes** `[Both]` — One backend update and the entire frontend breaks because nothing validates the shape of incoming data.

48. **No retry logic** `[Both]` — One flaky network response = permanent failure state with no recovery attempt.

49. **No loading / error / empty states** `[React]` — Components render in three states (loading, error, data) but only one is handled. Users see crashes or blank screens.

50. **Waterfall API calls** `[Both]` — Calls that could run in parallel made sequentially, multiplying load time needlessly.

---

## 📦 DEPENDENCIES & BUILD

51. **Fragile/unpinned dependency versions** `[React]` — No exact versions. Every fresh `npm install` potentially pulls in a breaking change.

52. **Conflicting package versions** `[React]` — Two packages needing different versions of the same dependency, causing subtle runtime errors.

53. **Bloated unused dependencies** `[React]` — Packages installed once and never removed, inflating the bundle and slowing load times.

54. **Missing peer dependencies** `[React]` — Works locally but crashes in CI or on another machine because an assumed package is not installed.

55. **No lock file committed** `[React]` — `package-lock.json` or `yarn.lock` not in version control. Every install resolves differently.

56. **Wrong React version assumptions** `[React]` — AI-generated code written for React 17 patterns dropped into a React 18/19 project.

57. **Dead code that is actually load-bearing** `[Both]` — Code that looks unused but is referenced indirectly. Deleting it breaks things in non-obvious ways.

58. **Tree shaking broken by bad imports** `[React]` — Importing entire libraries (`import _ from 'lodash'`) instead of specific functions, bloating the bundle.

---

## 🎨 UI & STYLING

59. **CSS specificity wars** `[Both]` — Styles added prompt-by-prompt create cascading conflicts. New components randomly break existing layouts.

60. **No responsive design** `[Both]` — Looks fine on the developer's screen. Completely broken on mobile.

61. **Hardcoded pixel values** `[Both]` — `width: 423px` that breaks on any other viewport.

62. **Z-index chaos** `[Both]` — Modals behind dropdowns, tooltips hidden under navbars. AI-generated z-index values are essentially random guesses.

63. **No dark mode handling** `[Both]` — Hardcoded light-mode colors that become unreadable when system dark mode is on.

64. **Assets from hardcoded CDN URLs** `[Both]` — External font or icon CDN links that go down or change, breaking the entire visual layer.

65. **Animations that never terminate** `[Both]` — CSS animations or JS transitions that run forever because no completion condition was set.

66. **Layout shift on data load** `[React]` — No skeleton screens or reserved space. The whole page jumps and reflows when async data arrives.

67. **Inline styles overriding everything** `[React]` — AI adds `style={{}}` directly on elements. These override all CSS and become impossible to manage at scale.

68. **className conflicts in component libraries** `[React]` — Mixing Tailwind, CSS modules, and inline styles across components with no convention, creating unpredictable overrides.

---

## 🔐 SECURITY

69. **No auth checks on protected routes** `[React]` — Route protection only on the frontend. Knowing the URL is enough to access private pages.

70. **XSS vulnerabilities** `[Both]` — User-generated content rendered as raw HTML (`dangerouslySetInnerHTML` in React, `innerHTML` in HTML) with no sanitisation.

71. **SQL/NoSQL injection** `[Both]` — User input fed directly into database queries without sanitisation on the backend layer.

72. **Secrets in `.env` files committed to Git** `[React]` — `.env` pushed to public repos, exposing API keys and credentials.

73. **No HTTPS enforcement** `[Both]` — Mixed content warnings or plain HTTP usage in production.

74. **No CSRF protection** `[Both]` — State-changing requests with no origin validation.

75. **Overly permissive CORS** `[Both]` — `Access-Control-Allow-Origin: *` set globally to "fix" a CORS error without understanding the implications.

76. **JWT tokens stored in localStorage** `[React]` — Accessible to any JavaScript on the page, making them vulnerable to XSS attacks.

---

## 🗃️ DATA & STORAGE

77. **No data normalisation** `[Both]` — Deeply nested, duplicated data structures that are expensive to update and drift out of sync easily.

78. **LocalStorage overload** `[Both]` — Storing large or sensitive data in localStorage without considering the 5MB size limit or security implications.

79. **No cache invalidation** `[React]` — Cached data never expires or refreshes. Users see stale content indefinitely.

80. **Schema mismatches** `[Both]` — What the frontend sends does not match what the backend expects. No validation layer in between.

81. **Serialisation errors** `[Both]` — Storing objects with circular references or non-serialisable values in JSON-based storage, causing silent data loss.

---

## 🧪 TESTING & QUALITY

82. **Zero tests** `[Both]` — No unit, integration, or end-to-end tests. Every change is a gamble.

83. **No logging or monitoring** `[Both]` — When things break in production there is no record of what happened or why.

84. **No staging environment** `[Both]` — Changes go straight to production with no testing buffer.

85. **Magic numbers with no explanation** `[Both]` — `if (status === 4)` with no constants or comments explaining what 4 means.

86. **Console.logs left in production** `[Both]` — Debugging logs committed to production, leaking internal data and logic in the browser console.

---

## 🧠 LOGIC & CODE QUALITY

87. **Redundant/conflicting event handlers** `[Both]` — Same button wired to two handlers that fight each other.

88. **Event listeners re-added on every render** `[React]` — Adding `addEventListener` inside a component body or effect without proper cleanup. Each render stacks another listener.

89. **Boolean logic errors** `[Both]` — Conditions evaluating the opposite of intent due to operator confusion (`&&` vs `||`, double negations).

90. **Off-by-one errors** `[Both]` — Loop boundaries, array indices, and pagination page numbers all slightly wrong at edge cases.

91. **Dead-end error states** `[Both]` — The app shows an error but gives the user no way to recover. A full page refresh is the only option.

92. **Commented-out code left everywhere** `[Both]` — Abandoned logic blocks that confuse future debugging and suggest the code was never fully understood.

93. **Key prop misuse** `[React]` — Using array index as `key` in lists. React cannot tell items apart, causing wrong components to re-render or state to bleed between list items.

94. **Unnecessary re-renders** `[React]` — Components re-rendering constantly because props or state references change even when values do not. No `memo`, `useMemo`, or `useCallback` where needed.

95. **Context causing full app re-renders** `[React]` — One global context value changing triggers every consumer across the entire tree to re-render simultaneously.

96. **useReducer/useState mismatch** `[React]` — AI picks one pattern and sticks with it regardless of fit, creating over-engineered simple state or under-powered complex state.

---

## ⚙️ PERFORMANCE

97. **No code splitting or lazy loading** `[React]` — The entire app bundle downloaded on first load. No `React.lazy()` or dynamic imports anywhere.

98. **Unoptimised images** `[Both]` — Full-resolution images served with no compression, resizing, or lazy loading.

99. **No memoisation** `[React]` — Expensive calculations re-run on every render because nothing is wrapped in `useMemo`.

100. **Prop reference instability** `[React]` — Objects and functions recreated on every render, causing child components wrapped in `memo` to re-render anyway.

101. **Heavy libraries for trivial tasks** `[Both]` — Importing a 40KB library to format one date when a one-liner would do.

102. **No virtualisation for long lists** `[React]` — Rendering 500+ list items directly into the DOM instead of using a virtual list. Kills performance immediately.

103. **Scroll/resize listeners without optimisation** `[Both]` — Heavy computations triggered on every pixel of scroll with no throttle or debounce.

---

## 🚀 DEPLOYMENT & ENVIRONMENT

104. **Works on my machine syndrome** `[Both]` — Code relying on local environment specifics (Node version, local files, env vars) that break everywhere else.

105. **No environment variable management** `[React]` — Dev, staging, and production using the same config, or production missing env vars entirely.

106. **No build optimisation** `[Both]` — Shipping unminified, uncompressed code because the build pipeline was never set up.

107. **`window`/`document` accessed in SSR context** `[React]` — Browser globals accessed during server-side rendering. Common when mixing React with Next.js. Causes immediate build crashes.

108. **No 404 / fallback route** `[Both]` — Unknown routes serve a blank white screen with zero feedback to the user.

109. **No graceful degradation** `[Both]` — If JavaScript fails to load, the entire page is completely empty and unusable.

110. **React dev build shipped to production** `[React]` — Running a development build in production. Massive bundle, slow performance, and internal React warnings exposed to users.

---

*See `security_measures.md` for the solution to every problem above. Numbers match exactly.*
