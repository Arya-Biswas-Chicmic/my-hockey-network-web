import type { RoleOption } from '@my-hockey-network/types';

export enum ROUTES {
  ONBOARDING = 'Onboarding',
  SIGNUP = 'Signup',
  LOGIN = 'Login',
  FORGOT_PASSWORD = 'ForgotPassword',
  MAIN_TABS = 'MainTabs',
}

export const DEFAULT_ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'parent',
    title: 'Parent / Guardian',
    description: 'Support my athlete on and off the ice',
    icon: '/parents.png',
  },
  {
    id: 'player',
    title: 'Player',
    description: 'I play hockey',
    icon: '/player.png',
  },
  {
    id: 'coach',
    title: 'Coach / Team Staff',
    description: 'I coach or support a team.',
    icon: '/CoachTeam.png',
  },
];

export const DEFAULT_SELECTED_ROLE_IDS: string[] = ['player'];

export const BRAND_COLORS = {
  primary: '#0B66C2',
  primaryHover: '#09519b',
  primaryActive: '#073f78',
  heading: '#424242',
  subheading: '#BDBDBD',
  textDark: '#0C1014',
  textMuted: 'rgba(12, 16, 20, 0.8)',
  borderLight: '#8C8C8C33',
  borderSelected: '#A7D3FF',
  bgCard: '#FFFFFF',
  bgScreen: '#FFFFFF',
  bgIllustration: '#0d59cf',
} as const;

export const ONBOARDING_STRINGS = {
  title: 'How are you\ninvolved in hockey?',
  subtitle: 'Select all that apply. You can update this\nanytime in your settings',
  continueButton: 'Continue',
} as const;

export const CREATE_ACCOUNT_STRINGS = {
  title: 'Create Account',
  subtitle: "Let's Create your account",
  fullNameLabel: 'Full Name',
  fullNamePlaceholder: 'enter your name',
  emailLabel: 'Email',
  emailPlaceholder: 'admin@gmail.com',
  dobLabel: 'DOB',
  dobPlaceholder: 'DD/MM/YYYY',
  submitButton: 'Sign up',
  googleButton: 'Continue with Google',
  backButton: 'Back',
  alreadyHaveAccount: 'Already have an account? ',
  signInLink: 'Sign-in',
} as const;

export const GUARDIAN_APPROVAL_STRINGS = {
  brandName: 'MyHockey',
  panelTitle: 'Empowering the next generation of \nathletes.',
  panelSubtitle: 'Join the premier network for hockey players, coaches, and families. Safety and sportsmanship start with a strong community foundation.',
  featureSecureTitle: 'Secure Verification',
  featureSecureSubtitle: 'Strict compliance with youth safety standards.',
  featureParentalTitle: 'Parental Controls',
  featureParentalSubtitle: "Managing your child's hockey journey together.",
  formTitle: 'Guardian Approval Required',
  formSubtitle: 'To keep your account safe and follow community guidelines, we need a parent or guardian to verify your account.',
  emailLabel: 'Parent/Guardian Email Address',
  emailPlaceholder: 'email@example.com',
  sendRequestButton: 'Send Verification Request',
  signOutButton: 'Sign Out',
  havingTrouble: 'Having trouble? ',
  contactSupport: 'Contact Support',
} as const;

export const REQUEST_SENT_STRINGS = {
  title: 'Request Sent!',
  subtitle: "We've emailed your parent/guardian. Once they approve, you'll have limited access to MyHockey Network. You can explore some public content in the meantime.",
  continueButton: 'Continue',
  featureTournamentsTitle: 'Public Tournaments',
  featureTournamentsDesc: 'View open bracket results and regional rankings.',
  featureCommunityTitle: 'Community Board',
  featureCommunityDesc: "See what's happening in the local hockey scene.",
} as const;



export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token_v1',
  USER_THEME: 'user_theme_preference',
  ONBOARDING_STATE: 'onboarding_state_v1',
} as const;

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  DATE_DDMMYYYY: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d$/,
  // Letters, spaces, hyphens, and apostrophes — e.g. "Mary-Jane O'Brien". ASCII only.
  NAME: /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/,
} as const;

export * from './messages';
