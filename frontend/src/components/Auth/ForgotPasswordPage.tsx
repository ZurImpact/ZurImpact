import {useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Link} from 'react-router';
import {AuthFormCard} from './AuthFormCard';
import {Form, FormField, FormItem, FormLabel, FormControl, FormMessage} from '../ui/form';
import {Input} from '../ui/input';
import {Button} from '../ui/button';
import {useAppDispatch, useAppSelector} from '../../store/store';
import {requestPasswordReset, resetAuthOp} from '../../store/slices/AuthSlice';
import {forgotPasswordSchema, type ForgotPasswordInput} from '../../lib/validation/authSchemas';
import {ROUTES} from '../../routes';

export function ForgotPasswordPage() {
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
      Remember your password?{' '}
      <Link to={ROUTES.login} className="underline hover:text-foreground">
        Sign in
      </Link>
    </div>
  );

  if (isFulfilled) {
    return (
      <AuthFormCard
        title="Forgot your password?"
        description="Enter your email and we'll send you a link to reset it."
        footer={footer}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If an account with that address exists, we've sent a password reset link. Check your inbox.
          </p>
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
            Send to a different address
          </Button>
        </div>
      </AuthFormCard>
    );
  }

  return (
    <AuthFormCard
      title="Forgot your password?"
      description="Enter your email and we'll send you a link to reset it."
      footer={footer}
    >
      {resetError && resetStatus === 'rejected' && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          Couldn't reach the server, please try again.
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({field}) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  {/* type="email" — jsdom blocks invalid email strings via HTML5 validation;
                      Zod email validation is tested separately in authSchemas.test.ts */}
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      </Form>
    </AuthFormCard>
  );
}
