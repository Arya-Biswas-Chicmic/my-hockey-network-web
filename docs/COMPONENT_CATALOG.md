# Component catalog and reuse policy

Last reviewed: 2026-08-26

## Rule

Before creating a component, search this catalog and `apps/*/src/components`. Extend an existing
component with typed variants when the interaction and semantics match. Create a new component only
when it represents a distinct reusable behavior or feature composition. Web React DOM and React
Native presentation remain separate; share contracts, state machines, validation, tokens, and props
concepts across platforms rather than forcing DOM/native markup into one component.

## Existing web primitives and shared compositions

- `common/Button`: generic button foundation; currently underused and its variants need completion.
- `common/FormControls`: the single web `Input`, `Select`, `Textarea`, accessible `Dropdown`, and
  `FormField` implementation. Do not create a second control file or accept inline style objects.
- `common/OtpCodeInput`: the accessible six-digit OTP input reused by email verification and
  guardian approval.
- `common/Header`: reused across the authenticated web pages.
- `common/Spinner`, `Toast`, `PendingBanner`, `NoDataFound`, `ServerDown`: reusable feedback/state UI.
- `ProfileSummaryCard`: reused by Home and Network; updated with word-break and overflow containment for display names and team handles.
- `GuardianApprovalModal` and `RequestSentCard`: reused in onboarding and dedicated auth pages.
- Feature components exist for events, feed/posts, messaging, network/groups, notifications, profile,
  and onboarding. Search the appropriate feature folder before adding another card/modal/view.

## Existing mobile primitives

- `components/Button`: loading, disabled, pressed, accessibility, and theme behavior.
- `components/Input`: label, error, focus, disabled, accessibility, and theme behavior.
- `components/Header` and `components/ScreenWrapper`: screen shell and navigation header.

## Audit findings and completed consolidation

The original audit found approximately 195 raw web buttons and 76 raw web form elements. These now
route through `common/Button` and `common/FormControls`; raw DOM controls are permitted only inside
those primitive implementations. Mobile Signup now uses the existing native Button, Input, and
ScreenWrapper. `design-system` is retained as a compatibility facade over canonical `design-tokens`.
`npm run components:check` prevents raw controls from returning to web features or mobile screens.
It also rejects React Native/mobile presentation imports from web, React DOM/web presentation imports
from mobile, inline web style objects, non-Formik semantic web forms, and JSX presentation inside
shared packages. It rejects relative app imports, explicit `any`, and inline SVG outside the approved
custom icon components. Ordinary web icons come from Lucide; branded and analytics visuals remain
isolated under reusable icon/illustration components. Therefore web common components are used only by web, and mobile common components
are used only by mobile.

Formik owns state, touched, validation-error, and submission behavior for every semantic web form:
login, signup, guardian approval, OTP verification, support tickets, profile editing, post creation,
and comments. Validators live in `apps/web/src/validation/forms.ts` or shared validation packages and
reuse Zod/domain rules. New substantial web forms must follow this pattern.

## Required consolidation before new screen work

1. Add feature-specific variants to existing primitives instead of introducing parallel controls.
2. Add a Storybook or component showcase as approved Figma implementation begins.
3. Add component-level interaction and accessibility tests screen-by-screen.
