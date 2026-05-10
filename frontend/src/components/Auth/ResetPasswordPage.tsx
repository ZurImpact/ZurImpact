import {useEffect, useRef, useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Link, useSearchParams} from 'react-router';
import {AuthFormCard} from './AuthFormCard';
import {Form, FormField, FormItem, FormLabel, FormControl, FormMessage} from '../ui/form';
import {Input} from '../ui/input';
import {Button} from '../ui/button';
import {useAppDispatch, useAppSelector} from '../../store/store';
import {confirmPasswordReset, resetAuthOp} from '../../store/slices/AuthSlice';
import {resetPasswordSchema, type ResetPasswordInput} from '../../lib/validation/authSchemas';
import {ROUTES} from '../../routes';

export function ResetPasswordPage() {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const confirmStatus = useAppSelector((s) => s.auth.confirmPasswordReset.status);
  const confirmError = useAppSelector((s) => s.auth.confirmPasswordReset.error);

  // Capture token from URL on first render before stripping it from the address bar
  const tokenFromUrl = searchParams.get('token');
  const [capturedToken] = useState<string | null>(tokenFromUrl);
  const hasStripped = useRef(false);

  useEffect(() => {
    // Strip the token from the URL immediately on mount (security: avoids token in navigation history)
    if (capturedToken && !hasStripped.current) {
      hasStripped.current = true;
      window.history.replaceState({}, '', ROUTES.passwordResetConfirm);
    }
  }, [capturedToken]);

  useEffect(() => {
    return () => {
      dispatch(resetAuthOp('confirmPasswordReset'));
    };
  }, [dispatch]);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {token: capturedToken ?? '', newPassword: '', confirmPassword: ''},
  });

  const onSubmit = async (values: ResetPasswordInput) => {
    await dispatch(confirmPasswordReset({token: capturedToken ?? values.token, newPassword: values.newPassword}));
  };

  const isPending = confirmStatus === 'pending';
  const isFulfilled = confirmStatus === 'fulfilled';
  const isRejected = confirmStatus === 'rejected';

  // Missing-token mode
  if (!capturedToken) {
    return (
      <AuthFormCard title="Set a new password" description="Enter and confirm your new password.">
        <div
          role="alert"
          className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          This reset link is invalid. Request a new one.
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link to={ROUTES.passwordResetRequest}>Request a new one</Link>
        </Button>
      </AuthFormCard>
    );
  }

  // Success mode
  if (isFulfilled) {
    return (
      <AuthFormCard title="Set a new password" description="Enter and confirm your new password.">
        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-center text-sm text-muted-foreground">
            Your password has been reset. You can now sign in.
          </p>
          <Button asChild className="w-full">
            <Link to={ROUTES.login}>Sign in</Link>
          </Button>
        </div>
      </AuthFormCard>
    );
  }

  // Form mode (idle, pending) or form-with-error mode (rejected)
  return (
    <AuthFormCard title="Set a new password" description="Enter and confirm your new password.">
      {isRejected && confirmError && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          This reset link is invalid or has expired.{' '}
          <Link to={ROUTES.passwordResetRequest} className="underline hover:text-foreground">
            Request a new one
          </Link>
          .
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            {isPending ? 'Resetting…' : 'Reset password'}
          </Button>
        </form>
      </Form>
    </AuthFormCard>
  );
}
