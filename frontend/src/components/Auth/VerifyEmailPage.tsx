import {useEffect, useRef} from 'react';
import {Link, useSearchParams} from 'react-router';
import {CheckCircle2} from 'lucide-react';
import {AuthFormCard} from './AuthFormCard';
import {Button} from '../ui/button';
import {ResendVerificationForm} from './ResendVerificationForm';
import {useAppDispatch, useAppSelector} from '../../store/store';
import {verifyEmailToken, resetAuthOp} from '../../store/slices/AuthSlice';
import {ROUTES} from '../../routes';

export function VerifyEmailPage() {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const verifyStatus = useAppSelector((s) => s.auth.verifyEmail.status);

  const token = searchParams.get('token');
  const pending = searchParams.get('pending');
  const emailParam = searchParams.get('email');

  const hasDispatched = useRef(false);

  useEffect(() => {
    if (token && !hasDispatched.current) {
      hasDispatched.current = true;
      // Strip the token from the URL immediately after capturing it
      window.history.replaceState({}, '', ROUTES.verifyEmail);
      dispatch(verifyEmailToken({token}));
    }
  }, [token, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(resetAuthOp('verifyEmail'));
    };
  }, [dispatch]);

  // Verifying mode — token was present
  if (token || verifyStatus === 'pending' || verifyStatus === 'fulfilled' || verifyStatus === 'rejected') {
    if (verifyStatus === 'pending' || (token && verifyStatus === 'idle')) {
      return (
        <AuthFormCard title="Verifying your email…">
          <div className="flex items-center justify-center py-6">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" aria-hidden="true" />
          </div>
          <p className="text-center text-sm text-muted-foreground">Verifying your email, please wait…</p>
        </AuthFormCard>
      );
    }

    if (verifyStatus === 'fulfilled') {
      return (
        <AuthFormCard title="Email verified!">
          <div className="flex flex-col items-center gap-4 py-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <p className="text-center text-sm text-muted-foreground">
              Your email address has been successfully verified.
            </p>
            <Button asChild className="w-full">
              <Link to={ROUTES.login}>Continue to sign in</Link>
            </Button>
          </div>
        </AuthFormCard>
      );
    }

    if (verifyStatus === 'rejected') {
      return (
        <AuthFormCard title="Verification failed">
          <div
            role="alert"
            className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            This verification link is invalid or has expired.
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Request a new verification link below.
          </p>
          <ResendVerificationForm />
        </AuthFormCard>
      );
    }
  }

  // Pending mode (?pending=1) or idle/fallback (no params)
  return (
    <AuthFormCard
      title="Check your email"
      description="We've sent a verification link to your email address. Click the link to activate your account."
    >
      <p className="mb-4 text-sm text-muted-foreground">
        Didn't receive the email? Enter your address below to resend.
      </p>
      <ResendVerificationForm defaultEmail={pending && emailParam ? decodeURIComponent(emailParam) : undefined} />
    </AuthFormCard>
  );
}
