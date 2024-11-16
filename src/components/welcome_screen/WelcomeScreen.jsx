import Grid2 from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import Tile from '../tile/Tile';
import './WelcomeScreen.scss';
import ImageTraceability from '../../assets/tile_traceability.jpg';
import ImageSite from '../../assets/tile_site.jpg';
import ImageTile from '../image_tile/ImageTile';
import InfoIcon from '../info_icon/InfoIcon';
import IconMine from '../../assets/mine.png';
import IconRefinery from '../../assets/refinery.png';
import IconShipping from '../../assets/shipping.png';
import IconCustoms from '../../assets/building4.png';
import IconTransport from '../../assets/lorry.png';
import IconManufacture from '../../assets/building1.png';
import IconDealer from '../../assets/building3.png';
import IconRecycle from '../../assets/recycle.png';
import Shipping from '../../assets/shipping.jpg';

function WelcomeScreen(props) {
  const { name } = props;
  const getGreetingMessage = () => {
    const hours = new Date().getHours();
    let time = '';
    if (hours < 12) {
      time = 'morning';
    } else if (hours < 18) {
      time = 'afternoon';
    } else {
      time = 'evening';
    }
    return `Good ${time}`;
  };

  return (
    <div className="page-area">
      <Grid2 container className="tiles">
        <Grid2 size={{ xs: 12, md: 12 }}>
          <Box className="welcome">
            <div className="welcomeBox">
              <div className="welcomeContent">
                <div className="welcomeMessage">
                  {getGreetingMessage()}
                  ,
                  {name || ''}
                </div>
              </div>
            </div>
          </Box>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 12 }}>
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
        </Grid2>
        <Grid2 size={{ md: 3 }} />
        <Grid2 size={{ md: 3 }}>
          <ImageTile
            title="Supply Chain Traceability"
            image={ImageTraceability}
            link="/upload"
          />
        </Grid2>
        <Grid2 size={{ md: 3 }}>
          <ImageTile
            title="Developer Cloud"
            image={ImageSite}
            externalUrl="https://developer.opentext.com"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, md: 12 }}>
          <div className="imageContainer">
            <img
              src={Shipping}
              alt="transportation"
              className="imageShipping"
            />
          </div>
        </Grid2>
      </Grid2>
    </div>
  );
}

WelcomeScreen.propTypes = {
  name: PropTypes.string,
};
export default WelcomeScreen;
