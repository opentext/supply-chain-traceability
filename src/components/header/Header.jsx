/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState } from 'react';
import { Menu, MenuItem } from '@mui/material';
import { useAuth } from 'react-oidc-context';
import PropTypes from 'prop-types';
import { getLoggedInUserIcon } from '../../utilities/Utils';

function Header(props) {
  const { logout } = props;
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const { user } = useAuth();

  const handleClose = () => {
    setAnchorEl(null);
  };

  const logUserOut = () => {
    logout(true, user.access_token);
    handleClose();
  };

  return (
    <header className="page-header">
      <div className="page-header-home-icon-container">
        <img
          src="./images/home-icon.svg"
          alt="Home"
          className="page-header-home-icon"
          onClick={() => window.open(process.env.REACT_APP_REDIRECT_URI, '_self')}
        />
      </div>
      <div className="page-header-logo-container">
        <div className="logo">
          <div className="header-title">
            <img src="./images/logo.svg" alt="Opentext Invoice management" />
            {' '}
          </div>
        </div>
      </div>

      <div className="page-header-right-icons">
        <div className="header-menu">
          <button
            type="button"
            aria-controls="simple-menu"
            aria-haspopup="true"
            onClick={handleClick}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            <span className="ot-header__icon">
              {getLoggedInUserIcon(user?.profile?.name)}
            </span>
          </button>
          <Menu
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={logUserOut}>Logout</MenuItem>
          </Menu>
        </div>
      </div>
    </header>
  );
}

Header.propTypes = {
  logout: PropTypes.func,
};

export default Header;
