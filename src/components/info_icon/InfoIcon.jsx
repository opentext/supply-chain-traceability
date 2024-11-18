import PropTypes from 'prop-types';
import './InfoIcon.scss';

function InfoIcon({ title, icon }) {
  return (
    <div className="infoIcon">
      <div className="container">
        <img src={icon} alt={title} className="icon" />
        <div className="title">{title}</div>
      </div>
    </div>
  );
}

InfoIcon.propTypes = {
  title: PropTypes.string,
  icon: PropTypes.string,
};
export default InfoIcon;
