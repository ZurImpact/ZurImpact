import {useEffect, useRef} from 'react';
import {Link, useSearchParams} from 'react-router';
import {CheckCircle2} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {AuthFormCard} from './AuthFormCard';
import {Button} from '../ui/button';
import {ResendVerificationForm} from './ResendVerificationForm';
import {useAppDispatch, useAppSelector} from '../../store/store';
import {verifyEmailToken, resetAuthOp} from '../../store/slices/AuthSlice';
import {ROUTES} from '../../routes';

export function VerifyEmailPage() {
  const {t} = useTranslation();
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
        <AuthFormCard title={t('auth.verifyEmail.titleVerifying')}>
          <div className="flex items-center justify-center py-6">
            <div
              className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
              aria-hidden="true"
            />
          </div>
          <p className="text-center text-sm text-muted-foreground">{t('auth.verifyEmail.verifyingMessage')}</p>
        </AuthFormCard>
      );
    }

    if (verifyStatus === 'fulfilled') {
      return (
        <AuthFormCard title={t('auth.verifyEmail.titleSuccess')}>
          <div className="flex flex-col items-center gap-4 py-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <p className="text-center text-sm text-muted-foreground">{t('auth.verifyEmail.descriptionSuccess')}</p>
            <Button asChild size="lg" className="w-full bg-brand hover:bg-brand/90 text-brand-foreground">
              <Link to={ROUTES.login}>{t('auth.verifyEmail.continueButton')}</Link>
            </Button>
          </div>
        </AuthFormCard>
      );
    }

    if (verifyStatus === 'rejected') {
      return (
        <AuthFormCard title={t('auth.verifyEmail.titleFailed')}>
          <div
            role="alert"
            className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {t('auth.verifyEmail.descriptionFailed')}
          </div>
          <p className="mb-4 text-sm text-muted-foreground">{t('auth.verifyEmail.resendHintFailed')}</p>
          <ResendVerificationForm />
        </AuthFormCard>
      );
    }
  }

  // Pending mode (?pending=1) or idle/fallback (no params)
  return (
    <AuthFormCard title={t('auth.verifyEmail.titlePending')} description={t('auth.verifyEmail.descriptionPending')}>
      <p className="mb-4 text-sm text-muted-foreground">{t('auth.verifyEmail.resendHint')}</p>
      <ResendVerificationForm defaultEmail={pending && emailParam ? decodeURIComponent(emailParam) : undefined} />
    </AuthFormCard>
  );
}
