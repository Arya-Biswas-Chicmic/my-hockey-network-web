import * as Yup from 'yup';
import { VALIDATION_MESSAGES } from '../constants/validationMessages';

export interface CareerFormValues {
  teamName: string;
  position: string;
  location: string;
  note?: string;
  startMonth: string;
  startYear: string;
  endMonth?: string;
  endYear?: string;
  isCurrentPlaying?: boolean;
}

export const careerSchema = Yup.object().shape({
  teamName: Yup.string()
    .trim()
    .required(VALIDATION_MESSAGES.teamNameRequired)
    .min(2, VALIDATION_MESSAGES.nameMin('Team Name'))
    .max(50, VALIDATION_MESSAGES.nameMax('Team Name')),

  position: Yup.string()
    .trim()
    .required(VALIDATION_MESSAGES.positionRequired)
    .max(50, VALIDATION_MESSAGES.nameMax('Position')),

  location: Yup.string()
    .trim()
    .required(VALIDATION_MESSAGES.cityRequired)
    .max(50, VALIDATION_MESSAGES.nameMax('Location')),

  note: Yup.string()
    .trim()
    .optional()
    .max(300, VALIDATION_MESSAGES.noteMax),

  startMonth: Yup.string()
    .required(VALIDATION_MESSAGES.startMonthRequired),

  startYear: Yup.string()
    .required(VALIDATION_MESSAGES.startYearRequired)
    .test('start-year-valid', VALIDATION_MESSAGES.startYearFuture, (val) => {
      if (!val) return false;
      const yr = Number(val);
      const currentYear = new Date().getFullYear();
      return !isNaN(yr) && yr <= currentYear;
    }),

  endMonth: Yup.string().when('isCurrentPlaying', {
    is: false,
    then: (schema) => schema.required(VALIDATION_MESSAGES.endMonthRequired),
    otherwise: (schema) => schema.optional(),
  }),

  endYear: Yup.string().when(['isCurrentPlaying', 'startYear'], {
    is: (isCurrentPlaying: boolean) => !isCurrentPlaying,
    then: (schema) =>
      schema
        .required(VALIDATION_MESSAGES.endYearRequired)
        .test('end-year-valid', VALIDATION_MESSAGES.endYearFuture, function (val) {
          if (!val) return false;
          const endYr = Number(val);
          const currentYear = new Date().getFullYear();
          if (isNaN(endYr) || endYr > currentYear) {
            return this.createError({ message: VALIDATION_MESSAGES.endYearFuture });
          }
          const startYr = Number(this.parent.startYear);
          if (!isNaN(startYr) && !isNaN(endYr) && endYr < startYr) {
            return this.createError({ message: VALIDATION_MESSAGES.endDateBeforeStart });
          }
          return true;
        }),
    otherwise: (schema) => schema.optional(),
  }),

  isCurrentPlaying: Yup.boolean().optional(),
});
