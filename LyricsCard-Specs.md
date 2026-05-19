# Lyrics Card — Design Specifications

> Apply these specs to the existing lyrics card component. Do **not** change any existing colors, fonts, or other card styles — only restructure the layout and replace the critics section with a comments system.

---

## Overall Card Structure

The card is divided into **two halves** stacked vertically:

```
┌─────────────────────────────┐
│        TOP HALF             │
│     (Song Lyrics Area)      │
├─────────────────────────────┤
│        BOTTOM HALF          │
│  [Comments] │ [Stars+Views] │
└─────────────────────────────┘
```

---

## TOP HALF — Lyrics Area

- Takes the **full width** of the card
- Has a bottom border separating it from the bottom half

### Header row (inside top half):
- Song **title** → horizontally centered, uses existing red color + Aref Ruqaa Ink font
- Song **type badge** → positioned at the left end of the same row (stays left, does not move to center)
- Both title and badge are on the **same row** using `position: relative` on the row and `position: absolute; left: 50%; transform: translateX(-50%)` on the title

### Lyrics label:
- Small gold label "كلمات الأغنية" / "Song Lyrics" centered below the header row

### Lyrics scroll area:
- Fixed height with vertical scroll (`overflow-y: auto`)
- Text is **center-aligned**
- Each lyric line renders as its own `<div>` or `<p>`
- Long lines (those containing ` ... ` separators) are **split into 3 sub-lines**:
  - Sub-line 1: text up to the first ` ... ` (ends with a rhyme word like معاك / أنساك)
  - Sub-line 2: middle section (one or two phrases)
  - Sub-line 3: last segment (ends with the rhyme word like ليك / فيك)
  - Sub-lines 1 and 3 have a slightly larger bottom margin to visually group them as one stanza
- Lines where `red: true` keep their existing red color

---

## BOTTOM HALF — Two Columns

The bottom half is split into **two columns** side by side:

```
┌──────────────────┬──────────┐
│  Comments (right)│  Stars   │
│                  │  +Views  │
│                  │  (left)  │
└──────────────────┴──────────┘
```

- Right column: flex `1.2`
- Left column: flex `1`
- A vertical border separates the two columns

---

## RIGHT COLUMN — Comments System

### Header row:
- Small gold label on the right: "التعليقات" / "Comments"
- Small button on the left: "أضف تعليق +" / "+ Add comment"
  - Button style: small, rounded pill, uses existing gold color with low-opacity background
  - Clicking this button **shows** the comment input area and **hides** itself

### Comment input area (hidden by default, shown on button click):
- `<textarea>` for typing the comment
  - Direction: RTL
  - Placeholder: "اكتب تعليقك..." / "Write your comment..."
  - Background: very subtle (low-opacity white or card background tint)
  - Existing border/radius style from the project
- **Emoji row** below the textarea:
  - A horizontal row of emoji buttons: 😍 🔥 ❤️ 👏 🎵 💯 😢
  - Clicking an emoji appends it to the textarea content
- **Action buttons row** below emojis:
  - "تم ✓" / "Done ✓" button → primary style (gold background, dark text)
  - "إلغاء" / "Cancel" button → secondary style (subtle background)
  - Clicking "Done": saves the comment, hides input area, shows "Add comment" button again
  - Clicking "Cancel": clears textarea, hides input area, shows "Add comment" button again

### Comments scroll list:
- Displayed below the header row (or below the input area when open)
- Fixed max-height with vertical scroll (`overflow-y: auto`, scrolls top to bottom)
- Each comment is a small card/bubble:
  - Subtle background (low-opacity)
  - Thin border using existing gold border style
  - Rounded corners
  - Font size slightly smaller than lyrics text
  - Text color: white in dark mode, black in light mode
- New comments appear at the **bottom** of the list (list auto-scrolls to bottom on submit)
- Entry animation: fade in + slight upward slide (`opacity 0→1`, `translateY 4px→0`)

---

## LEFT COLUMN — Stars + Views

No changes from current implementation:
- Gold label "تقييمك" / "Your Rating" centered at top
- 5-star rating row, interactive (clicking a star fills up to that star)
- Views badge below the stars (white/light pill with dark text)

---

## Behavior Notes

- The card itself does **not** change its background, border color, border radius, or any existing visual style
- Only the **bottom-right section** changes: critics list → comments system
- The top half lyrics area replaces any previous cover image (coverImg removed)
- All text responds to the existing language toggle (AR/EN)
- Light mode: comment text becomes dark, comment bubble background becomes a light tint
- Dark mode: comment text is white, bubble background is a low-opacity white tint

---

## Files to modify

- `LyricsPage.tsx` — update the card JSX structure per above
- No changes needed to `index.css`, `ThemeContext`, or `LangContext`
