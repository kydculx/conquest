/**
 * 전술 상황 알림(Alert) 시스템
 * - 팀 점령, 적군 침공 등 실시간 이벤트를 화면 우측 하단에 스택 형태로 표시합니다.
 * - 일정 시간이 지나면 자동으로 페이드 아웃되며 사라집니다.
 */
import React, { useEffect, useState } from 'react';
import { Info, AlertTriangle, Radiation, CheckCircle2 } from 'lucide-react';
import './TacticalAlert.css';

// 알림 타입별 루시드 아이콘 매핑
const ALERT_ICONS = {
  info: <Info size={18} className="alert-icon" />,
  warning: <AlertTriangle size={18} className="alert-icon" />,
  danger: <Radiation size={18} className="alert-icon" />,
  success: <CheckCircle2 size={18} className="alert-icon" />,
};

/**
 * 개별 알림 아이템 컴포넌트
 * - 타이머를 통해 자동 삭제 로직을 관리합니다.
 */
const TacticalAlertItem = ({ id, message, type = 'info', onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // 4초 후 퇴장 애니메이션 시작
    const timer = setTimeout(() => {
      setIsExiting(true);
      // 애니메이션(0.4초) 완료 후 실제 상태에서 제거
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
 * 알림 컨테이너 컴포넌트
 * - 여러 개의 알림을 수직으로 나열합니다.
 */
const TacticalAlertContainer = ({ alerts, onRemove }) => {
  // 알림이 없으면 아무것도 렌더링하지 않음
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
