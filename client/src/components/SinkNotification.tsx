import { useEffect } from 'react';
import { ShipType } from '../types/game';

const getShipDisplayName = (shipType: ShipType): string => {
  // Converting SNAKE_CASE to Title Case
  return shipType
    .split('_')
    .map((word) => word.charAt(0) + word.toLowerCase().slice(1))
    .join(' ');
};

const SinkNotification = ({
  shipType,
  onClose,
}: {
  shipType: ShipType;
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Close notification after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed right-4 top-4 z-50 animate-fade-in">
      <div className="rounded-lg bg-green-600 px-6 py-4 shadow-lg">
        <div className="flex items-center space-x-2">
          <span className="text-lg text-white">
            ☠️ You sunk a {getShipDisplayName(shipType)}!
          </span>
        </div>
      </div>
    </div>
  );
};

export default SinkNotification;
