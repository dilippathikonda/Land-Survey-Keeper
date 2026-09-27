/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#17352A',
    tint: '#0E7C5A',

    // Core surfaces
    background: '#F7F4EC',
    foreground: '#17352A',

    // Cards / elevated surfaces
    card: '#FFFDF8',
    cardForeground: '#17352A',

    // Primary action color (buttons, links, active states)
    primary: '#0E7C5A',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#E6EEE7',
    secondaryForeground: '#17352A',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#E9E7DE',
    mutedForeground: '#6C766E',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#D18A45',
    accentForeground: '#FFFDF8',

    // Destructive actions (delete, error states)
    destructive: '#B54A42',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#D9D8CC',
    input: '#D9D8CC',
  },
  dark: {
    text: '#F3F0E6',
    tint: '#65C39D',
    background: '#10241D',
    foreground: '#F3F0E6',
    card: '#17352A',
    cardForeground: '#F3F0E6',
    primary: '#65C39D',
    primaryForeground: '#10241D',
    secondary: '#254A3A',
    secondaryForeground: '#F3F0E6',
    muted: '#23392F',
    mutedForeground: '#B5C2B9',
    accent: '#D99B5C',
    accentForeground: '#10241D',
    destructive: '#E26C61',
    destructiveForeground: '#10241D',
    border: '#315342',
    input: '#315342',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 8,
};

export default colors;
