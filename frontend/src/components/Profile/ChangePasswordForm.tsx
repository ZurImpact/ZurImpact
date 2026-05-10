import {useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useNavigate} from 'react-router';
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
        <CardTitle>Change password</CardTitle>
        <CardDescription>Changing your password will sign you out of all devices.</CardDescription>
      </CardHeader>
      <CardContent>
        {changePasswordError === 'wrong_current_password' && (
          <div
            role="alert"
            className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            Your current password is incorrect. Please try again.
          </div>
        )}

        {changePasswordError && changePasswordError !== 'wrong_current_password' && changePasswordStatus === 'rejected' && (
          <div
            role="alert"
            className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            Couldn&apos;t change password, please try again.
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
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
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
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
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Changing password…' : 'Change password'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
