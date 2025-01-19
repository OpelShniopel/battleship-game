import React, { useState, useEffect } from 'react';
import { ShipType } from '../types/game';

interface ShipNotificationProps {
  shipType: ShipType | null;
  onClose: () => void;
}

/**
 * Notification component for sunk ships with:
 * - Fade in/out animations
 * - Auto-dismissal
 * - Cleanup timers
 *
 * Uses multiple timeouts for smooth animation:
 * 1. Fade in delay
 * 2. Display duration
 * 3. Fade out
 * 4. Component cleanup
 */
const SinkNotification: React.FC<ShipNotificationProps> = ({
  shipType,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    let fadeInTimeout: NodeJS.Timeout;
    let fadeOutTimeout: NodeJS.Timeout;
    let cleanupTimeout: NodeJS.Timeout;

    if (shipType) {
      setShouldRender(true);
      // Start fade in
      fadeInTimeout = setTimeout(() => setIsVisible(true), 50);

      // Start fade out
      fadeOutTimeout = setTimeout(() => {
        setIsVisible(false);
      }, 2700);

      // Final cleanup
      cleanupTimeout = setTimeout(() => {
        setShouldRender(false);
        onClose();
      }, 3000); // Full duration including fade out
    }

    return () => {
      clearTimeout(fadeInTimeout);
      clearTimeout(fadeOutTimeout);
      clearTimeout(cleanupTimeout);
    };
  }, [shipType, onClose]);

  if (!shouldRender || !shipType) return null;

  return (
    <div
      className={`pointer-events-none fixed right-4 top-4 z-50 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
      } transition-all duration-300`}
    >
      <div className="rounded-lg bg-green-900/50 p-4">
        <p className="text-lg font-bold text-white">
          🎯 You sunk the {shipType.toLowerCase()}!
        </p>
      </div>
    </div>
  );
};

export default SinkNotification;
