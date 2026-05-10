import {useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Form, FormField, FormItem, FormLabel, FormControl, FormMessage} from '../ui/form';
import {Input} from '../ui/input';
import {Button} from '../ui/button';
import {useAppDispatch, useAppSelector} from '../../store/store';
import {resendVerification, resetAuthOp} from '../../store/slices/AuthSlice';
import {resendVerificationSchema, type ResendVerificationInput} from '../../lib/validation/authSchemas';

interface ResendVerificationFormProps {
  defaultEmail?: string;
}

export function ResendVerificationForm({defaultEmail}: ResendVerificationFormProps) {
  const dispatch = useAppDispatch();
  const resendStatus = useAppSelector((s) => s.auth.resendVerification.status);
  const resendError = useAppSelector((s) => s.auth.resendVerification.error);

  const form = useForm<ResendVerificationInput>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: {email: defaultEmail ?? ''},
  });

  useEffect(() => {
    return () => {
      dispatch(resetAuthOp('resendVerification'));
    };
  }, [dispatch]);

  const onSubmit = async (values: ResendVerificationInput) => {
    await dispatch(resendVerification({email: values.email}));
  };

  const isPending = resendStatus === 'pending';
  const isFulfilled = resendStatus === 'fulfilled';

  if (isFulfilled) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          If an account with that address exists, we've sent a fresh verification link. Check your inbox.
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => dispatch(resetAuthOp('resendVerification'))}
        >
          Send to a different address
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {resendError && resendStatus === 'rejected' && (
        <div
          role="alert"
          className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
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
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Sending…' : 'Resend verification email'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
