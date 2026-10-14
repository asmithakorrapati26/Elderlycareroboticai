import { RobotAvatar } from './RobotAvatar';

interface RobotCompanionProps {
  state: 'idle' | 'speaking' | 'listening' | 'alert' | 'emergency' | 'happy';
  message: string;
  name?: string;
}

export function RobotCompanion({ state, message, name = 'CareBot' }: RobotCompanionProps) {
  const stateLabels = {
    idle: 'Standing By',
    speaking: 'Speaking',
    listening: 'Listening',
    alert: 'Alert Mode',
    emergency: 'Emergency!',
    happy: 'All Clear',
  };

  const stateColors = {
    idle: 'text-secondary-400',
    speaking: 'text-primary-400',
    listening: 'text-primary-400',
    alert: 'text-warning-400',
    emergency: 'text-error-400',
    happy: 'text-success-400',
  };

  return (
    <div className="flex items-center gap-5 p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
      <RobotAvatar state={state} size="lg" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-neutral-100">{name}</span>
          <span className={`text-xs font-medium ${stateColors[state]}`}>• {stateLabels[state]}</span>
        </div>
        <p className="text-sm text-neutral-300 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
