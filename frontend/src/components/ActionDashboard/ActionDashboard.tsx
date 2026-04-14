import {useEffect} from 'react';
import {Card} from '../ui/card';
import {Award} from 'lucide-react';
import {useAppSelector, useAppDispatch} from '../../store/store';
import {fetchActions, fetchUserActions} from '../../store/slices/ActionSlice';
import {fetchUser} from '../../store/slices/UserSlice';
import {CURRENT_USER_ID} from '../../constants/user';
import {useTranslation} from 'react-i18next';
import {ActionCard} from './ActionCard/ActionCard';

export function ActionDashboard() {
  const dispatch = useAppDispatch();
  const {t} = useTranslation();

  const {actions, loading, error, userActions} = useAppSelector((state) => state.actions);
  const user = useAppSelector((state) => state.user.user);

  const handleActionClick = (actionId: number) => {
    // TODO Implement action click behavior (e.g., open details, start action, etc.)
    alert(`Action clicked: ${actionId}`);
  };

  // Fetch actions and user on component mount
  useEffect(() => {
    dispatch(fetchActions({}));
    if (!user) {
      dispatch(fetchUser(CURRENT_USER_ID));
    }
  }, [dispatch, user]);

  // Fetch user actions once user is loaded
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserActions(user.id));
    }
  }, [dispatch, user?.id]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 dark:text-white">{t('actionDashboard.header')}</h1>
          <p className="text-gray-600">{t('actionDashboard.subheader')}</p>
        </div>
      </div>

      {/* Activity Types Info */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {actions.map((action) => (
          <ActionCard key={action.id} action={action} onClick={() => handleActionClick(action.id)} />
        ))}
      </div>

      {/* Activity History */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-6">{t('actionDashboard.historyTitle')}</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-500">{t('actionDashboard.loading')}</p>
          </div>
        ) : actions.length === 0 ? (
          <div className="text-center py-12">
            <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">{t('actionDashboard.noActions')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {userActions.map((userAction) => {
              const Icon = Award;

              return (
                <div
                  key={userAction.actionId}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors "
                >
                  <div className={`p-3 rounded-lg dark:bg-green-500/20`}>
                    <Icon className={`h-6 w-6`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold dark:text-green-600">{userAction?.displayName || 'Activity'}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(userAction.actionCreatedOn || '').toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600 text-lg">+{userAction?.points || 0}</div>
                    <div className="text-xs text-gray-500">{t('points')}</div>
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
