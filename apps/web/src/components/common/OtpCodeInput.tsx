import { useEffect, useRef } from 'react';
import { Input } from '@/components/common/FormControls';

export interface OtpCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  error?: string | null;
  className?: string;
  onComplete?: (value: string) => void;
}

export function OtpCodeInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  error,
  className = '',
  onComplete,
}: OtpCodeInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, index) => value[index] || '');

  useEffect(() => {
    if (!error) return;
    const firstEmptyIndex = digits.findIndex((digit) => !digit);
    inputRefs.current[Math.max(firstEmptyIndex, 0)]?.focus();
  }, [error, value]);

  const updateValue = (index: number, rawValue: string) => {
    const incomingDigits = rawValue.replace(/\D/g, '').slice(0, length - index).split('');
    if (incomingDigits.length === 0 && rawValue) return;

    const nextDigits = [...digits];
    if (incomingDigits.length > 1) {
      incomingDigits.forEach((digit, offset) => {
        nextDigits[index + offset] = digit;
      });
    } else {
      nextDigits[index] = incomingDigits[0] || '';
    }

    const nextValue = nextDigits.join('').slice(0, length);
    onChange(nextValue);
    const nextIndex = Math.min(index + Math.max(incomingDigits.length, 1), length - 1);
    if (incomingDigits.length > 0) inputRefs.current[nextIndex]?.focus();
    if (nextValue.length === length) onComplete?.(nextValue);
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      return;
    }
    if (
      event.key === 'Tab' || event.key === 'ArrowLeft' || event.key === 'ArrowRight' ||
      event.key === 'Delete' || event.key === 'Enter' || event.ctrlKey || event.metaKey
    ) return;
    if (!/^\d$/.test(event.key)) event.preventDefault();
  };

  return (
    <div className={`otp-inputs-row ${className}`}>
      {digits.map((digit, index) => (
        <Input
          key={index}
          ref={(element) => { inputRefs.current[index] = element; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={index === 0 ? length : 1}
          value={digit}
          onChange={(event) => updateValue(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          className={`otp-digit-input ${error ? 'mhn-input-invalid' : ''}`}
          disabled={disabled}
          autoFocus={index === 0}
          aria-label={`Verification code digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
