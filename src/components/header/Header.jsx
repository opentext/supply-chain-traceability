import React, { useState } from "react";
import { Menu, MenuItem } from "@material-ui/core";
import { getLoggedInUserIcon } from "../../utilities/Utils";
import { useAuth } from "react-oidc-context";

function Header(props) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const { user } = useAuth();

  const handleClose = () => {
    setAnchorEl(null);
  };

  const logUserOut = () => {
    props.logout(true, user.access_token);
    handleClose();
  };

  return (
    <header className="page-header">
      <div className="page-header-home-icon-container">
        <img
          src="./images/home-icon.svg"
          alt="Home"
          className="page-header-home-icon"
          onClick={() =>
            window.open(process.env.REACT_APP_REDIRECT_URI, "_self")
          }
        />
      </div>
      <div className="page-header-logo-container">
        <div className="logo">
          <div className="header-title">
            <img src="./images/logo.svg" alt="Opentext Invoice management" />{" "}
          </div>
        </div>
      </div>

      <div className="page-header-right-icons">
        <div className="header-menu">
          <button
            aria-controls="simple-menu"
            aria-haspopup="true"
            onClick={handleClick}
            style={{
              border: "none",
              backgroundColor: "transparent",
              color: "white",
            }}
          >
            <span className="ot-header__icon">
              {getLoggedInUserIcon(user?.profile?.name)}
            </span>
          </button>
          <Menu
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            getContentAnchorEl={null}
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

export default Header;
