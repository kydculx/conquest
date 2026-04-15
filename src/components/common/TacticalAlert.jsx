import { useEffect, useState } from 'react';
import { AlertTriangle, Radiation, CheckCircle2, Terminal } from 'lucide-react';
import './TacticalAlert.css';

const ALERT_ICONS = {
  info: <Terminal size={16} className="alert-icon" />,
  warning: <AlertTriangle size={16} className="alert-icon" />,
  danger: <Radiation size={16} className="alert-icon" />,
  success: <CheckCircle2 size={16} className="alert-icon" />,
};

const TacticalAlertItem = ({ id, message, type = 'info', onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(id), 400); 
    }, 4000);

    return () => clearTimeout(timer);
  }, [id, onRemove]);

  return (
    <div className={`tactical-alert ${type} ${isExiting ? 'exiting' : ''}`}>
      {ALERT_ICONS[type]}
      <div className="alert-content">
        <p className="alert-message">{message}</p>
      </div>
    </div>
  );
};

const TacticalAlertContainer = ({ alerts, onRemove }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="tactical-alerts-container">
      {alerts.map((alert) => (
        <TacticalAlertItem
          key={alert.id}
          id={alert.id}
          message={alert.message}
          type={alert.type}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

export default TacticalAlertContainer;
