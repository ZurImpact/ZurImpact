import {useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useTranslation} from 'react-i18next';
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
  const {t} = useTranslation();
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
        <p className="text-sm text-muted-foreground">{t('auth.resendVerification.successMessage')}</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => dispatch(resetAuthOp('resendVerification'))}
        >
          {t('auth.resendVerification.sendDifferent')}
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
          {t('auth.resendVerification.errorGeneric')}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({field}) => (
              <FormItem>
                <FormLabel>{t('auth.resendVerification.emailLabel')}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder={t('auth.resendVerification.emailPlaceholder')}
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
            {isPending ? t('auth.resendVerification.submitPending') : t('auth.resendVerification.submit')}
          </Button>
        </form>
      </Form>
    </div>
  );
}
