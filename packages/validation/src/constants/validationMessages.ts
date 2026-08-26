export const VALIDATION_MESSAGES = {
  // Required fields
  fullNameRequired: 'Full Name is required.',
  emailRequired: 'Email Address is required.',
  dobRequired: 'Date of Birth is required.',
  relationshipRequired: 'Relationship to player is required.',
  otpRequired: 'Verification code is required.',
  passwordRequired: 'Password is required.',
  teamNameRequired: 'Team / Organization Name is required.',
  positionRequired: 'Position is required.',
  cityRequired: 'City / Country is required.',
  subjectRequired: 'Subject is required.',
  categoryRequired: 'Category is required.',
  messageRequired: 'Message details are required.',

  // Length constraints
  fullNameMin: 'Full Name must be at least 2 characters.',
  fullNameMax: 'Full Name cannot be more than 50 characters.',
  nameMin: (field: string) => `${field} must be at least 2 characters.`,
  nameMax: (field: string) => `${field} cannot be more than 50 characters.`,
  bioMax: 'Bio cannot exceed 300 characters.',
  noteMax: 'Note cannot exceed 300 characters.',
  messageMin: 'Message details must be at least 10 characters.',
  messageMax: 'Message details cannot exceed 1000 characters.',

  // Format validation
  invalidEmail: 'Please enter a valid email address.',
  invalidOtp: 'Enter a valid verification code (4-8 digits).',
  invalidApprovalCode: 'Enter a valid 6-digit approval code.',
  invalidDobFormat: 'Please enter a valid date of birth (DD/MM/YYYY).',
  futureDob: 'Date of birth cannot be in the future.',

  // Age & role business rules
  parentMinAge: 'Parent account holders must be at least 18 years old.',
  playerMinAge: (roleLabel = 'player') => `Minimum age for ${roleLabel}s is 5 years.`,
  maxAgeLimit: 'Maximum age limit is 100 years.',
  invalidAgeRange: 'Please enter a valid date of birth.',

  // Jersey number
  jerseyNumberInvalid: 'Jersey number must be an integer between 0 and 99.',

  // Dates
  startYearFuture: 'Start year cannot be in the future.',
  endYearFuture: 'End year cannot be in the future.',
  endDateBeforeStart: 'End date cannot be before start date.',
  startMonthRequired: 'Start month is required.',
  startYearRequired: 'Start year is required.',
  endMonthRequired: 'End month is required.',
  endYearRequired: 'End year is required.',
};
