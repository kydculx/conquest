/**
 * 전술 상황 실시간 알림 피드 컴포넌트
 * - 타일 점령, 적군 침공 등 실시간 이벤트를 화면 하단에 순차적으로 표시합니다.
 * - 일정 시간이 지나면 자동으로 소멸하는 애니메이션을 포함합니다.
 */
import { useEffect, useState } from 'react';
import { AlertTriangle, Radiation, CheckCircle2, Terminal } from 'lucide-react';
import './TacticalAlert.css';

const ALERT_ICONS = {
  info: <Terminal size={16} className="alert-icon" />,
  warning: <AlertTriangle size={16} className="alert-icon" />,
  danger: <Radiation size={16} className="alert-icon" />,
  success: <CheckCircle2 size={16} className="alert-icon" />,
};

/**
 * 개별 알림 아이템 컴포넌트 (타이머 포함)
 */
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

/**
 * 알림 컴포넌트들을 담는 컨테이너
 * @param {Object} props
 * @param {Array} props.alerts - 알림 객체 배열 [{id, message, type}]
 * @param {Function} props.onRemove - 알림 제거 콜백
 */
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
