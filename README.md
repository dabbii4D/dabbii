# Dabbii — Portfolio Site

## Purpose & Target User

This is Martin Dave D. Melchor's ("Dabbii") personal portfolio site — a single-page site for a 3rd-year BS Information Systems student to introduce himself, showcase the skills and design tools he's learning, share where he's headed next, and give visitors an easy way to reach him. The target users are recruiters, professors, and OJT/internship contacts who want a quick, human read on who he is and how to get in touch, plus curious visitors who stumble onto the easter-egg game.

## Heuristics Applied

| # | Heuristic (Nielsen) | Where it's applied | Notes |
|---|---|---|---|
| 1 | **Visibility of system status** | Nav bar (`.nav.scrolled` in `style.css`, toggled in `script.js`), skill card hover hint (`#skillHint` text swap), Byte Runner HUD (`#gameScore` / `#gameBest`) | The nav visibly changes state on scroll, skill cards update a live description on hover/focus, and the hidden game shows real-time score/best score feedback. |
| 2 | **User control and freedom** | Skip-to-content link, mobile nav drawer open/close toggle, game modal (close button, `Esc` key, click-outside-to-close) | Multiple clearly marked exits exist for every "mode" the user can enter — the nav drawer, the game modal, and even the browser default of skipping straight to `#main`. |
| 3 | **Consistency and standards** | Section headers (`.section-index` + `.section-title` pattern repeated for About/Skills/Goals/Contact), `.btn-primary` / `.btn-ghost` button styles, `.contact-link` card pattern | Every section follows the same numbered-header convention, and interactive elements (buttons, cards, links) reuse the same visual language throughout. |
| 4 | **Recognition rather than recall** | Goals legend (`.goals-legend` — dot + label for "Currently / Next up / Long term") sits directly above the goals grid it explains | Users don't have to remember what the colored dots on each `.goal-card` mean; the key is visible right next to the content it decodes. |
| 5 | **Aesthetic and minimalist design** | Overall palette (`--cream`, `--terracotta`, `--ochre`, `--teal` in `:root`), generous `--section-pad` spacing, one-line `.section-note` taglines instead of long explanatory paragraphs | The design leans on a small, warm color set and whitespace rather than dense text or competing visual elements, keeping each section focused on one idea. |
| 6 | **Flexibility and efficiency of use** | `:focus-visible` outline styling, skip link for keyboard users, hidden shortcuts (5 clicks or ↑↑↓↓ opens the Byte Runner easter egg) | Power users and keyboard-only users get faster paths (skip link, visible focus rings), while curious users get a hidden accelerator to a bonus feature. |
| 7 | **Help users recognize, diagnose, and recover from errors** | Avatar image `onerror` fallback (`this.style.display='none'; ... classList.add('is-fallback')` → shows "MM" initials) | If `martin.jpg` fails to load, the page degrades gracefully to initials instead of showing a broken image icon. |
| 8 | **Accessibility / respect user preferences** | `prefers-reduced-motion` media query disables the cursor glow, reveal animations, and avatar float animation; `matchMedia('(hover: none)')` disables hover-only effects on touch devices | The experience adapts to stated user/device preferences rather than forcing motion or hover-dependent interactions on everyone. |

## One Thing I'd Improve

The `.contact-link` items for Facebook and GitHub open in a new tab (`target="_blank"`) but give no visual or screen-reader cue that they do so — a user (especially on assistive tech) can be taken out of the page unexpectedly. I'd add a small "opens in new tab" visually-hidden label (or an icon with an `aria-label`) on those two links so the behavior is signaled up front rather than discovered after the click.
