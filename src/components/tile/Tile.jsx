/* eslint-disable react/prop-types */
import Box from '@mui/material/Box';
import './Tile.scss';

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
