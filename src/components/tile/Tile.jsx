import Box from "@mui/material/Box";
import React from "react";
import "./Tile.scss";

function Tile({ children }) {
  return (
    <Box className="tile">
      <div className="tileBox">
        <div className="tileContent">{children}</div>
      </div>
    </Box>
  );
}

export default Tile;
