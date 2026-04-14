import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="security-check-overlay">
        <div className="security-scanner">
          <div className="scan-line"></div>
        </div>
        <div className="security-content">
          <div className="tactical-loader">
            <div className="loader-ring"></div>
            <div className="loader-core"></div>
          </div>
          <h2 className="security-title">SECURITY CLEARANCE CHECKING...</h2>
          <div className="security-status-feed">
            <p className="status-item animate-pulse">VERIFYING AUTHENTICATION TOKEN...</p>
            <p className="status-item delay-1">DECRYPTING BIO-METRIC DATA...</p>
            <p className="status-item delay-2">ESTABLISHING SECURE UPLINK...</p>
          </div>
        </div>
        <div className="clearance-footer">
          <span>CLASSIFIED DATA - ACCESS RESTRICTED</span>
          <span className="blink">|</span>
        </div>
      </div>
    );
  }

  if (!user) {
    // 사용자가 로그인되어 있지 않으면 로그인 페이지로 리다이렉트하되, 
    // 원래 가려던 페이지 정보를 state로 넘겨줌
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
