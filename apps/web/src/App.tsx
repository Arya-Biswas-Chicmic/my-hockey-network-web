import { OnboardingModal } from './components/features/onboarding/OnboardingModal';

export default function App() {
  const handleComplete = (data: { selectedRoles: string[]; accountData?: any }) => {
    console.log('Onboarding & Signup Complete:', data);
  };

  return (
    <main className="onboarding-screen">
      <OnboardingModal onComplete={handleComplete} />
    </main>
  );
}
