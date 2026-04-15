import { Radar } from 'lucide-react';
import { UI_TEXT } from '../../constants';

const RecentButton = ({ onClick }) => {
  return (
    <button className="recenter-btn" onClick={onClick} title={UI_TEXT.recenterBtn}>
      <Radar size={22} />
    </button>
  );
};

export default RecentButton;
