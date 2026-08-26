'use client';

import { CalendarDays } from 'lucide-react';
import { useRef } from 'react';

import { Button } from '@/components/ui/button';

export interface DatePickerButtonProps {
  onDateSelected: (isoDate: string) => void;
  className?: string;
  disabled?: boolean;
  label?: string;
}

export function DatePickerButton({
  onDateSelected,
  className,
  disabled = false,
  label = 'Open date picker',
}: Readonly<DatePickerButtonProps>) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpenPicker = () => {
    if (typeof inputRef.current?.showPicker === 'function') inputRef.current.showPicker();
    else inputRef.current?.click();
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value) onDateSelected(event.target.value);
  };

  return (
    <>
      <Button type="button" variant="icon" className={className} disabled={disabled} onClick={handleOpenPicker} aria-label={label}>
        <CalendarDays size={18} aria-hidden="true" />
      </Button>
      <input ref={inputRef} type="date" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={handleDateChange} />
    </>
  );
}
