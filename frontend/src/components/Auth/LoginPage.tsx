import {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useNavigate, useLocation, Link} from 'react-router';
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
        Register for an account
      </Link>
      <Link to={ROUTES.passwordResetRequest} className="underline hover:text-foreground">
        Forgot password?
      </Link>
    </div>
  );

  return (
    <AuthFormCard
      title="Sign in"
      description="Enter your credentials to access your account"
      footer={footer}
    >
      {showPasswordChangedBanner && (
        <div
          role="status"
          className="mb-4 rounded-md border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400"
        >
          Your password has been changed. Please sign in again.
        </div>
      )}

      {loginError === 'invalid_credentials' && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          Invalid username or password. Please try again.
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({field}) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="your_username" {...field} />
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </Form>
    </AuthFormCard>
  );
}
