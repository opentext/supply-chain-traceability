import React from "react";
import "./Spinner.scss";

const Spinner = () => {
  return (
    <div className="spinner-container">
      <div className="spinner-border"></div>
      <div className="spinner-base"></div>
      <div className="spinner-section"></div>
    </div>
  );
};

export default Spinner;
