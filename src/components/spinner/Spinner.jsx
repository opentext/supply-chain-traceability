import React from "react";
import "./Spinner.scss";

function Spinner() {
  return (
    <div className="spinner-container">
      <div className="spinner-border" />
      <div className="spinner-base" />
      <div className="spinner-section" />
    </div>
  );
}

export default Spinner;
