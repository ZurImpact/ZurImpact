import {useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Link} from 'react-router';
import {useTranslation} from 'react-i18next';
import {AuthFormCard} from './AuthFormCard';
import {Form, FormField, FormItem, FormLabel, FormControl, FormMessage} from '../ui/form';
import {Input} from '../ui/input';
import {Button} from '../ui/button';
import {useAppDispatch, useAppSelector} from '../../store/store';
import {requestPasswordReset, resetAuthOp} from '../../store/slices/AuthSlice';
import {forgotPasswordSchema, type ForgotPasswordInput} from '../../lib/validation/authSchemas';
import {ROUTES} from '../../routes';

export function ForgotPasswordPage() {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const resetStatus = useAppSelector((s) => s.auth.requestPasswordReset.status);
  const resetError = useAppSelector((s) => s.auth.requestPasswordReset.error);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {email: ''},
  });

  useEffect(() => {
    return () => {
      dispatch(resetAuthOp('requestPasswordReset'));
    };
  }, [dispatch]);

  const onSubmit = async (values: ForgotPasswordInput) => {
    await dispatch(requestPasswordReset({email: values.email}));
  };

  const isPending = resetStatus === 'pending';
  const isFulfilled = resetStatus === 'fulfilled';

  const footer = (
    <div className="text-sm text-muted-foreground">
      {t('auth.forgotPassword.rememberPassword')}{' '}
      <Link to={ROUTES.login} className="underline hover:text-foreground">
        {t('auth.forgotPassword.signInLink')}
      </Link>
    </div>
  );

  if (isFulfilled) {
    return (
      <AuthFormCard
        title={t('auth.forgotPassword.title')}
        description={t('auth.forgotPassword.description')}
        footer={footer}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('auth.forgotPassword.successMessage')}</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => {
              form.reset();
              dispatch(resetAuthOp('requestPasswordReset'));
            }}
          >
            {t('auth.forgotPassword.sendDifferent')}
          </Button>
        </div>
      </AuthFormCard>
    );
  }

  return (
    <AuthFormCard
      title={t('auth.forgotPassword.title')}
      description={t('auth.forgotPassword.description')}
      footer={footer}
    >
      {resetError && resetStatus === 'rejected' && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {t('auth.forgotPassword.errorGeneric')}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({field}) => (
              <FormItem>
                <FormLabel>{t('auth.forgotPassword.emailLabel')}</FormLabel>
                <FormControl>
                  {/* type="email" — jsdom blocks invalid email strings via HTML5 validation;
                      Zod email validation is tested separately in authSchemas.test.ts */}
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder={t('auth.forgotPassword.emailPlaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? t('auth.forgotPassword.submitPending') : t('auth.forgotPassword.submit')}
          </Button>
        </form>
      </Form>
    </AuthFormCard>
  );
}
