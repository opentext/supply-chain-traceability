import React from "react";
import Grid from "@material-ui/core/Grid";
import Tile from "../tile/Tile";
import "./WelcomeScreen.scss";
import ImageTraceability from "../../assets/tile_traceability.jpg";
import ImageSite from "../../assets/tile_site.jpg";
import ImageAuthenticity2 from "../../assets/tile_authenticity2.jpg";
import ImageObservability from "../../assets/tile_observability.jpg";
import ImageTile from "../image_tile/ImageTile";
import Box from "@material-ui/core/Box";
import InfoIcon from "../info_icon/InfoIcon";
import IconMine from "../../assets/mine.png";
import IconRefinery from "../../assets/refinery.png";
import IconShipping from "../../assets/shipping.png";
import IconCustoms from "../../assets/building4.png";
import IconTransport from "../../assets/lorry.png";
import IconManufacture from "../../assets/building1.png";
import IconDealer from "../../assets/building3.png";
import IconRecycle from "../../assets/recycle.png";
import Shipping from "../../assets/shipping.jpg"

function WelcomeScreen(props) {
  const { name } = props;
  const getGreetingMessage = () => {
    const hours = new Date().getHours();
    let time  = '';
    if (hours < 12) {
      time = 'morning';
    } else if(hours  < 18) {
      time = 'afternoon';
    } else {
      time = 'evening';
    }
    return `Good ${time}`;
  };

  return (
    <div className="page-area">
      <Grid container className="tiles">
        <Grid item xs={12} md={12}>
          <Box className="welcome">
            <div className="welcomeBox">
              <div className="welcomeContent">
                <div className="welcomeMessage">
                  {getGreetingMessage()}, {name ? name : ""}
                </div>
              </div>
            </div>
          </Box>
        </Grid>
        <Grid item xs={12} md={12}>
          <Tile title="Supply Chain">
            <InfoIcon title="Materials" icon={IconMine} />
            <InfoIcon title="Refinery" icon={IconRefinery} />
            <InfoIcon title="Shipping" icon={IconShipping} />
            <InfoIcon title="Customs" icon={IconCustoms} />
            <InfoIcon title="Transport" icon={IconTransport} />
            <InfoIcon title="Manufacture" icon={IconManufacture} />
            <InfoIcon title="Sales" icon={IconDealer} />
            <InfoIcon title="Recycling" icon={IconRecycle} />
          </Tile>
        </Grid>
        <Grid item md={3}></Grid>
        <Grid item md={3}>
          <ImageTile
            title="Supply Chain Traceability"
            image={ImageTraceability}
            link="/upload"
          />
        </Grid>
        <Grid item md={3}>
          <ImageTile
            title="Developer Cloud"
            image={ImageSite}
            externalUrl="https://developer.opentext.com"
          />
        </Grid>
        <Grid item xs={12} md={12}>
          <div className="imageContainer">
            <img src={Shipping} alt="transportation" className="imageShipping"/>
          </div>
        </Grid>
      </Grid>
    </div>
  );
}
export default WelcomeScreen;
