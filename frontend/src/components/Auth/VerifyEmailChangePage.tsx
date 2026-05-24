import {useEffect, useRef} from 'react';
import {Link, useSearchParams} from 'react-router';
import {CheckCircle2} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {AuthFormCard} from './AuthFormCard';
import {Button} from '../ui/button';
import {useAppDispatch, useAppSelector} from '../../store/store';
import {verifyEmailChangeToken, resetAuthOp} from '../../store/slices/AuthSlice';
import {ROUTES} from '../../routes';

export function VerifyEmailChangePage() {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const verifyStatus = useAppSelector((s) => s.auth.verifyEmailChange.status);

  const token = searchParams.get('token');
  const hasDispatched = useRef(false);

  useEffect(() => {
    if (token && !hasDispatched.current) {
      hasDispatched.current = true;
      window.history.replaceState({}, '', ROUTES.verifyEmailChange);
      dispatch(verifyEmailChangeToken({token}));
    }
  }, [token, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(resetAuthOp('verifyEmailChange'));
    };
  }, [dispatch]);

  if (verifyStatus === 'pending' || (token && verifyStatus === 'idle')) {
    return (
      <AuthFormCard title={t('auth.verifyEmailChange.titleVerifying')}>
        <div className="flex items-center justify-center py-6">
          <div 
            className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" 
            aria-hidden="true" 
          />
        </div>
      </AuthFormCard>
    );
  }

  if (verifyStatus === 'fulfilled') {
    return (
      <AuthFormCard title={t('auth.verifyEmailChange.titleSuccess')}>
        <div className="flex flex-col items-center gap-4 py-4">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <p className="text-center text-sm text-muted-foreground">
            {t('auth.verifyEmailChange.descriptionSuccess')}
          </p>
          <Button asChild size="lg" className="w-full bg-brand hover:bg-brand/90 text-brand-foreground">
            <Link to={ROUTES.profile}>{t('auth.verifyEmailChange.returnToProfile')}</Link>
          </Button>
        </div>
      </AuthFormCard>
    );
  }

  if (verifyStatus === 'rejected') {
    return (
      <AuthFormCard title={t('auth.verifyEmailChange.titleFailed')}>
        <div 
          role="alert" 
          className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {t('auth.verifyEmailChange.descriptionFailed')}
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          {t('auth.verifyEmailChange.resendHintFailed')}
        </p>
        <Button asChild variant="outline" className="w-full">
            <Link to={ROUTES.profile}>{t('auth.verifyEmailChange.returnToProfile')}</Link>
        </Button>
      </AuthFormCard>
    );
  }

  // Fallback if no token is in the URL at all
  return (
    <AuthFormCard title={t('auth.verifyEmailChange.fallbackTitle')}>
      <p className="mb-4 text-sm text-muted-foreground">
        {t('auth.verifyEmailChange.fallbackDescription')}
      </p>
      <Button asChild className="w-full bg-brand hover:bg-brand/90 text-brand-foreground">
        <Link to={ROUTES.dashboard}>{t('auth.verifyEmailChange.goToDashboard')}</Link>
      </Button>
    </AuthFormCard>
  );
}