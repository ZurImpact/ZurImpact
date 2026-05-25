import {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useNavigate} from 'react-router';
import {useTranslation} from 'react-i18next';
import {z} from 'zod';
import {useAppSelector} from '../../store/store';
import {useAppDispatch} from '../../store/store';
import {Card, CardContent, CardHeader, CardTitle} from '../ui/card';
import {Badge} from '../ui/badge';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '../ui/form';
import {Input} from '../ui/input';
import {Button} from '../ui/button';
import {ROUTES} from '../../routes';
import {deleteCurrentUser, updateCurrentUserEmail, updateCurrentUserName} from '../../api/userApi';
import {logout, updateCurrentUser} from '../../store/slices/UserSlice';
import {ChangePasswordForm} from './ChangePasswordForm';

const updateProfileNameSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters'),
});

const updateEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type UpdateProfileNameInput = z.infer<typeof updateProfileNameSchema>;
type UpdateEmailInput = z.infer<typeof updateEmailSchema>;

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function ProfilePage() {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentUser = useAppSelector((s) => s.user.currentUser);
  const [emailUpdateMessage, setEmailUpdateMessage] = useState<string | null>(null);
  const [emailUpdateError, setEmailUpdateError] = useState<string | null>(null);
  const [nameUpdateMessage, setNameUpdateMessage] = useState<string | null>(null);
  const [nameUpdateError, setNameUpdateError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const nameForm = useForm<UpdateProfileNameInput>({
    resolver: zodResolver(updateProfileNameSchema),
    defaultValues: {username: currentUser?.username ?? ''},
  });

  const emailForm = useForm<UpdateEmailInput>({
    resolver: zodResolver(updateEmailSchema),
    defaultValues: {email: currentUser?.email ?? ''},
  });

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    nameForm.reset({username: currentUser.username});
    emailForm.reset({email: currentUser.email});
    setNameUpdateError(null);
    setEmailUpdateError(null);
  }, [currentUser, emailForm, nameForm]);

  const handleNameUpdate = async (values: UpdateProfileNameInput) => {
    setNameUpdateError(null);
    setNameUpdateMessage(null);

    try {
      const updatedUser = await updateCurrentUserName({newUsername: values.username});
      dispatch(updateCurrentUser(updatedUser));
      setNameUpdateMessage(t('profile.updateName.success'));
    } catch {
      setNameUpdateError(t('profile.updateName.errorGeneric'));
    }
  };

  const handleEmailUpdate = async (values: UpdateEmailInput) => {
    setEmailUpdateError(null);
    setEmailUpdateMessage(null);

    try {
      await updateCurrentUserEmail({newEmail: values.email});
      setEmailUpdateMessage(t('profile.updateEmail.success'));
    } catch {
      setEmailUpdateError(t('profile.updateEmail.errorGeneric'));
    }
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm(t('profile.deleteProfile.confirmMessage'))) {
      return;
    }

    setDeleteError(null);
    setIsDeleting(true);

    try {
      await deleteCurrentUser();
      dispatch(logout());
      navigate(ROUTES.login, {replace: true, state: {reason: 'account_deleted'}});
    } catch {
      setDeleteError(t('profile.deleteProfile.errorGeneric'));
    } finally {
      setIsDeleting(false);
    }
  };

  if (!currentUser) {
    return (
      <div data-testid="profile-page" className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <p className="text-muted-foreground">{t('profile.loadingState')}</p>
      </div>
    );
  }

  return (
    <div data-testid="profile-page" className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{currentUser.username}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
            <span className="text-muted-foreground font-medium">{t('profile.emailLabel')}</span>
            <span>{currentUser.email}</span>

            <span className="text-muted-foreground font-medium">{t('profile.roleLabel')}</span>
            <span>
              <Badge variant="secondary">{currentUser.role}</Badge>
            </span>

            <span className="text-muted-foreground font-medium">{t('profile.emailStatusLabel')}</span>
            <span>
              {currentUser.emailVerified ? (
                <Badge variant="default">{t('profile.verifiedBadge')}</Badge>
              ) : (
                <Badge variant="destructive">{t('profile.notVerifiedBadge')}</Badge>
              )}
            </span>

            <span className="text-muted-foreground font-medium">{t('profile.creditsLabel')}</span>
            <span>
              <span className="text-2xl font-bold">{currentUser.points}</span>{' '}
              <span className="text-muted-foreground">{t('profile.creditsUnit')}</span>
            </span>

            {currentUser.createdAt && (
              <>
                <span className="text-muted-foreground font-medium">{t('profile.memberSinceLabel')}</span>
                <span>{formatDate(currentUser.createdAt)}</span>
              </>
            )}

            {currentUser.address !== null && (
              <>
                <span className="text-muted-foreground font-medium">{t('profile.addressLabel')}</span>
                <span>{t('profile.addressFormat', {id: currentUser.address})}</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('profile.updateName.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('profile.updateName.description')}</p>

          {nameUpdateError && (
            <div
              role="alert"
              className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {nameUpdateError}
            </div>
          )}

          {nameUpdateMessage && (
            <div
              role="status"
              className="rounded-md border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-700"
            >
              {nameUpdateMessage}
            </div>
          )}

          <Form {...nameForm}>
            <form onSubmit={nameForm.handleSubmit(handleNameUpdate)} className="space-y-4">
              <FormField
                control={nameForm.control}
                name="username"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>{t('profile.updateName.nameLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        autoComplete="username"
                        placeholder={t('profile.updateName.namePlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-brand hover:bg-brand/90 text-brand-foreground"
                disabled={nameForm.formState.isSubmitting}
              >
                {nameForm.formState.isSubmitting
                  ? t('profile.updateName.submitPending')
                  : t('profile.updateName.submit')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('profile.updateEmail.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('profile.updateEmail.description')}</p>

          {currentUser.hasPendingEmailChange && (
            <div
              role="alert"
              className="rounded-md border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700"
            >
              {t('profile.updateEmail.pendingVerificationBanner')}
            </div>
          )}

          {emailUpdateError && (
            <div
              role="alert"
              className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {emailUpdateError}
            </div>
          )}

          {emailUpdateMessage && (
            <div
              role="status"
              className="rounded-md border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-700"
            >
              {emailUpdateMessage}
            </div>
          )}

          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(handleEmailUpdate)} className="space-y-4">
              <FormField
                control={emailForm.control}
                name="email"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>{t('profile.updateEmail.emailLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder={t('profile.updateEmail.emailPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-brand hover:bg-brand/90 text-brand-foreground"
                disabled={emailForm.formState.isSubmitting}
              >
                {emailForm.formState.isSubmitting
                  ? t('profile.updateEmail.submitPending')
                  : t('profile.updateEmail.submit')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>{t('profile.deleteProfile.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('profile.deleteProfile.description')}</p>

          {deleteError && (
            <div
              role="alert"
              className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {deleteError}
            </div>
          )}

          <Button
            variant="destructive"
            className="w-full sm:w-auto"
            onClick={handleDeleteProfile}
            disabled={isDeleting}
          >
            {isDeleting ? t('profile.deleteProfile.buttonPending') : t('profile.deleteProfile.button')}
          </Button>
        </CardContent>
      </Card>

      <ChangePasswordForm />
    </div>
  );
}
