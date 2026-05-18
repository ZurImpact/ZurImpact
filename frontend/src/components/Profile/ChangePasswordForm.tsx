import {useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useNavigate} from 'react-router';
import {useTranslation} from 'react-i18next';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../ui/card';
import {Form, FormField, FormItem, FormLabel, FormControl, FormMessage} from '../ui/form';
import {Input} from '../ui/input';
import {Button} from '../ui/button';
import {useAppDispatch, useAppSelector} from '../../store/store';
import {changePassword, resetAuthOp} from '../../store/slices/AuthSlice';
import {logout} from '../../store/slices/UserSlice';
import {changePasswordSchema, type ChangePasswordInput} from '../../lib/validation/authSchemas';
import {ROUTES} from '../../routes';

export function ChangePasswordForm() {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const changePasswordStatus = useAppSelector((s) => s.auth.changePassword.status);
  const changePasswordError = useAppSelector((s) => s.auth.changePassword.error);

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {currentPassword: '', newPassword: '', confirmPassword: ''},
  });

  useEffect(() => {
    return () => {
      dispatch(resetAuthOp('changePassword'));
    };
  }, [dispatch]);

  const onSubmit = async (values: ChangePasswordInput) => {
    const result = await dispatch(
      changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    );

    if (changePassword.fulfilled.match(result)) {
      // Synchronously clear local auth state before navigating
      dispatch(logout());
      navigate(ROUTES.login, {replace: true, state: {reason: 'password_changed'}});
    }
  };

  const isPending = changePasswordStatus === 'pending';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('profile.changePassword.title')}</CardTitle>
        <CardDescription>{t('profile.changePassword.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {changePasswordError === 'wrong_current_password' && (
          <div
            role="alert"
            className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {t('profile.changePassword.errorWrongCurrentPassword')}
          </div>
        )}

        {changePasswordError &&
          changePasswordError !== 'wrong_current_password' &&
          changePasswordStatus === 'rejected' && (
            <div
              role="alert"
              className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {t('profile.changePassword.errorGeneric')}
            </div>
          )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({field}) => (
                <FormItem>
                  <FormLabel>{t('profile.changePassword.currentPasswordLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      placeholder={t('profile.changePassword.currentPasswordPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({field}) => (
                <FormItem>
                  <FormLabel>{t('profile.changePassword.newPasswordLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder={t('profile.changePassword.newPasswordPlaceholder')}
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
                  <FormLabel>{t('profile.changePassword.confirmPasswordLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder={t('profile.changePassword.confirmPasswordPlaceholder')}
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
              {isPending ? t('profile.changePassword.submitPending') : t('profile.changePassword.submit')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
