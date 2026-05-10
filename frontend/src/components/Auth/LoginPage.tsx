import {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useNavigate, useLocation, Link} from 'react-router';
import {useTranslation} from 'react-i18next';
import {AuthFormCard} from './AuthFormCard';
import {Form, FormField, FormItem, FormLabel, FormControl, FormMessage} from '../ui/form';
import {Input} from '../ui/input';
import {Button} from '../ui/button';
import {useAppDispatch, useAppSelector} from '../../store/store';
import {loginUser, resetAuthOp} from '../../store/slices/AuthSlice';
import {fetchCurrentUser} from '../../store/slices/UserSlice';
import {loginSchema, type LoginInput} from '../../lib/validation/authSchemas';
import {ROUTES} from '../../routes';

export function LoginPage() {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const loginStatus = useAppSelector((s) => s.auth.login.status);
  const loginError = useAppSelector((s) => s.auth.login.error);

  const locationState = location.state as {from?: string; reason?: string} | null;
  const from = locationState?.from;
  const [showPasswordChangedBanner] = useState(locationState?.reason === 'password_changed');

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {username: '', password: ''},
  });

  useEffect(() => {
    return () => {
      dispatch(resetAuthOp('login'));
    };
  }, [dispatch]);

  const onSubmit = async (values: LoginInput) => {
    const result = await dispatch(loginUser(values));

    if (loginUser.fulfilled.match(result)) {
      await dispatch(fetchCurrentUser());
      navigate(from ?? ROUTES.dashboard, {replace: true});
      return;
    }

    if (loginUser.rejected.match(result)) {
      const errorCode = result.payload as string;
      if (errorCode === 'email_not_verified') {
        navigate(ROUTES.verifyEmail + '?pending=1', {replace: true});
      }
    }
  };

  const isPending = loginStatus === 'pending';

  const footer = (
    <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
      <Link to={ROUTES.register} className="underline hover:text-foreground">
        {t('auth.login.signUpLink')}
      </Link>
      <Link to={ROUTES.passwordResetRequest} className="underline hover:text-foreground">
        {t('auth.login.forgotLink')}
      </Link>
    </div>
  );

  return (
    <AuthFormCard
      title={t('auth.login.title')}
      description={t('auth.login.description')}
      footer={footer}
    >
      {showPasswordChangedBanner && (
        <div
          role="status"
          className="mb-4 rounded-md border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400"
        >
          {t('auth.login.bannerPasswordChanged')}
        </div>
      )}

      {loginError === 'invalid_credentials' && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {t('auth.login.errorInvalidCredentials')}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({field}) => (
              <FormItem>
                <FormLabel>{t('auth.login.usernameLabel')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('auth.login.usernamePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({field}) => (
              <FormItem>
                <FormLabel>{t('auth.login.passwordLabel')}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder={t('auth.login.passwordPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? t('auth.login.submitPending') : t('auth.login.submit')}
          </Button>
        </form>
      </Form>
    </AuthFormCard>
  );
}
