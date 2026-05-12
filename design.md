---
version: "alpha"
name: Better Auth Mobile Dashboard
description: Design system guidance for the Expo React Native mobile app.

colors:
  background-light: "#f7f8fc"
  background-dark: "#060c17"
  surface-light: "#ffffff"
  surface-dark: "#0b1220"
  muted-light: "#eef1f7"
  muted-dark: "#111a2b"
  text-light: "#141f33"
  text-dark: "#ffffff"
  muted-text-light: "rgba(20, 31, 51, 0.64)"
  muted-text-dark: "rgba(255, 255, 255, 0.65)"
  border-light: "rgba(20, 31, 51, 0.22)"
  border-dark: "rgba(255, 255, 255, 0.18)"
  primary-light: "#7c35e8"
  primary-dark: "#ab8ae6"
  primary-soft-light: "rgba(124, 53, 232, 0.12)"
  primary-soft-dark: "rgba(141, 61, 255, 0.16)"
  danger-light: "#dc2626"
  danger-dark: "#f87171"
  success-light: "#059669"
  success-dark: "#34d399"

typography:
  screen-title:
    fontFamily: System
    fontSize: 24px
    fontWeight: "600"
    lineHeight: 30px
    letterSpacing: 0px
  section-title:
    fontFamily: System
    fontSize: 18px
    fontWeight: "700"
    lineHeight: 24px
    letterSpacing: 0px
  body:
    fontFamily: System
    fontSize: 15px
    fontWeight: "400"
    lineHeight: 22px
    letterSpacing: 0px
  body-strong:
    fontFamily: System
    fontSize: 15px
    fontWeight: "600"
    lineHeight: 22px
    letterSpacing: 0px
  label:
    fontFamily: System
    fontSize: 13px
    fontWeight: "500"
    lineHeight: 18px
    letterSpacing: 0px
  meta:
    fontFamily: System
    fontSize: 12px
    fontWeight: "600"
    lineHeight: 16px
    letterSpacing: 0px

rounded:
  sm: 10px
  md: 16px
  lg: 22px
  xl: 28px
  full: 999px

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px

components:
  screen:
    backgroundColor: "{colors.background-light}"
    padding: 20px
  card:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.text-light}"
    rounded: "{rounded.xl}"
    padding: 20px
  input:
    backgroundColor: "{colors.muted-light}"
    textColor: "{colors.text-light}"
    rounded: "{rounded.lg}"
    padding: 16px
  primary-action:
    backgroundColor: "{colors.primary-light}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
    padding: 16px
---

## Overview

This mobile app is a focused finance and authentication dashboard built with Expo, React Native, Expo Router, NativeWind, Better Auth, and Prisma.

The interface should feel native, compact, calm, and operational. It should avoid marketing-style layouts, oversized hero text, decorative cards, and unnecessary visual noise. The design direction favors clear hierarchy, small typography, native-feeling controls, line-separated sections, and cards only when the data genuinely benefits from being visually grouped.

The default user-facing language is Spanish, but this design specification is written in English so agents can consistently follow it.

## Colors

Use the existing app theme tokens from `src/shared/lib/theme-tokens.ts` as the source of truth.

The main palette is built around neutral app backgrounds, elevated surfaces, muted dividers, and a purple primary accent. Purple should be used for actions, selected states, focus states, and small emphasis only. Do not make whole screens feel purple.

Use semantic color roles:

- Background for full-screen surfaces.
- Surface/card only for important grouped data.
- Muted background for selected options and low-emphasis controls.
- Border for section separation and row dividers.
- Primary for active states and main actions.
- Danger for destructive actions and errors.
- Success for positive state feedback.

Avoid adding new hardcoded colors unless the current theme cannot express the required state.

## Typography

Typography should be compact and mobile-native.

Do not use oversized text except when a specific financial value requires emphasis. Most screens should use small, readable text:

- Screen headers: around 22-24px.
- Section titles: around 16-18px.
- Body text: around 14-15px.
- Labels and metadata: around 11-13px.

Highlight only the text that needs attention: balances, selected states, primary actions, user names, and destructive choices.

Do not use large marketing headlines on tab screens or operational screens.

Letter spacing should normally be `0`. Use uppercase tracking only for small metadata labels, never for main body copy.

## Layout

Use the smallest number of cards possible.

Before using a card, prefer separating content with spacing, section labels, and thin divider lines. A card is appropriate only when the content is important to visualize as a unit, such as:

- A balance summary with a chart.
- A payment card preview.
- A critical account or security state.
- A grouped form with strong functional meaning.
- A modal-like decision area.

Do not wrap ordinary settings, menu rows, filters, or simple lists in cards. Use line-separated rows instead.

Screens should use safe-area-aware layouts, vertical scrolling where needed, and consistent horizontal padding around `20px`.

Screen content should be compact without feeling cramped.

Information such as data blocks, images, users, text inputs, lists, charts, and actions should be arranged to reduce unnecessary scrolling. The goal is to show the most relevant content efficiently within the available mobile viewport.

Compact does not mean dense or uncomfortable. Keep enough spacing between elements so the interface remains friendly, readable, and easy to tap. Prefer a balanced rhythm: reduce empty decorative space, but preserve clear separation between sections, rows, inputs, and actions.

Avoid excessive vertical scrolling caused by oversized headers, repeated explanatory text, unnecessary cards, or overly large spacing. If a screen needs scrolling because the content is naturally long, make sure the structure is easy to scan and the most important actions appear early.

Remove redundant screen intro copy when it does not change the user's next action. Favor direct content over labels and descriptions that only restate the route.

Keep sections visually light:

- Use `border-t` or `border-b` for separation.
- Use modest vertical rhythm.
- Avoid nested cards.
- Avoid decorative containers that do not carry data.

## Elevation & Depth

Use minimal depth.

Prefer borders, spacing, and background contrast over shadows. Shadows should be rare and reserved for elements that naturally float or need interaction affordance.

Do not create stacked panels or card-heavy compositions.

## Shapes

Use rounded shapes consistently, but avoid making every element feel like a pill.

Recommended shape usage:

- Icon buttons: circular.
- Inputs: rounded, custom NativeWind styling.
- Action buttons: rounded full or strongly rounded.
- Data cards: rounded between 22px and 30px only when needed.
- List rows: usually no card shape; use dividers.

Use `borderCurve: "continuous"` for premium rounded cards when already used in the codebase.

## Components

### Screens

Avoid introductory eyebrow/subtitle blocks at the top of operational screens, especially tab screens. Do not add text such as "Payments", "Activity", "Cards", or explanatory copy like "Send, request, and review..." when the current tab, header, or primary content already makes the purpose obvious.

Screens should start as high as safely possible after the status bar/safe area. Use only the top padding needed for a comfortable header and touch targets. Avoid large empty top gaps before the first useful content.

The first visible content should usually be the primary data, action group, search/filter row, or form. Supporting explanatory copy belongs only where it prevents real user confusion.

### Headers

Use compact headers.

For tab screens, avoid unnecessary back buttons. For pushed screens, use a clear back affordance and a short title.

Header titles should stay short.

Headers must keep the same vertical position across all screens. A user should not see the header jump higher or lower when moving between tabs, pushed screens, admin screens, auth screens, or detail screens.

Header actions must align vertically with the header title. Return, notification, menu, drawer, and contextual action buttons should sit on the same visual baseline/height as the header, not above or below it.

Return/back buttons must always be placed in the top-left corner of the header area.

Notification buttons must always be placed in the top-right corner of the header area.

### Cards

Cards are for important visual data, not for general spacing.

Use cards for:

- Charts.
- Wallet cards.
- Key financial summaries.
- Critical account/security information.
- Important forms.

Avoid cards for:

- Simple menu rows.
- Settings sections.
- Static descriptions.
- Every page section.
- Wrapping another card.

If in doubt, separate with a line before choosing a card.

### Lists And Rows

Rows should feel native and tappable.

Use:

- Left icon from Lucide when helpful.
- Compact label.
- Optional right-side detail.
- Chevron for navigation rows.
- Bottom border for separation.
- Native `Pressable` feedback and haptics when appropriate.

### Icons

Always look for icons in `lucide-react-native` first.

Do not use image assets for generic UI icons when Lucide has an equivalent. Asset icons should be reserved for brand-specific or product-specific graphics.

Icon buttons should use recognizable symbols instead of text whenever the action is common, such as back, close, menu, notification, theme, logout, edit, delete, or search.

### Text Inputs

Text inputs must be custom components styled with NativeWind.

Do not use raw, unstyled `TextInput` directly in screens. Prefer reusable input components that provide:

- Label.
- Placeholder styling.
- Focus state.
- Error state.
- Disabled state when needed.
- Theme-aware background, border, and text color.
- Native keyboard configuration.

Inputs should feel native and should use React Native primitives.

### Buttons

Prefer native `Pressable`-based buttons.

Buttons should have clear states:

- Default.
- Pressed.
- Disabled.
- Loading.
- Error/destructive when relevant.

Primary actions should be visually distinct, but not oversized.

Header buttons must stay aligned with the header height on every screen. Do not place header actions at different vertical offsets between screens.

Drawer buttons should open their drawer from the same side/corner where the button is located. If the drawer trigger is on the right, the drawer should enter from the right. If the trigger is on the left, the drawer should enter from the left.

Drawers opened from header buttons should occupy the full screen, including the tab bar area. Do not leave the bottom tab bar visually outside or above the drawer overlay.

Filter buttons should open a modal when the filter surface is small and focused. Use this pattern for compact filters, quick sorting, date ranges, and short option sets that can be changed without leaving the current context.

If the user must choose from many options, compare multiple values, search through a long list, or review a large amount of data, use a dedicated screen instead of a modal. A modal should never become a cramped full workflow.

### Native Behavior

Use as many native React Native and Expo primitives as possible.

Prefer:

- `View`, `Text`, `Pressable`, `ScrollView`, `TextInput`.
- `SafeAreaView`.
- Expo Router navigation.
- NativeWind styling.
- Lucide React Native icons.
- Native haptics where interaction feedback matters.

Avoid web-first assumptions and avoid bringing in third-party UI abstractions unless the project already depends on them or the native implementation would be risky.

## Do's and Don'ts

Do:

- Use the existing theme tokens.
- Keep text compact.
- Compact screen information to avoid excessive scrolling while preserving comfortable spacing and readability.
- Use Lucide icons first.
- Use NativeWind for custom inputs and layout styling.
- Prefer dividers before cards.
- Keep tab screens free from redundant location copy.
- Put the first useful content as high as the safe area allows.
- Remove intro eyebrow/subtitle text when the screen purpose is already clear.
- Use native-feeling rows and controls.
- Keep each screen focused on its main task.
- Validate UI visually in Expo after changes.

Don't:

- Do not create card-heavy pages.
- Do not put cards inside cards.
- Do not add large hero titles to app screens.
- Do not add decorative copy explaining where the user is.
- Do not add top intro text that restates the current tab, section, or obvious action.
- Do not create excessive scroll by using oversized headers, repeated copy, unnecessary cards, or decorative empty space.
- Do not use generic image assets as UI icons when Lucide has the icon.
- Do not use raw unstyled text inputs.
- Do not introduce arbitrary hardcoded colors.
- Do not redesign unrelated flows in the same pass.
- Do not add web-style landing page patterns inside the mobile app.
