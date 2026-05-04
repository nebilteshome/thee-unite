# Security & Stability Measures
> Solutions to every problem listed in `security_weaknesses.md`.
> Numbers match exactly. Problem #N is solved by Solution #N.
> 🤖 = AI can fix this autonomously · 👤 = Requires human action

---

## 🏗️ ARCHITECTURE & STRUCTURE

### 1. No separation of concerns
🤖 **AI Fix:** Refactor the codebase into distinct layers — split files into `/components` (UI only), `/hooks` (logic and data fetching), `/services` (API calls), and `/utils` (helpers). Move all fetch calls out of components into custom hooks or service files.
👤 **Human Fix:** Decide upfront on a folder convention and enforce it. Review the structure before handing off to AI for any new feature.

---

### 2. Prompt-stitched codebase
🤖 **AI Fix:** Audit the entire codebase for duplicate functions, components, and logic. Consolidate them into single canonical versions. Remove all redundant copies. Add a codebase map comment at the top of key files listing what exists and where.
👤 **Human Fix:** Start each AI session by pasting in the relevant existing files so the AI has full context. Never ask the AI to "add a feature" without showing it the current code first.

---

### 3. No single source of truth
🤖 **AI Fix:** Identify all duplicated state. Lift shared state to the nearest common ancestor or move it into a context or global store (Zustand, Redux Toolkit, Jotai). Remove all secondary copies and replace them with references to the single source.
👤 **Human Fix:** Before building a new feature, decide: where does this data live? Make that decision explicit before any code is written.

---

### 4. God components
🤖 **AI Fix:** Break the god component into smaller focused components. Extract each logical section (form, list, modal, fetch logic) into its own file. Each component should do one thing. Use composition to reassemble them.
👤 **Human Fix:** If a component file exceeds ~150 lines, treat that as a signal to split it. Set this as a rule when prompting AI.

---

### 5. God functions / spaghetti scripts
🤖 **AI Fix:** Split `script.js` into modules — one file per concern (e.g., `api.js`, `dom.js`, `events.js`, `utils.js`). Use ES module `import/export` or a module bundler to wire them together.
👤 **Human Fix:** Commit to using a bundler (Vite, Webpack) even for plain HTML projects. Do not let a single script file grow beyond 100 lines.

---

### 6. Circular dependencies
🤖 **AI Fix:** Run `madge --circular .` or use ESLint's `import/no-cycle` rule to detect circular imports. Resolve them by extracting shared logic into a third file that both modules import from.
👤 **Human Fix:** Install and enable the `eslint-plugin-import` rule `no-cycle`. Let CI catch this automatically.

---

### 7. No folder/file structure
🤖 **AI Fix:** Reorganise the project into a standard structure:
```
/src
  /components   → UI components
  /pages        → Route-level components
  /hooks        → Custom hooks
  /services     → API/data layer
  /store        → Global state
  /utils        → Helper functions
  /types        → TypeScript types/interfaces
  /assets       → Images, fonts
```
Update all import paths accordingly.
👤 **Human Fix:** Agree on the folder structure before starting a project. Document it in a `README.md` so AI sessions have a reference.

---

### 8. Tight coupling everywhere
🤖 **AI Fix:** Introduce clear interfaces between modules. Replace direct imports of implementation details with abstracted service functions. Use dependency injection patterns where appropriate. Ensure components receive data via props, not by reaching into other component internals.
👤 **Human Fix:** When reviewing AI output, ask: "If I deleted this file, how many other files would break?" More than two is a warning sign.

---

### 9. Mixing concerns across layers
🤖 **AI Fix:** Move all database/API logic out of UI components into a `/services` layer. UI components call service functions only — they never contain raw fetch calls, query strings, or business rule conditions.
👤 **Human Fix:** Enforce a rule in your AI prompts: "Never put fetch calls directly inside React components. Always use a custom hook or service file."

---

## 💥 RUNTIME CRASHES & ERRORS

### 10. No error handling
🤖 **AI Fix:** Wrap all async functions, API calls, and risky operations in `try/catch` blocks. Return structured error objects. Add a global `window.onerror` and `window.onunhandledrejection` handler to catch anything that slips through.
👤 **Human Fix:** Make this a standing instruction in every AI prompt: "Every async function must have try/catch with meaningful error messages."

---

### 11. No error boundaries
🤖 **AI Fix:** Create a reusable `ErrorBoundary` component using React's class-based error boundary pattern (or use the `react-error-boundary` library). Wrap all major route sections and async data components with it. Provide a fallback UI with a retry button.
👤 **Human Fix:** Treat error boundaries like seatbelts — non-negotiable on every project. Add one at the app root and one around each major section.

---

### 12. No defensive rendering
🤖 **AI Fix:** Add null/undefined guards before every data access in JSX. Use optional chaining (`?.`), nullish coalescing (`??`), and conditional rendering (`{data && <Component />}`). Add default prop values and fallback states for all data-dependent renders.
👤 **Human Fix:** When reviewing components, look for any place data is accessed without a guard. Treat unguarded access as a bug, not a style issue.

---

### 13. Unhandled promise rejections
🤖 **AI Fix:** Audit all `async` functions and `.then()` chains and add `.catch()` or `try/catch` to every one. Add a global handler:
```js
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection:', event.reason);
});
```
👤 **Human Fix:** Enable the `no-floating-promises` ESLint/TypeScript rule to catch these at build time.

---

### 14. Type mismatches
🤖 **AI Fix:** Add TypeScript (or at minimum JSDoc types) to all function signatures. Add runtime validation at API boundaries using Zod or Yup to ensure incoming data matches expected types before it enters the app.
👤 **Human Fix:** Migrate to TypeScript if not already using it. Even partial TypeScript coverage on API responses and props catches the most common mismatches.

---

### 15. Null/undefined chaining without guards
🤖 **AI Fix:** Replace all unguarded property chains with optional chaining: `data?.user?.profile?.avatar?.url`. Add nullish coalescing fallbacks: `data?.user?.name ?? 'Anonymous'`. Audit every component prop and API response access.
👤 **Human Fix:** Enable TypeScript's `strictNullChecks` option. It will flag every unguarded access at compile time.

---

### 16. Division by zero / NaN math
🤖 **AI Fix:** Add guards before every division: `denominator !== 0 ? numerator / denominator : 0`. Wrap user-input numbers in `Number(value) || 0` or `isNaN(value) ? fallback : value` before using them in calculations.
👤 **Human Fix:** Treat any calculation involving user input or API data as potentially unsafe. Always validate before computing.

---

### 17. Infinite loops
🤖 **AI Fix:** Audit all `while`, `for`, and recursive logic for exit conditions. Add a loop counter guard as a safety net:
```js
let guard = 0;
while (condition) {
  if (++guard > 10000) { console.error('Loop guard hit'); break; }
}
```
👤 **Human Fix:** Test edge cases where loop conditions might never be false — empty arrays, zero values, undefined inputs.

---

### 18. Infinite re-render loops
🤖 **AI Fix:** Audit every `useEffect`. Ensure no effect sets state that is also listed in its dependency array without a proper condition guard. Use the React DevTools Profiler to identify which component is re-rendering and why. Add equality checks before setting state:
```js
if (newValue !== currentValue) setState(newValue);
```
👤 **Human Fix:** Install the React DevTools browser extension. It will highlight components re-rendering in real time. Treat any component that flashes more than twice as a bug.

---

### 19. Stack overflow from bad recursion
🤖 **AI Fix:** Add explicit base cases to every recursive function. Add a depth counter parameter with a maximum limit. For deep tree traversal, refactor to an iterative approach using a stack array instead.
👤 **Human Fix:** Test recursive functions with empty input, single-item input, and deeply nested input before shipping.

---

### 20. Calling setState on unmounted component
🤖 **AI Fix:** Add a mounted flag inside `useEffect` or use `AbortController` to cancel async operations on unmount:
```js
useEffect(() => {
  let mounted = true;
  fetchData().then(data => { if (mounted) setState(data); });
  return () => { mounted = false; };
}, []);
```
👤 **Human Fix:** This is best caught by React DevTools warnings in development mode. Never suppress these warnings — investigate and fix each one.

---

## 🔄 STATE MANAGEMENT

### 21. State chaos / no structure
🤖 **AI Fix:** Audit all `useState` calls across the app. Group related state into single objects or move to `useReducer`. Identify which state is truly local vs. shared and restructure accordingly. Document each piece of state and its owner.
👤 **Human Fix:** Before building any feature, map out: what state does this need? Where does it live? Who can change it? Answer these questions before writing any code.

---

### 22. Prop drilling hell
🤖 **AI Fix:** Identify all props passed through 3+ component layers. Move them into React Context or a lightweight global store (Zustand is ideal for this). Create dedicated context files for logical domains: `AuthContext`, `CartContext`, `UIContext`.
👤 **Human Fix:** If you find yourself typing the same prop name more than twice in a parent-to-child chain, stop and use context.

---

### 23. Mutating state directly
🤖 **AI Fix:** Audit all state update code. Replace any direct mutation with immutable patterns:
```js
// Wrong
state.items.push(item)
// Right
setState(prev => ({ ...prev, items: [...prev.items, item] }))
```
For arrays and objects, always spread or use methods that return new references.
👤 **Human Fix:** Enable ESLint's `no-param-reassign` rule. Consider using Immer for complex nested state updates.

---

### 24. Stale closures
🤖 **AI Fix:** Use the functional form of state updates to avoid closure staleness:
```js
setState(prev => prev + 1) // instead of setState(count + 1)
```
For event handlers, use `useCallback` with correct dependencies. For intervals, use refs to store the latest callback.
👤 **Human Fix:** This is subtle. When a feature behaves incorrectly after multiple rapid interactions, stale closures are a likely cause. Use React DevTools to inspect stale state values.

---

### 25. useEffect with wrong or missing dependencies
🤖 **AI Fix:** Install and enable the `eslint-plugin-react-hooks` rule `exhaustive-deps`. Let the linter flag every incorrect dependency array. Fix all warnings — do not suppress them. For effects that should only run once, document why with a comment rather than silently omitting dependencies.
👤 **Human Fix:** Never leave a `// eslint-disable-next-line` comment on a `useEffect` dependency warning without fully understanding why. These suppressions hide real bugs.

---

### 26. Derived state stored in state
🤖 **AI Fix:** Identify all state values that are computed from other state. Remove them from `useState` and compute them inline or with `useMemo`:
```js
// Remove: const [fullName, setFullName] = useState(...)
// Replace with:
const fullName = useMemo(() => `${firstName} ${lastName}`, [firstName, lastName]);
```
👤 **Human Fix:** Before adding a new `useState`, ask: can this be computed from existing state? If yes, it should not be state.

---

### 27. Local state that should be global
🤖 **AI Fix:** Identify state that is needed by multiple unrelated components or that must survive component unmounting (auth tokens, user preferences, shopping cart). Move this to a global store or top-level context with proper persistence.
👤 **Human Fix:** When you find yourself fetching or recalculating the same data in multiple components, that data belongs in a global store.

---

### 28. Global state that should be local
🤖 **AI Fix:** Audit the global store for state that is only ever read or written by a single component. Move this state back into the component with `useState`. Reduces re-renders across the entire app.
👤 **Human Fix:** Keep the global store lean. If removing a piece of state from the global store only affects one component, it does not belong globally.

---

### 29. Over-fetching / redundant state
🤖 **AI Fix:** Implement a data-fetching library with built-in caching: React Query (TanStack Query) or SWR. These deduplicate requests automatically, cache responses, and keep all components in sync from a single data source.
👤 **Human Fix:** React Query or SWR should be the default for any app that fetches data from an API. Install one from the start, not as an afterthought.

---

### 30. No optimistic updates
🤖 **AI Fix:** For user actions (like, delete, update), immediately update the UI state before the API call resolves. If the API call fails, roll back to the previous state and show an error. React Query has built-in `onMutate`/`onError` hooks for this pattern.
👤 **Human Fix:** Test your app on a throttled network connection (Chrome DevTools → Network → Slow 3G). If actions feel unresponsive, you need optimistic updates.

---

## ⏱️ ASYNC & TIMING

### 31. Race conditions
🤖 **AI Fix:** Use an `AbortController` to cancel in-flight requests when a new one starts. Alternatively, use a request ID counter — only apply results if the request ID matches the latest one. React Query handles this automatically.
👤 **Human Fix:** Test features that involve rapid user input (search, filters) on a slow network. If results jump around, you have a race condition.

---

### 32. No loading guards
🤖 **AI Fix:** Add explicit loading state to every async operation. Render a loading indicator and block interaction until data is available. Never access async data without checking that it has loaded:
```js
if (loading) return <Spinner />;
if (!data) return null;
```
👤 **Human Fix:** Always test your app with network throttling enabled. Features that work instantly on fast internet can completely break on slow connections.

---

### 33. No debouncing or throttling
🤖 **AI Fix:** Wrap search input handlers with `debounce` (delays until typing stops) and scroll/resize handlers with `throttle` (limits firing rate). Use the `use-debounce` library or lodash utilities:
```js
const debouncedSearch = useMemo(() => debounce(handleSearch, 300), []);
```
👤 **Human Fix:** Any input that triggers an API call needs debouncing. Any scroll or resize listener needs throttling. No exceptions.

---

### 34. Memory leaks — uncleaned intervals
🤖 **AI Fix:** Every `setInterval` must be cleared in a cleanup function:
```js
useEffect(() => {
  const id = setInterval(fn, 1000);
  return () => clearInterval(id);
}, []);
```
Audit all intervals in the codebase and add cleanup returns.
👤 **Human Fix:** Search the codebase for every `setInterval`. If it does not have a matching `clearInterval` in a cleanup, it is a leak.

---

### 35. Memory leaks — uncleaned event listeners
🤖 **AI Fix:** For every `addEventListener`, add a corresponding `removeEventListener` in the cleanup:
```js
useEffect(() => {
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);
```
In plain HTML, use a single initialisation block that only runs once.
👤 **Human Fix:** Search for `addEventListener` across the codebase. Each one needs a corresponding remove call.

---

### 36. Memory leaks — uncleaned subscriptions
🤖 **AI Fix:** Return a cleanup function from every `useEffect` that opens a subscription:
```js
useEffect(() => {
  const subscription = dataSource.subscribe(handler);
  return () => subscription.unsubscribe();
}, []);
```
Same pattern applies to WebSocket `close()`, RxJS `unsubscribe()`, and any third-party listener removal method.
👤 **Human Fix:** Open Chrome DevTools → Memory tab. Take heap snapshots before and after navigating away from a component. If memory grows, there is a leak.

---

### 37. `setTimeout` used as a timing hack
🤖 **AI Fix:** Replace `setTimeout` timing hacks with proper async/await, Promise resolution, event listeners, or `useEffect` dependency tracking. If something needs to run "after the DOM updates", use `useLayoutEffect` or `requestAnimationFrame` instead.
👤 **Human Fix:** Treat every `setTimeout` in the codebase as a code smell. Ask: "Why does this need a delay? What is it waiting for?" Then solve that root problem properly.

---

### 38. Async/await mixed with raw `.then()` chains
🤖 **AI Fix:** Standardise all async code to use `async/await` with `try/catch`. Refactor all `.then().catch()` chains into the equivalent async/await pattern for consistency and readability.
👤 **Human Fix:** Pick one pattern and enforce it via ESLint's `prefer-promise-reject-errors` and `no-promise-executor-return` rules.

---

### 39. No AbortController on fetch
🤖 **AI Fix:** Add `AbortController` to every fetch call inside a `useEffect`:
```js
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal }).then(...);
  return () => controller.abort();
}, [url]);
```
Or use React Query which handles this automatically.
👤 **Human Fix:** If using raw `fetch` inside `useEffect`, this is always required. Use React Query to avoid needing to manage it manually.

---

## 🌐 API & NETWORK

### 40. No input validation
🤖 **AI Fix:** Add validation before every API call and form submission. Use Zod or Yup to define schemas and validate against them. Sanitise strings, check for empty values, enforce length limits, and validate formats (email, phone, URL).
👤 **Human Fix:** Never trust user input. Validate on the frontend for UX and on the backend for security. Both are required — frontend validation alone is not enough.

---

### 41. Hardcoded API endpoints
🤖 **AI Fix:** Move all API URLs into environment variables (`REACT_APP_API_URL` or `VITE_API_URL`). Create a central `api.js` or `config.js` file that reads from env vars and exports the base URL. All fetch calls import from this single file.
👤 **Human Fix:** Set up `.env.development` and `.env.production` files. Never type a URL directly into a component.

---

### 42. API keys exposed in frontend code
🤖 **AI Fix:** Move all API keys to environment variables on the server side. For keys that must be used client-side (e.g. Maps, Stripe public key), restrict them by domain in the provider's dashboard. Never put secret keys in any frontend code. Create a backend proxy route for sensitive API calls.
👤 **Human Fix:** Run `git log -p | grep -i "api_key\|secret\|token"` to check if secrets were ever committed. If they were, rotate the keys immediately and add `.env` to `.gitignore`.

---

### 43. No rate limit handling
🤖 **AI Fix:** Check for `429` status codes and implement exponential backoff retry logic. Add a request queue for high-frequency operations. Cache responses where appropriate to reduce call volume.
```js
if (response.status === 429) {
  await sleep(retryAfter * 1000);
  return retry(request);
}
```
👤 **Human Fix:** Read the rate limit documentation for every third-party API you use. Build limits into the architecture from the start.

---

### 44. No pagination handling
🤖 **AI Fix:** Implement cursor-based or page-based pagination. Never assume the first response is the full dataset. Add "load more" or infinite scroll functionality. Store the current page/cursor in state and fetch the next page on demand.
👤 **Human Fix:** Test every data list with large datasets (100+ items). If the feature only works correctly with small amounts of data, pagination is missing.

---

### 45. No timeout handling
🤖 **AI Fix:** Add a timeout to every API call:
```js
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10000);
fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeout));
```
Show a "Request timed out — please try again" message when timeouts occur.
👤 **Human Fix:** Test app behaviour when the network is completely unavailable. Every request should fail gracefully within a reasonable time.

---

### 46. CORS misconfiguration
🤖 **AI Fix:** Configure CORS headers correctly on the backend to allow only specific trusted origins. For development, use a proxy in `vite.config.js` or `package.json`. For production, explicitly list allowed origins — never use wildcard for credentialed requests.
👤 **Human Fix:** CORS must be configured on the server, not the frontend. If your backend is managed by another team or service, coordinate with them. This cannot be fixed from the React side alone.

---

### 47. Assuming API response shape never changes
🤖 **AI Fix:** Validate all API responses against a Zod schema before using the data. This catches breaking changes immediately and throws a clear error rather than a cryptic downstream crash:
```js
const UserSchema = z.object({ id: z.string(), name: z.string() });
const user = UserSchema.parse(apiResponse);
```
👤 **Human Fix:** When your backend changes, update the frontend schema first and test the integration before deploying.

---

### 48. No retry logic
🤖 **AI Fix:** Implement automatic retry with exponential backoff for failed requests. React Query and SWR have this built in via their `retry` configuration. For raw fetch, implement a wrapper function that retries up to 3 times with increasing delays.
👤 **Human Fix:** Flaky network conditions are real. Test on mobile data and simulate packet loss in DevTools. Retry logic is not optional for production apps.

---

### 49. No loading / error / empty states
🤖 **AI Fix:** Every component that fetches data must handle all four states explicitly:
```jsx
if (loading) return <Skeleton />;
if (error) return <ErrorMessage retry={refetch} />;
if (!data || data.length === 0) return <EmptyState />;
return <DataComponent data={data} />;
```
👤 **Human Fix:** Walk through every data-dependent screen and intentionally test: slow network (loading state), server error (error state), and empty database (empty state). All three must look intentional, not broken.

---

### 50. Waterfall API calls
🤖 **AI Fix:** Identify sequential API calls that do not depend on each other and run them in parallel with `Promise.all()`:
```js
const [users, products] = await Promise.all([fetchUsers(), fetchProducts()]);
```
Use React Query's parallel queries or dependent queries feature for more complex flows.
👤 **Human Fix:** Open the Network tab in DevTools and look at the waterfall chart. Calls that start one after another when they could start simultaneously are a performance loss.

---

## 📦 DEPENDENCIES & BUILD

### 51. Fragile/unpinned dependency versions
🤖 **AI Fix:** Audit `package.json` and pin all dependencies to exact versions (remove `^` and `~` prefixes). Commit the lock file. Use `npm ci` instead of `npm install` in CI pipelines to install from the lock file exactly.
👤 **Human Fix:** Only update dependencies intentionally, not automatically. Use `npm outdated` to review what has changed and test thoroughly after any update.

---

### 52. Conflicting package versions
🤖 **AI Fix:** Run `npm ls` to view the full dependency tree and identify version conflicts. Deduplicate with `npm dedupe`. If peer dependency conflicts exist, resolve them by aligning on a compatible version across all packages.
👤 **Human Fix:** When adding a new package, check its peer dependencies against what you already have installed. Conflicts at install time are warnings, not errors — but they will cause runtime bugs.

---

### 53. Bloated unused dependencies
🤖 **AI Fix:** Run `npx depcheck` to identify unused packages. Remove them with `npm uninstall`. Analyse bundle size with `npm run build -- --stats` and review the output in Webpack Bundle Analyzer or Vite's built-in analysis.
👤 **Human Fix:** Periodically audit `package.json`. Every package is a maintenance burden, a security surface, and a bundle cost. Remove what is not used.

---

### 54. Missing peer dependencies
🤖 **AI Fix:** Run `npm install` and read all peer dependency warnings. Install any missing peer dependencies explicitly. Document required peer dependencies in the project `README.md`.
👤 **Human Fix:** Always read the full output of `npm install`. Peer dependency warnings are not noise — they are real problems waiting to surface.

---

### 55. No lock file committed
🤖 **AI Fix:** Ensure `package-lock.json` (npm) or `yarn.lock` (Yarn) is committed to version control. Add a CI check that fails if the lock file is out of sync with `package.json`.
👤 **Human Fix:** Remove `package-lock.json` and `yarn.lock` from `.gitignore` if they are listed there. Lock files belong in source control.

---

### 56. Wrong React version assumptions
🤖 **AI Fix:** Audit AI-generated code for deprecated patterns: class components (replace with functional), `componentDidMount`/`componentDidUpdate` (replace with `useEffect`), `ReactDOM.render` (replace with `createRoot` in React 18). Update all patterns to match the installed React version.
👤 **Human Fix:** When prompting AI, always specify: "I am using React [version]. Use only patterns that are current for this version."

---

### 57. Dead code that is actually load-bearing
🤖 **AI Fix:** Before removing any code marked as "unused", search the entire codebase for references to it including dynamic imports, string-based lookups, and indirect calls. Use TypeScript or a tree-shaking analysis to confirm nothing references it before deletion.
👤 **Human Fix:** Never delete code just because it looks unused without running the full app and tests. "Looks unused" is not the same as "is unused."

---

### 58. Tree shaking broken by bad imports
🤖 **AI Fix:** Replace all namespace imports with named imports:
```js
// Wrong (imports entire library):
import _ from 'lodash';
// Right (imports only what is used):
import debounce from 'lodash/debounce';
```
Audit all library imports and convert to named/specific imports to enable proper tree shaking.
👤 **Human Fix:** Check your final bundle size with a tool like `bundlephobia.com` before choosing a library. Many large libraries have lightweight alternatives.

---

## 🎨 UI & STYLING

### 59. CSS specificity wars
🤖 **AI Fix:** Migrate to a consistent styling strategy: CSS Modules, Tailwind utility classes, or styled-components. Eliminate global class name collisions. Add a CSS linter (Stylelint) to catch specificity issues. Consolidate all global styles into a single `globals.css` file.
👤 **Human Fix:** Pick one styling approach for the project and enforce it. Never mix multiple styling systems in the same codebase.

---

### 60. No responsive design
🤖 **AI Fix:** Audit every layout component. Replace all fixed-width containers with responsive alternatives. Add mobile-first media queries or Tailwind responsive prefixes (`sm:`, `md:`, `lg:`). Test every screen at 375px (mobile), 768px (tablet), and 1280px (desktop) minimum.
👤 **Human Fix:** Test on a real mobile device, not just Chrome DevTools emulation. They behave differently. Set up browser stack or use your own phone.

---

### 61. Hardcoded pixel values
🤖 **AI Fix:** Replace hardcoded pixel dimensions with relative units (`rem`, `em`, `%`, `vw`, `vh`) or design token CSS variables. For component sizing, use flexbox or grid proportional sizing rather than fixed widths.
👤 **Human Fix:** Define a spacing and sizing scale as CSS custom properties at the root level and reference them consistently.

---

### 62. Z-index chaos
🤖 **AI Fix:** Create a centralised z-index scale as CSS variables or JS constants:
```css
:root {
  --z-base: 1;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal: 300;
  --z-toast: 400;
  --z-tooltip: 500;
}
```
Replace all arbitrary z-index values with these tokens.
👤 **Human Fix:** Define the z-index scale before building any layered UI. This is architectural and needs a human decision about layer hierarchy.

---

### 63. No dark mode handling
🤖 **AI Fix:** Implement dark mode using CSS custom properties that change based on `prefers-color-scheme` media query or a `data-theme` attribute on the `<html>` element. Replace all hardcoded color values with theme variables.
👤 **Human Fix:** Test the app with your OS set to dark mode. If anything looks broken, those are hardcoded colors that need to be tokenised.

---

### 64. Assets from hardcoded CDN URLs
🤖 **AI Fix:** Download all external fonts and icons into the project's `/public` or `/assets` folder. Reference them via relative paths. For icon libraries, install the npm package instead of using a CDN link.
👤 **Human Fix:** External CDN dependencies are a point of failure outside your control. Self-host all critical assets.

---

### 65. Animations that never terminate
🤖 **AI Fix:** Audit all CSS animations for `animation-iteration-count`. Only use `infinite` intentionally (e.g. a loading spinner). For JS animations, always define a completion callback or use `animation.finished` Promise to clean up. Add `animation-fill-mode: forwards` where appropriate.
👤 **Human Fix:** After navigating away from a page, check if animations are still running via the DevTools Performance tab. Running animations on invisible elements waste CPU.

---

### 66. Layout shift on data load
🤖 **AI Fix:** Add skeleton placeholder components that match the size and shape of the content being loaded. Reserve space for images with defined width/height attributes. Use CSS `min-height` on containers to prevent collapse while loading.
👤 **Human Fix:** Measure Cumulative Layout Shift (CLS) using Google Lighthouse. A score above 0.1 indicates visible layout instability that needs fixing.

---

### 67. Inline styles overriding everything
🤖 **AI Fix:** Remove all `style={{}}` props from components and replace them with class-based styles (CSS modules, Tailwind, or styled-components). Reserve inline styles only for truly dynamic values that cannot be expressed with classes (e.g., `style={{ width: dynamicWidth + 'px' }}`).
👤 **Human Fix:** Set a team rule: inline styles are only allowed for dynamic computed values. All static styling goes through the styling system.

---

### 68. className conflicts in component libraries
🤖 **AI Fix:** Choose one styling system and migrate the codebase to it. If mixing is unavoidable, use CSS Modules to scope component styles locally and prevent collisions. Add Stylelint with appropriate rules to catch conflicts at build time.
👤 **Human Fix:** Decide on the styling stack before writing the first line of UI code. Retrofitting a styling system is expensive and error-prone.

---

## 🔐 SECURITY

### 69. No auth checks on protected routes
🤖 **AI Fix:** Create a `ProtectedRoute` wrapper component that checks authentication state before rendering. Redirect unauthenticated users to the login page. Verify authentication on the server for every protected API endpoint — never rely on frontend route guards alone.
👤 **Human Fix:** Backend protection is mandatory. Frontend route guards are UX only — they can be bypassed by anyone with DevTools. Always validate auth on the server.

---

### 70. XSS vulnerabilities
🤖 **AI Fix:** Never use `dangerouslySetInnerHTML` or `innerHTML` with user-supplied content without sanitising first. Use the `DOMPurify` library to sanitise any HTML that must be rendered. Prefer rendering text content as plain text using React's default rendering (which escapes HTML automatically).
👤 **Human Fix:** Audit every use of `dangerouslySetInnerHTML` in the codebase. Each one is a potential XSS vector. Treat them as critical security issues.

---

### 71. SQL/NoSQL injection
🤖 **AI Fix:** Use parameterised queries or prepared statements for all database operations. Never concatenate user input into query strings. Use an ORM (Prisma, Mongoose, Drizzle) that handles parameterisation automatically.
👤 **Human Fix:** This requires backend review and is not fixable from the frontend alone. If you control the backend, audit every database query. If you do not, raise it with whoever does.

---

### 72. Secrets in `.env` files committed to Git
🤖 **AI Fix:** Add `.env*` (except `.env.example`) to `.gitignore` immediately. Create a `.env.example` file with placeholder values showing required variables without their actual values. If secrets were already committed, remove them from Git history using `git filter-repo` or BFG Repo Cleaner.
👤 **Human Fix:** Rotate every exposed secret immediately — do not wait. A committed secret must be treated as compromised even if the repo is private. Private repos get breached too.

---

### 73. No HTTPS enforcement
🤖 **AI Fix:** Configure your hosting provider (Vercel, Netlify, AWS) to redirect all HTTP traffic to HTTPS. Add an HSTS header on the server. Ensure all hardcoded URLs in the codebase use `https://`.
👤 **Human Fix:** Enable HTTPS in your hosting configuration. All major hosts provide free SSL certificates. There is no reason to run production traffic over HTTP.

---

### 74. No CSRF protection
🤖 **AI Fix:** Implement CSRF tokens on all state-changing endpoints (POST, PUT, DELETE, PATCH). For cookie-based auth, use the `SameSite=Strict` or `SameSite=Lax` cookie attribute. Validate the `Origin` and `Referer` headers on the server.
👤 **Human Fix:** CSRF protection lives on the server. This requires backend implementation — it cannot be fixed from the React codebase alone.

---

### 75. Overly permissive CORS
🤖 **AI Fix:** Replace `Access-Control-Allow-Origin: *` with an explicit allowlist of trusted origins. Only allow credentials (`Access-Control-Allow-Credentials: true`) alongside a specific origin, never a wildcard. Restrict allowed methods and headers to only what is necessary.
👤 **Human Fix:** Review CORS configuration with your backend/DevOps team. Never use wildcard CORS in a production environment that handles authenticated requests.

---

### 76. JWT tokens stored in localStorage
🤖 **AI Fix:** Move JWT tokens from localStorage to `httpOnly` cookies. These cookies are not accessible via JavaScript, preventing XSS theft. Implement token refresh logic on the server. If httpOnly cookies are not possible, use sessionStorage at minimum (still not ideal but isolated to the tab).
👤 **Human Fix:** This requires coordinated frontend and backend changes. The backend must set and read httpOnly cookies. Discuss with your backend team before implementing.

---

## 🗃️ DATA & STORAGE

### 77. No data normalisation
🤖 **AI Fix:** Flatten deeply nested API responses into normalised structures before storing them. Use a normalisation approach where entities are stored by ID in a flat map:
```js
{ users: { byId: { '1': {...} }, allIds: ['1', '2'] } }
```
Libraries like Normalizr can automate this.
👤 **Human Fix:** When designing data structures, prefer flat over nested. Deeply nested structures are a bug-creation machine.

---

### 78. LocalStorage overload
🤖 **AI Fix:** Audit all localStorage usage. Remove sensitive data (tokens, personal info). For large data, use IndexedDB instead. Add error handling around all localStorage calls as they can throw in private browsing mode:
```js
try { localStorage.setItem(key, value); } catch (e) { /* handle quota exceeded */ }
```
👤 **Human Fix:** Question every piece of data stored in localStorage. Ask: does this need to persist? Is it sensitive? How large can it get?

---

### 79. No cache invalidation
🤖 **AI Fix:** Add TTL (time-to-live) timestamps to all cached data. Check the timestamp before using cache and re-fetch if expired. Use React Query's `staleTime` and `cacheTime` configuration to manage this automatically.
👤 **Human Fix:** For every piece of cached data, define: how long is this valid? What event should invalidate it? Answer both before caching anything.

---

### 80. Schema mismatches
🤖 **AI Fix:** Add a validation layer using Zod between the API response and the app's data layer. Validate on the way in and validate on the way out. Generate TypeScript types from the Zod schemas to keep frontend types in sync with actual API shapes.
👤 **Human Fix:** Keep API contracts documented (OpenAPI/Swagger). Any change to the API schema must trigger a frontend review.

---

### 81. Serialisation errors
🤖 **AI Fix:** Before storing any data to JSON-based storage, test it with `JSON.stringify()` and handle errors. Remove circular references, functions, and undefined values. Use a safe serialisation utility:
```js
function safeStringify(obj) {
  try { return JSON.stringify(obj); } catch (e) { return null; }
}
```
👤 **Human Fix:** Never store complex objects with class instances, DOM references, or functions in localStorage or any JSON store.

---

## 🧪 TESTING & QUALITY

### 82. Zero tests
🤖 **AI Fix:** Generate a test suite using Vitest or Jest + React Testing Library. Start with the most critical paths: auth flows, form submissions, and key data transformations. Add snapshot tests for stable UI components. Write tests for every bug that is fixed to prevent regression.
👤 **Human Fix:** Commit to a minimum testing rule: every new feature gets at least one test. Every bug fix gets a regression test. This is a habit that has to be enforced by a human.

---

### 83. No logging or monitoring
🤖 **AI Fix:** Integrate an error monitoring service (Sentry is the standard). Add it to the React app with an ErrorBoundary that reports to Sentry. Set up alerts for error rate spikes. Add structured logging on the backend.
👤 **Human Fix:** Set up Sentry or an equivalent before going to production. Without monitoring, production bugs are invisible until users complain.

---

### 84. No staging environment
🤖 **AI Fix:** Set up a staging deployment that mirrors production. Configure separate environment variables for staging. Add a deployment pipeline: code → staging → manual approval → production.
👤 **Human Fix:** This is an infrastructure decision that requires human setup. Use Vercel Preview Deployments or a separate Vercel/Netlify project as a staging environment. Non-negotiable for any serious project.

---

### 85. Magic numbers with no explanation
🤖 **AI Fix:** Replace all magic numbers and strings with named constants:
```js
// Wrong
if (status === 4) { ... }
// Right
const STATUS_COMPLETED = 4;
if (status === STATUS_COMPLETED) { ... }
```
Create a `/constants` file or module that centralises all of these.
👤 **Human Fix:** During code review, flag every raw number or string in logic code. Ask: would a new developer understand what this value represents without context?

---

### 86. Console.logs left in production
🤖 **AI Fix:** Configure the build tool to strip all `console.log` calls in production builds. In Vite: `esbuild: { drop: ['console', 'debugger'] }`. Replace debugging logs with a proper logging utility that respects environment:
```js
const log = process.env.NODE_ENV === 'development' ? console.log : () => {};
```
👤 **Human Fix:** Search the codebase for `console.log` before every production deploy. Add an ESLint rule `no-console` to warn on all console usage.

---

## 🧠 LOGIC & CODE QUALITY

### 87. Redundant/conflicting event handlers
🤖 **AI Fix:** Audit all event handler attachments. Remove duplicates. Ensure each interactive element has exactly one handler per event type. Use event delegation where multiple similar elements need the same behaviour.
👤 **Human Fix:** When adding interactivity to an existing element, always check if a handler already exists before adding another one.

---

### 88. Event listeners re-added on every render
🤖 **AI Fix:** Move all `addEventListener` calls inside `useEffect` with a proper dependency array and cleanup return. Never add event listeners directly in the component body:
```js
useEffect(() => {
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}, []); // empty array = runs once
```
👤 **Human Fix:** The rule is simple: if it is inside a React component, it must be inside a `useEffect` with cleanup.

---

### 89. Boolean logic errors
🤖 **AI Fix:** Audit all conditional logic. Test edge cases: empty string, `0`, `null`, `undefined`, `false` — all of these are falsy in JavaScript and can cause unintended short-circuit behaviour. Replace ambiguous conditions with explicit checks:
```js
// Ambiguous: if (items.length) — fails for length 0
// Explicit: if (items.length > 0)
```
👤 **Human Fix:** Write unit tests for all conditional logic branches. Edge cases in boolean logic almost never show up in happy-path testing.

---

### 90. Off-by-one errors
🤖 **AI Fix:** Audit all loops, array slices, and pagination logic. Test with zero items, one item, and maximum items. Add boundary tests for all index-based operations. For pagination, verify that page 1 starts at the correct offset.
👤 **Human Fix:** Test list features with exactly 0, 1, and N+1 items (where N is the page size). Off-by-one errors always live at these boundaries.

---

### 91. Dead-end error states
🤖 **AI Fix:** Add a recovery path to every error state. At minimum, provide a "Try Again" button that retries the failed operation or a "Go Back" button that returns to a known good state. For global errors, provide a way to reset the app without a full page refresh.
👤 **Human Fix:** Walk through every error scenario in the app and ask: "What can the user do from here?" If the answer is nothing, that is a dead end that needs fixing.

---

### 92. Commented-out code left everywhere
🤖 **AI Fix:** Remove all commented-out code blocks. If code needs to be preserved for reference, use version control (Git) — that is what it is for. Leave only explanatory comments that describe why something is done, not what is done.
👤 **Human Fix:** Add an ESLint rule or PR review requirement: no commented-out code in merged branches.

---

### 93. Key prop misuse
🤖 **AI Fix:** Replace all array-index keys with stable unique identifiers from the data:
```jsx
// Wrong
{items.map((item, index) => <Item key={index} />)}
// Right
{items.map(item => <Item key={item.id} />)}
```
If no unique ID exists in the data, generate one using `crypto.randomUUID()` when the data is created (not on each render).
👤 **Human Fix:** Ensure your data model always has a stable unique identifier. If your backend does not provide one, add it before storing the data client-side.

---

### 94. Unnecessary re-renders
🤖 **AI Fix:** Wrap stable child components with `React.memo`. Memoize expensive computations with `useMemo`. Stabilise callback references with `useCallback`. Use the React DevTools Profiler to identify exactly which components are re-rendering and why before optimising.
👤 **Human Fix:** Do not prematurely optimise. Profile first, then optimise what the profiler identifies as a real bottleneck. `memo` and `useMemo` have overhead themselves.

---

### 95. Context causing full app re-renders
🤖 **AI Fix:** Split large contexts into smaller focused contexts so consumers only re-render when their specific slice changes. Memoize context values with `useMemo`:
```js
const value = useMemo(() => ({ user, login, logout }), [user]);
```
Consider using Zustand instead of Context for frequently-changing global state.
👤 **Human Fix:** Context is great for infrequently-changing data (theme, locale, auth). For frequently-changing data (counters, live data), use a proper state manager.

---

### 96. useReducer/useState mismatch
🤖 **AI Fix:** Use `useState` for simple, independent values. Use `useReducer` when: state is an object with multiple fields that change together, the next state depends on complex logic involving the previous state, or multiple actions can affect the same state. Audit existing state and migrate accordingly.
👤 **Human Fix:** A good rule of thumb: if your `useState` setter is being called in 3+ different places with different logic, it probably needs to be a `useReducer`.

---

## ⚙️ PERFORMANCE

### 97. No code splitting or lazy loading
🤖 **AI Fix:** Implement route-based code splitting using `React.lazy` and `Suspense`:
```jsx
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
<Suspense fallback={<Spinner />}><Dashboard /></Suspense>
```
Lazy load all heavy components, modals, and pages that are not immediately visible on first load.
👤 **Human Fix:** Run Lighthouse on the production build. If the bundle size is over 200KB, code splitting is needed. Start with the largest route-level components.

---

### 98. Unoptimised images
🤖 **AI Fix:** Convert all images to WebP format. Add `loading="lazy"` to all images below the fold. Always specify `width` and `height` attributes to prevent layout shift. Use `srcset` for responsive images. Consider using a CDN or image optimisation service.
👤 **Human Fix:** Run images through squoosh.app or imageoptim before adding them to the project. Never commit original uncompressed images.

---

### 99. No memoisation
🤖 **AI Fix:** Identify expensive computations (filtering large arrays, complex transformations, derived calculations) and wrap them in `useMemo`:
```js
const filtered = useMemo(() =>
  largeList.filter(item => item.active),
  [largeList]
);
```
Use the React DevTools Profiler to confirm the computation is actually expensive before adding `useMemo`.
👤 **Human Fix:** Profile before you memoize. `useMemo` has a cost. Only use it when the profiler shows a real performance problem.

---

### 100. Prop reference instability
🤖 **AI Fix:** Stabilise all object and function props passed to memoized children:
```js
// Unstable (new object every render):
<Child config={{ theme: 'dark' }} />
// Stable:
const config = useMemo(() => ({ theme: 'dark' }), []);
<Child config={config} />
```
Use `useCallback` for all function props passed to `memo`-wrapped components.
👤 **Human Fix:** When using `React.memo` on a component, audit every prop it receives. Any object or function literal passed as a prop breaks the memoization.

---

### 101. Heavy libraries for trivial tasks
🤖 **AI Fix:** Audit all dependencies against their actual usage. Replace heavy libraries with lightweight alternatives or native equivalents:
- `moment.js` (67KB) → `date-fns` (specific imports) or `Intl.DateTimeFormat`
- `lodash` (full) → named imports or native array methods
- `axios` → native `fetch` with a small wrapper
👤 **Human Fix:** Before installing any library, check its size on bundlephobia.com and ask: does a native solution exist that is good enough?

---

### 102. No virtualisation for long lists
🤖 **AI Fix:** Replace direct list renders of 50+ items with a virtual list implementation using `@tanstack/react-virtual` or `react-window`. Only the visible items are rendered in the DOM; the rest exist as scroll position calculations.
👤 **Human Fix:** Test list components with 500+ items. If the page becomes sluggish or the browser freezes, virtualisation is required.

---

### 103. Scroll/resize listeners without optimisation
🤖 **AI Fix:** Wrap all scroll and resize handlers in `throttle` or `debounce`. Use the `IntersectionObserver` API instead of scroll listeners for visibility detection. Use `ResizeObserver` instead of window resize events for element size tracking.
```js
const handleScroll = useMemo(() => throttle(() => { ... }, 100), []);
```
👤 **Human Fix:** Open Chrome DevTools → Performance tab and record scrolling. If you see long scripting blocks triggered by scroll events, the handlers need throttling.

---

## 🚀 DEPLOYMENT & ENVIRONMENT

### 104. Works on my machine syndrome
🤖 **AI Fix:** Add a `.nvmrc` or `.node-version` file specifying the exact Node.js version. Document all required environment variables in `.env.example`. Add a setup script (`npm run setup`) that validates the environment before the dev server starts.
👤 **Human Fix:** Set up CI (GitHub Actions, etc.) that runs the build and tests on every push. If it works locally but fails in CI, the environment is the problem.

---

### 105. No environment variable management
🤖 **AI Fix:** Create separate `.env.development`, `.env.staging`, and `.env.production` files. Prefix all client-exposed variables with `REACT_APP_` (CRA) or `VITE_` (Vite). Add a startup validation that checks all required env vars are present and throws a clear error if any are missing.
👤 **Human Fix:** Manage production secrets in your hosting provider's environment variable UI (Vercel, Netlify, etc.), not in files. Rotate secrets regularly.

---

### 106. No build optimisation
🤖 **AI Fix:** Enable production build optimisations: minification, tree shaking, dead code elimination, and gzip/Brotli compression. Vite does this by default in `npm run build`. Verify with `npm run build && npx serve dist` — the production build should be dramatically smaller than the dev bundle.
👤 **Human Fix:** Always deploy the production build, never the development build. Verify your hosting provider is serving compressed assets via the Network tab in DevTools.

---

### 107. `window`/`document` accessed in SSR context
🤖 **AI Fix:** Guard all browser-only globals with an environment check:
```js
if (typeof window !== 'undefined') {
  // browser-only code
}
```
Or use `useEffect` (which only runs client-side) for code that needs browser APIs. Use dynamic imports with `ssr: false` in Next.js for components that cannot be server-rendered.
👤 **Human Fix:** If using SSR or Static Site Generation, test the build output (`npm run build`) regularly, not just the dev server. SSR errors only appear at build or server runtime.

---

### 108. No 404 / fallback route
🤖 **AI Fix:** Add a catch-all route that renders a proper 404 page:
```jsx
<Route path="*" element={<NotFound />} />
```
The NotFound component should include navigation back to the home page. Configure the hosting provider to return HTTP 404 status (not 200) for unknown routes.
👤 **Human Fix:** Test every route in the app by typing URLs directly into the browser. Any route that returns a blank page or a server error needs a fallback.

---

### 109. No graceful degradation
🤖 **AI Fix:** Add a `<noscript>` tag with a meaningful message for users without JavaScript. For critical content, ensure it is included in the initial HTML (via SSR or static generation) rather than injected entirely by JavaScript. Add loading states that work before JavaScript hydrates.
👤 **Human Fix:** Test the app with JavaScript disabled in the browser (DevTools → Settings → Disable JavaScript). Critical content and navigation should still be visible.

---

### 110. React dev build shipped to production
🤖 **AI Fix:** Always use the build script for deployment (`npm run build`). Verify the deployment is production mode by checking that React DevTools shows "This page is using the production build of React." Add a CI check that prevents deployment of development builds.
👤 **Human Fix:** Check your deployment pipeline. The command should be `npm run build && deploy`, never `npm start → deploy`. The dev server is not a production server.

---

*Every solution number matches the same problem number in `security_weaknesses.md`.*
*🤖 = the AI can implement this fix directly · 👤 = requires human decision or infrastructure access*
