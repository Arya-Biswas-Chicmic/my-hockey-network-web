'use client';

import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

export type SliderProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

/**
 * Project-owned range-slider primitive. The single web wrapper for
 * `<input type="range">`; extend with typed variants here rather than
 * adding a raw `<input type="range">` at a feature call site.
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(({ className, ...props }, ref) => (
  <input ref={ref} type="range" className={cn('mhn-slider', className)} {...props} />
));

Slider.displayName = 'Slider';
