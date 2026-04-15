/**
 * 하단 핵심 액션: 구역 점령 버튼 컴포넌트
 * - 점령 상태, 팀 컬러, GPS 신호 강도 등에 따라 다양한 시각적 피드백을 제공합니다.
 * @param {Object} props
 * @param {string} props.teamId - 현재 선택된 팀 ID
 * @param {boolean} props.isCapturing - 현재 점령 진행 중 여부
 * @param {string} props.statusType - 버튼의 시각적 테마 (ready, busy, secured, warning 등)
 * @param {Function} props.onClick - 클릭 핸들러
 * @param {string} props.statusText - 버튼 중앙에 표시될 텍스트
 * @param {boolean} props.disabled - 활성화 여부
 */
const CaptureButton = ({ team, isCapturing, statusType, onClick, statusText, disabled }) => {
  return (
    <div
      className={`capture-overlay-btn team-${team} state-${statusType} ${isCapturing ? 'loading' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      {/* 전술적 코너 브래킷 */}
      <div className="btn-bracket-tl"></div>
      <div className="btn-bracket-tr"></div>
      <div className="btn-bracket-bl"></div>
      <div className="btn-bracket-br"></div>
      
      {/* 빗금 패턴 배경 */}
      <div className="btn-scanline-pattern"></div>

      <div className="btn-content">
        <div className="text-info-area">
          <span className="main-status">
            {statusText}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CaptureButton;
