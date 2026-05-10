import {useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useNavigate, Link} from 'react-router';
import {AuthFormCard} from './AuthFormCard';
import {Form, FormField, FormItem, FormLabel, FormControl, FormMessage} from '../ui/form';
import {Input} from '../ui/input';
import {Button} from '../ui/button';
import {useAppDispatch, useAppSelector} from '../../store/store';
import {registerUser, resetAuthOp} from '../../store/slices/AuthSlice';
import {registerSchema, type RegisterInput} from '../../lib/validation/authSchemas';
import {ROUTES} from '../../routes';

export function RegisterPage() {
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
      navigate(
        `${ROUTES.verifyEmail}?pending=1&email=${encodeURIComponent(submittedEmail)}`,
        {replace: true},
      );
    }
  };

  const isPending = registerStatus === 'pending';

  const footer = (
    <div className="text-sm text-muted-foreground">
      Already have an account?{' '}
      <Link to={ROUTES.login} className="underline hover:text-foreground">
        Sign in
      </Link>
    </div>
  );

  return (
    <AuthFormCard
      title="Create your account"
      description="Fill in the details below to get started"
      footer={footer}
    >
      {registerError && registerStatus === 'rejected' && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          Something went wrong, please try again.
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
            name="email"
            render={({field}) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
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
            {isPending ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
      </Form>
    </AuthFormCard>
  );
}
