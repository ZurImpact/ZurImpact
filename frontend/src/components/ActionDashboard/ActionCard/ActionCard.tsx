import {Footprints} from 'lucide-react';
import type {ActionDto} from '../../../store/slices/ActionSlice';
import {Card} from '../../ui/card';
import {Badge} from '../../ui/badge';
import {useTranslation} from 'react-i18next';

export const ActionCard = ({action, onClick}: {action: ActionDto; onClick: () => void}) => {
  const {t} = useTranslation();
  return (
    <Card className="p-6 relative overflow-hidden hover:shadow-lg transition-shadow" onClick={onClick}>
      <div className="relative z-10">
        <div className="p-3 bg-blue-100 rounded-lg w-fit mb-4">
          <Footprints className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{action.displayName}</h3>
        <p className="text-gray-600 mb-4">{action.description}</p>
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          {action.points} {t('points')}
        </Badge>
      </div>
      <div className="absolute right-0 bottom-0 w-48 h-48 opacity-5">
        <Footprints className="w-full h-full" />
      </div>
    </Card>
  );
};
