import {Footprints} from 'lucide-react';
import type {ActionDto} from '../../../store/slices/ActionSlice';
import {Card} from '../../ui/card';
import {Badge} from '../../ui/badge';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router';
import {ROUTES} from '../../../routes';

export const ActionCard = ({action, onClick}: {action: ActionDto; onClick?: () => void}) => {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const handleClick = () => {
    if (action.type === 'GPS') {
      navigate(ROUTES.actionDetails(action.id));
    } else if (onClick) {
      onClick();
    } else {
      console.log('Action clicked:', action.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <Card
      data-testid="action-card"
      data-action-id={action.id}
      className="p-6 relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${action.displayName}, ${action.points} ${t('points')}`}
    >
      <div className="relative z-10">
        <div className="p-3 bg-info-container rounded-lg w-fit mb-4">
          <Footprints className="h-8 w-8 text-on-info-container" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{action.displayName}</h3>
        <p className="text-muted-foreground mb-4">{action.description}</p>
        <Badge variant="secondary" className="bg-info-container text-on-info-container border-transparent">
          {action.points} {t('points')}
        </Badge>
      </div>
      <div className="absolute right-0 bottom-0 w-48 h-48 opacity-5" aria-hidden="true">
        <Footprints className="w-full h-full" />
      </div>
    </Card>
  );
};
