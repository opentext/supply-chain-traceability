import React from 'react'
import "./ImageTile.scss";
import { useHistory } from 'react-router-dom';
function ImageTile({ title, image, link, externalUrl }) {
  const history = useHistory();

  const handleClick = () => {
    if(externalUrl) {
      window.open(externalUrl, "_self")
    } else {
      history.push(link);
    }
  };
  return (
    <div className="imageTile" onClick={handleClick}>
      <div className="imageTileContainer">
        <div>
          <img
            alt={title}
            src={image}
            className="imageTileImage"
          />
          <div className="imageTileOverlay" />
          <div className="imageTileText">{title}</div>
        </div>
      </div>
    </div>
  );
}

export default ImageTile;
