import {useEffect, useState} from 'react';
import {Award, Plus} from 'lucide-react';
import {useNavigate} from 'react-router';
import {Card} from '../ui/card';
import {Button} from '../ui/button';
import {useAppSelector, useAppDispatch} from '../../store/store';
import {fetchActions, fetchUserActions} from '../../store/slices/ActionSlice';
import {useTranslation} from 'react-i18next';
import {ActionCard} from './ActionCard/ActionCard';
import {ROUTES} from '../../routes';

export function ActionDashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {t} = useTranslation();

  const {isAuthenticated, currentUser, roles = []} = useAppSelector((state) => state.user);
  const {actions, loading, error, userActions} = useAppSelector((state) => state.actions);

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handleActionClick = (actionId: number) => {
    // TODO Implement action click behavior (e.g., open details, start action, etc.)
    setFeedbackMessage(`Action ${actionId} clicked`);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const canCreateActions = roles.some(
    (role) => role === 'ADMIN' || role === 'PARTNER' || role === 'ROLE_ADMIN' || role === 'ROLE_PARTNER',
  );

  // Fetch actions on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    dispatch(fetchActions({}));
    dispatch(fetchUserActions({userId: currentUser?.id || 1}));
  }, [dispatch, isAuthenticated, currentUser?.id]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 text-center bg-card text-card-foreground rounded-xl border">
          <p className="text-muted-foreground">{t('actionDashboard.loginPrompt')}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">{t('actionDashboard.header')}</h1>
          <p className="text-muted-foreground">{t('actionDashboard.subheader')}</p>
        </div>
        {canCreateActions && (
          <Button className="shrink-0" onClick={() => navigate(ROUTES.actionCreate)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t('actionDashboard.createAction')}
          </Button>
        )}
      </div>

      {/* Feedback message */}
      {feedbackMessage && (
        <div role="status" className="mb-4 p-4 bg-brand-container text-on-brand-container rounded-lg">
          {feedbackMessage}
        </div>
      )}

      {/* Activity Types Info */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {actions.map((action) => (
          <ActionCard key={action.id} action={action} onClick={() => handleActionClick(action.id)} />
        ))}
      </div>

      {/* Activity History */}
      <Card className="p-6 bg-card text-card-foreground rounded-xl border">
        <h2 className="text-2xl font-semibold mb-6">{t('actionDashboard.historyTitle')}</h2>

        {error && (
          <div className="mb-4 p-4 bg-destructive-container border border-destructive rounded-lg" role="alert">
            <p className="text-on-destructive-container">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12" role="status" aria-live="polite">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"
              aria-hidden="true"
            ></div>
            <p className="text-muted-foreground">{t('actionDashboard.loading')}</p>
          </div>
        ) : actions.length === 0 ? (
          <div className="text-center py-12">
            <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
            <p className="text-muted-foreground mb-4">{t('actionDashboard.noActions')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {userActions.map((userAction) => {
              const Icon = Award;

              return (
                <div
                  key={userAction.actionId}
                  className="flex items-center gap-4 p-4 bg-surface-container rounded-lg hover:bg-surface-container-high transition-colors"
                >
                  <div className="p-3 rounded-lg bg-brand-container">
                    <Icon className="h-6 w-6 text-on-brand-container" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{userAction?.displayName || 'Activity'}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(userAction.actionCreatedOn || '').toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-brand text-lg">+{userAction?.points || 0}</div>
                    <div className="text-xs text-muted-foreground">{t('points')}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
