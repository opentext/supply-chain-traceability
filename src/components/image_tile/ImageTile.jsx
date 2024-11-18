import PropTypes from 'prop-types';
import './ImageTile.scss';
import { useNavigate } from 'react-router-dom';

function ImageTile({
  title, image, link, externalUrl,
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (externalUrl) {
      window.open(externalUrl, '_blank');
    } else {
      navigate(link);
    }
  };
  return (
    <div className="imageTile" onClick={handleClick}>
      <div className="imageTileContainer">
        <div>
          <img alt={title} src={image} className="imageTileImage" />
          <div className="imageTileOverlay" />
          <div className="imageTileText">{title}</div>
        </div>
      </div>
    </div>
  );
}

ImageTile.propTypes = {
  title: PropTypes.string,
  image: PropTypes.string,
  link: PropTypes.string,
  externalUrl: PropTypes.string,
};

export default ImageTile;
