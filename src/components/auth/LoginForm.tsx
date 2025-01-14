import { useLoginForm } from './login/useLoginForm';
import MemberNumberInput from './login/MemberNumberInput';
import LoginButton from './login/LoginButton';
import LegalLinks from './login/LegalLinks';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useState, useEffect } from 'react';

const LoginForm = () => {
  const { memberNumber, setMemberNumber, loading, handleLogin } = useLoginForm();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="bg-dashboard-card rounded-lg shadow-lg p-8 mb-12">
      {!isOnline && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You appear to be offline. Please check your internet connection.
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleLogin} className="space-y-6 max-w-md mx-auto">
        <MemberNumberInput
          memberNumber={memberNumber}
          setMemberNumber={setMemberNumber}
          loading={loading}
        />

        <LoginButton loading={loading} />
        <LegalLinks />
      </form>
    </div>
  );
};

export default LoginForm;