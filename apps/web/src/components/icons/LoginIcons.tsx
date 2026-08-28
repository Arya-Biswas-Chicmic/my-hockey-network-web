import type { SVGProps } from 'react';

/**
 * Login/onboarding flow icons — traced from Figma
 * (figma.com/design/cqlBXHZtqPkKcLRmR6a1B8, node 2203:29491, "Login"
 * section, dark-theme screens). Path data taken directly from Figma's
 * exported SVGs (not hand-drawn) via `download_assets`, matching the same
 * sourcing rule as `SidebarIcons.tsx`/`FeedActionIcons.tsx`.
 *
 * Every stroke uses `currentColor` rather than the exact hex Figma exported
 * (e.g. the calendar's `#333333`/`#484747`) — those hex values are specific
 * to the one dark-panel context the designer placed them in, not a
 * light/dark pair. `currentColor` lets the call site's CSS set the right
 * shade per theme via the existing token system (`var(--color-foreground)`
 * etc.), the same way `SidebarIcons.tsx`'s `fill="currentColor"` already
 * does — no separate light/dark file or component needed for a
 * single-color glyph like this.
 */
type IconProps = { size?: number | string } & SVGProps<SVGSVGElement>;

/** Date-of-birth field calendar icon (Figma node 2203:25927, "icon /
 * outlined / action / main / calendar"). Replaces lucide-react's generic
 * `CalendarDays` in `DatePickerButton.tsx` with the exact traced glyph. */
export function LoginCalendarIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M15.8333 3.33594H4.16667C3.24619 3.33594 2.5 4.08213 2.5 5.0026V16.6693C2.5 17.5897 3.24619 18.3359 4.16667 18.3359H15.8333C16.7538 18.3359 17.5 17.5897 17.5 16.6693V5.0026C17.5 4.08213 16.7538 3.33594 15.8333 3.33594Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.332 1.66406V4.9974" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.66797 1.66406V4.9974" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 8.33594H17.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Guardian/security shield icon (Figma node 2203:41475, "ShieldIcon"). */
export function LoginShieldIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path opacity="0.15" d="M9 1.6875L15.1875 4.5V9C15.1875 12.375 12.375 15.1875 9 15.75C5.625 15.1875 2.8125 12.375 2.8125 9V4.5L9 1.6875Z" fill="currentColor" />
      <path d="M9 1.6875L15.1875 4.5V9C15.1875 12.375 12.375 15.1875 9 15.75C5.625 15.1875 2.8125 12.375 2.8125 9V4.5L9 1.6875Z" stroke="currentColor" strokeWidth="1.4625" strokeLinejoin="round" />
      <path d="M6.1875 8.99844L8.2125 11.0234L11.5875 7.64844" stroke="currentColor" strokeWidth="1.4625" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Password-visibility toggle icon (Figma node 2264:51016, "view"). No
 * current call site — this app's auth flow is OTP-based, no password
 * field — kept for whenever one exists. */
export function LoginEyeIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M17.9546 9.20156C18.208 9.55681 18.3346 9.73448 18.3346 9.9974C18.3346 10.2603 18.208 10.438 17.9546 10.7932C16.8162 12.3896 13.909 15.8307 10.0013 15.8307C6.09362 15.8307 3.18639 12.3896 2.048 10.7932C1.79464 10.438 1.66797 10.2603 1.66797 9.9974C1.66797 9.73448 1.79464 9.55681 2.048 9.20156C3.18639 7.60526 6.09362 4.16406 10.0013 4.16406C13.909 4.16406 16.8162 7.60526 17.9546 9.20156Z" stroke="currentColor" />
      <path d="M12.4999 10C12.4999 8.61927 11.3807 7.50002 9.99992 7.50002C8.61917 7.50002 7.49992 8.61927 7.49992 10C7.49992 11.3808 8.61917 12.5 9.99992 12.5C11.3807 12.5 12.4999 11.3808 12.4999 10Z" stroke="currentColor" />
    </svg>
  );
}

/** Small dropdown/select chevron (Figma node 2203:37691, "Down"). */
export function LoginChevronDownIcon({ size = 11, ...props }: IconProps) {
  return (
    <svg width={size} height={Number(size) * (6 / 10.6667) || size} viewBox="0 0 10.6667 6" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M10 0.666667L5.33333 5.33333L0.666667 0.666667" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
