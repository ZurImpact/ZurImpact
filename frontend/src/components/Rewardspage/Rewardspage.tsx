import {useEffect, useState} from 'react';
import type {RedemptionResult} from '../../store/slices/RewardSlice';
import {Card} from '../ui/card';
import {Button} from '../ui/button';
import {Badge} from '../ui/badge';
import {Gift, Coffee, Utensils, ShoppingBag, Ticket, Lock, User} from 'lucide-react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '../ui/dialog';
import {toast} from 'sonner';
import {useAppDispatch, useAppSelector} from '../../store/store';
import {fetchRewards, redeemVoucher, resetRedemptionStatus} from '../../store/slices/RewardSlice';
import {fetchCurrentUser} from '../../store/slices/UserSlice';
import {useTranslation} from 'react-i18next';

const ICON_MAP: Record<string, React.ComponentType<{className?: string}>> = {
  Coffee,
  Utensils,
  ShoppingBag,
  Ticket,
};

interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  category: string;
  icon: string;
  available: number;
}

export function RewardsPage() {
  const dispatch = useAppDispatch();
  const {t} = useTranslation();
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [redeemedResult, setRedeemedResult] = useState<RedemptionResult | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const {rewards, redemptionLoading, loading, redemptionSuccess, redemptionError} = useAppSelector((s) => s.rewards);
  const {currentUser, isAuthenticated, loading: userLoading, error: userError} = useAppSelector((s) => s.user);

  useEffect(() => {
    dispatch(fetchCurrentUser());
    dispatch(fetchRewards());
  }, [dispatch]);


  useEffect(() => {
    if (redemptionSuccess) {
      toast.success(t('rewardsPage.redeemSuccess'));
      dispatch(resetRedemptionStatus());
    }
  }, [redemptionSuccess, dispatch, t]);

  useEffect(() => {
    if (redemptionError) {
      toast.error(redemptionError);
      dispatch(resetRedemptionStatus());
    }
  }, [redemptionError, dispatch]);

  const isDialogOpen = selectedReward !== null || redeemedResult !== null;

  const handleDismissResult = () => {
    setRedeemedResult(null);
    setSelectedReward(null);
    setRedeemError(null);
    dispatch(resetRedemptionStatus());
    dispatch(fetchCurrentUser());
    dispatch(fetchRewards());
  };

  const handleRedeem = async (reward: Reward) => {
    if (!currentUser) {
      toast.error(t('rewardsPage.notAuthenticated'));
      return;
    }

    if (currentUser.points < reward.points) {
      toast.error(t('rewardsPage.notEnoughPoints'));
      return;
    }

    setRedeemError(null);
    try {
      const result = await dispatch(redeemVoucher({voucherId: reward.id})).unwrap();
      setRedeemedResult(result);
    } catch (err) {
      setRedeemError(typeof err === 'string' ? err : t('rewardsPage.redeemFailed'));
    }
  };

  const handleRetryAuth = () => {
    dispatch(fetchCurrentUser());
  };

  const categories = ['all', 'Food & Drink', 'Shopping', 'Culture', 'Tourism', 'Services'];
  const filteredRewards = filter === 'all' ? rewards : rewards.filter((r) => r.category === filter);

  const getIcon = (iconName: string) => {
    return ICON_MAP[iconName] || Gift;
  };

  if (userLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">{t('rewardsPage.loading')}</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || userError === 'not_authenticated') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">{t('rewardsPage.header')}</h1>
          <p className="text-primary">{t('rewardsPage.subheader')}</p>
        </div>

        <Card className="p-8 text-center max-w-md mx-auto mt-12">
          <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">{t('rewardsPage.loginRequired')}</h2>
          <p className="text-gray-600 mb-6">{t('rewardsPage.loginPrompt')}</p>
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleRetryAuth}>
            {t('rewardsPage.tryAgain')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">{t('rewardsPage.header')}</h1>
        <p className="text-primary">{t('rewardsPage.subheader')}</p>
      </div>

      <Card className="p-6 mb-8 bg-green-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 mb-1">{t('rewardsPage.availablePoints')}</p>
            <p className="text-4xl font-bold">{currentUser?.points}</p>
          </div>
          <Gift className="h-16 w-16 opacity-20" />
        </div>
      </Card>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <Button
            key={category}
            variant={filter === category ? 'default' : 'outline'}
            onClick={() => setFilter(category)}
            className={filter === category ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {category === 'all' ? t('rewardsPage.allRewards') : category}
          </Button>
        ))}
      </div>

      {loading && <div className="text-center py-8 text-gray-500">{t('rewardsPage.loading')}</div>}

      {!loading && filteredRewards.length === 0 && (
        <div className="text-center py-8 text-gray-500">{t('rewardsPage.noRewards')}</div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRewards.map((reward) => {
          const canAfford = (currentUser?.points ?? 0) >= reward.points;
          const Icon = getIcon(reward.icon);

          return (
            <Card
              key={reward.id}
              className={`p-6 relative ${!canAfford ? 'opacity-60' : 'hover:shadow-lg transition-shadow'}`}
            >
              {!canAfford && (
                <div className="absolute top-4 right-4">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
              )}

              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-500/20 rounded-lg">
                  <Icon className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <Badge variant="secondary" className="mb-2">
                    {reward.category}
                  </Badge>
                  <h3 className="font-semibold text-lg mb-1">{reward.title}</h3>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">{reward.description}</p>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-green-600 text-xl">
                    {reward.points} {t('rewardsPage.pts')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {reward.available} {t('rewardsPage.available')}
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedReward(reward)}
                  disabled={!canAfford || redemptionLoading}
                  className={canAfford ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300'}
                >
                  {t('rewardsPage.redeem')}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={isDialogOpen}>
        <DialogContent className="bg-card">
          {redeemedResult ? (
            <>
              <DialogHeader>
                <DialogTitle>{t('rewardsPage.redeemSuccess')}</DialogTitle>
                <DialogDescription>{redeemedResult.displayName}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="p-4 bg-green-100 dark:bg-green-500/20 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-2">{t('rewardsPage.yourVoucherCode')}</p>
                  <p className="text-2xl font-mono font-bold tracking-widest text-green-700">
                    {redeemedResult.code}
                  </p>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleDismissResult}>
                  {t('rewardsPage.close')}
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{t('rewardsPage.redeemReward')}</DialogTitle>
                <DialogDescription>{t('rewardsPage.confirmRedemption')}</DialogDescription>
              </DialogHeader>
              {selectedReward && (
                <div className="space-y-4 mt-4">
                  <div className="p-4 bg-secondary rounded-lg">
                    <h4 className="font-semibold mb-2">{selectedReward.title}</h4>
                    <p className="text-sm mb-3">{selectedReward.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('rewardsPage.cost')}:</span>
                      <span className="font-bold text-green-600">
                        {selectedReward.points} {t('rewardsPage.pts')}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-green-100 dark:bg-green-500/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">{t('rewardsPage.currentPoints')}:</span>
                      <span className="font-semibold">{currentUser?.points}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('rewardsPage.afterRedemption')}:</span>
                      <span className="font-semibold text-green-700">
                        {(currentUser?.points ?? 0) - selectedReward.points}
                      </span>
                    </div>
                  </div>

                  {redeemError && (
                    <p className="text-sm text-red-600 text-center">{redeemError}</p>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedReward(null)}
                      disabled={redemptionLoading}
                    >
                      {t('rewardsPage.cancel')}
                    </Button>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleRedeem(selectedReward)}
                      disabled={redemptionLoading}
                    >
                      {redemptionLoading ? t('rewardsPage.redeeming') : t('rewardsPage.confirmRedemptionBtn')}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Card className="p-6 mt-8 bg-green-600">
        <div className="flex items-start gap-4">
          <Gift className="h-8 w-8 text-primary-foreground flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-primary-foreground text-lg mb-2">{t('rewardsPage.howRewardsWork')}</h3>
            <ul className="space-y-2 text-sm text-primary-foreground">
              <li>• {t('rewardsPage.howRewardsPoint1')}</li>
              <li>• {t('rewardsPage.howRewardsPoint2')}</li>
              {/* <li>• {t('rewardsPage.howRewardsPoint3')}</li> */}
              <li>• {t('rewardsPage.howRewardsPoint4')}</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
