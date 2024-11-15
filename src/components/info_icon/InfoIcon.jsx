import React from 'react'
import "./InfoIcon.scss";

function InfoIcon({title, icon}) {
  return (
    <div className="infoIcon">
      <div className="container">
       <img src={icon} alt={title} className="icon"/>
       <div className="title">{title}</div>
      </div>
  </div>
  );
}
export default InfoIcon;
