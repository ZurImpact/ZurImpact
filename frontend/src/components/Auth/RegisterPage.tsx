import {useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useNavigate, Link} from 'react-router';
import {useTranslation} from 'react-i18next';
import {AuthFormCard} from './AuthFormCard';
import {Form, FormField, FormItem, FormLabel, FormControl, FormMessage} from '../ui/form';
import {Input} from '../ui/input';
import {Button} from '../ui/button';
import {useAppDispatch, useAppSelector} from '../../store/store';
import {registerUser, resetAuthOp} from '../../store/slices/AuthSlice';
import {registerSchema, type RegisterInput} from '../../lib/validation/authSchemas';
import {ROUTES} from '../../routes';

export function RegisterPage() {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const registerStatus = useAppSelector((s) => s.auth.register.status);
  const registerError = useAppSelector((s) => s.auth.register.error);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {username: '', email: '', password: '', confirmPassword: ''},
  });

  useEffect(() => {
    return () => {
      dispatch(resetAuthOp('register'));
    };
  }, [dispatch]);

  const onSubmit = async (values: RegisterInput) => {
    const submittedEmail = values.email;
    const result = await dispatch(
      registerUser({
        username: values.username,
        email: values.email,
        password: values.password,
      }),
    );

    if (registerUser.fulfilled.match(result)) {
      navigate(ROUTES.verifyEmail, {replace: true, state: {pendingEmail: submittedEmail}});
      return;
    }

    if (registerUser.rejected.match(result)) {
      const code = result.payload as string;
      if (code === 'username_taken') {
        form.setError('username', {type: 'server', message: t('auth.register.errorUsernameTaken')});
      } else if (code === 'email_taken') {
        form.setError('email', {type: 'server', message: t('auth.register.errorEmailTaken')});
      }
    }
  };

  const showGenericError =
    registerStatus === 'rejected' &&
    registerError !== null &&
    registerError !== 'username_taken' &&
    registerError !== 'email_taken';

  const isPending = registerStatus === 'pending';

  const footer = (
    <div className="text-sm text-muted-foreground">
      {t('auth.register.alreadyHaveAccount')}{' '}
      <Link to={ROUTES.login} className="underline hover:text-foreground">
        {t('auth.register.signInLink')}
      </Link>
    </div>
  );

  return (
    <AuthFormCard title={t('auth.register.title')} description={t('auth.register.description')} footer={footer}>
      {showGenericError && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {t('auth.register.errorGeneric')}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({field}) => (
              <FormItem>
                <FormLabel>{t('auth.register.usernameLabel')}</FormLabel>
                <FormControl>
                  <Input autoComplete="username" placeholder={t('auth.register.usernamePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({field}) => (
              <FormItem>
                <FormLabel>{t('auth.register.emailLabel')}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder={t('auth.register.emailPlaceholder')}
                    {...field}
                  />
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
                <FormLabel>{t('auth.register.passwordLabel')}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    placeholder={t('auth.register.passwordPlaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({field}) => (
              <FormItem>
                <FormLabel>{t('auth.register.confirmPasswordLabel')}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    placeholder={t('auth.register.confirmPasswordPlaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            size="lg"
            className="w-full bg-brand hover:bg-brand/90 text-brand-foreground"
            disabled={isPending}
          >
            {isPending ? t('auth.register.submitPending') : t('auth.register.submit')}
          </Button>
        </form>
      </Form>
    </AuthFormCard>
  );
}
