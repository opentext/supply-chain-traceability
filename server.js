import express from 'express';
import ViteExpress from 'vite-express';
import QueryString, { stringify } from 'qs';
import axios from 'axios';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

import jsonwebtoken from 'jsonwebtoken';
import bodyParser from 'body-parser';
import JwksRsa from 'jwks-rsa';

dotenv.config();

const CAPTURE_CID = process.env.REACT_APP_CAPTURE_CLIENT_ID;
const CAPTURE_SECRET = process.env.REACT_APP_CAPTURE_CLIENT_SECRET;
const CONTENT_CID = process.env.REACT_APP_CCM_SUBSCRIPTION_CID;
const CONTENT_SECRET = process.env.REACT_APP_CCM_SUBSCRIPTION_SECRET;
const CONTENT_SUBSCRIPTION_NAME = process.env.REACT_APP_CCM_SUBSCRIPTION_NAME;
const TENANT_ID = process.env.REACT_APP_TENANT_ID;
const TOKEN_URL = `${process.env.REACT_APP_BASE_URL}/tenants/${TENANT_ID}/oauth2/token`;
const OTDS_URL = `${process.env.REACT_APP_OTDS_URL}/${TENANT_ID}/oauth2/token`;

const CONTENT_SUBSCRIPTION_BASE_URL = process.env.REACT_APP_CCM_SUBSCRIPTION_BASE_URL;
const APP_BASE_URL = process.env.REACT_APP_BASE_URL;
const app = express();

const url = '/'.concat('ccm');
const rewrite = {};
rewrite[url] = '';
app.use(
  createProxyMiddleware(url, {
    target: CONTENT_SUBSCRIPTION_BASE_URL,
    changeOrigin: true,
    pathRewrite: rewrite,
    logger: console,
    logLevel: 'debug',
  }),
);


app.get('/getContentToken', async (req, res) => {
  const tkn = req.headers.authorization.replace(/Bearer /g, '');
  try {
    await verifyToken(tkn);
  } catch (e) {
    console.log('invalid token');
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }

  const data = stringify({
    client_id: `${CONTENT_CID}`,
    client_secret: `${CONTENT_SECRET}`,
    grant_type: 'client_credentials',
    scope: `otds:groups readwrite view_publications create_publications delete_publications subscription:${CONTENT_SUBSCRIPTION_NAME}`,
    client_data: `subName=${CONTENT_SUBSCRIPTION_NAME}`,
  });
  const config = {
    method: 'post',
    url: `${OTDS_URL}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data,
  };
  try {
    const response = await axios(config);

    if (response.status !== 200) {
      throw new Error('Network response was not ok');
    }

    return res.json({ token: response.data.access_token });
  } catch (e) {
    console.log(`Error ${e}`);
  }
});

app.use(bodyParser.raw({ type: 'application/pdf', limit: '10mb' }));

app.use(bodyParser.raw({ type: 'application/pdf', limit: '10mb' }));
app.post('/capture/cp-rest/v2/session/files', async (req, res) => {
  const tkn = req.headers.authorization.replace(/Bearer /g, '');

  try {
    await verifyToken(tkn);
  } catch (e) {
    console.log('invalid token');
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }

  // get capture token

  const data = QueryString.stringify({
    client_id: `${CAPTURE_CID}`,
    client_secret: `${CAPTURE_SECRET}`,
    grant_type: 'client_credentials',
  });

  let config = {
    method: 'post',
    url: TOKEN_URL,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data,
  };
  try {
    const response = await axios(config);
    if (response.status !== 200) {
      // throw new Error('Network response was not ok');
      return res.status(500).json({ message: 'Error getting cap token' });
    }

    const binaryData = req.body; // This is a Buffer

    // calling capture
    config = {
      method: 'post',
      url: `${APP_BASE_URL}/capture/cp-rest/v2/session/files`,
      headers: {
        Authorization: `Bearer ${response.data.access_token}`,
        'Content-Type': req.headers['content-type'],
      },
      data: binaryData,
    };
    const infoResponse = await axios(config);

    return res.json(infoResponse.data);
    // return res.json({"token": response.data.access_token});
  } catch (e) {
    console.log(`Error ${e}`);
    return res.status(500).json({ message: 'Error getting Infointel' });
  }
});

app.use(bodyParser.json());
app.post('/capture/cp-rest/v2/session/services/ConvertImages', async (req, res) => {
  const tkn = req.headers.authorization.replace(/Bearer /g, '');
  try {
    await verifyToken(tkn);
  } catch (e) {
    console.log('invalid token');
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }

  // get capture token

  const data = QueryString.stringify({
    client_id: `${CAPTURE_CID}`,
    client_secret: `${CAPTURE_SECRET}`,
    grant_type: 'client_credentials',
  });
  let config = {
    method: 'post',
    url: TOKEN_URL,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data,
  };
  try {
    const response = await axios(config);
    if (response.status !== 200) {
      // throw new Error('Network response was not ok');
      return res.status(500).json({ message: 'Error getting cap token' });
    }

    // calling capture
    config = {
      method: 'post',
      url: `${APP_BASE_URL}/capture/cp-rest/v2/session/services/ConvertImages`,
      headers: {
        Authorization: `Bearer ${response.data.access_token}`,
        'Content-Type': req.headers['content-type'],
      },
      data: req.body,
    };
    const infoResponse = await axios(config);

    return res.json(infoResponse.data);
    // return res.json({"token": response.data.access_token});
  } catch (e) {
    console.log(`Error ${e}`);
    return res.status(500).json({ message: 'Error getting Infointel' });
  }
});
app.post('/capture/cp-rest/v2/session/services/classifyextractdocument', async (req, res) => {
  const tkn = req.headers.authorization.replace(/Bearer /g, '');
  try {
    await verifyToken(tkn);
  } catch (e) {
    console.log('invalid token');
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }

  // get capture token

  const data = QueryString.stringify({
    client_id: `${CAPTURE_CID}`,
    client_secret: `${CAPTURE_SECRET}`,
    grant_type: 'client_credentials',
  });
  let config = {
    method: 'post',
    url: TOKEN_URL,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data,
  };
  try {
    const response = await axios(config);
    if (response.status !== 200) {
      // throw new Error('Network response was not ok');
      return res.status(500).json({ message: 'Error getting cap token' });
    }

    // calling capture
    config = {
      method: 'post',
      url: `${APP_BASE_URL}/capture/cp-rest/v2/session/services/classifyextractdocument?suppress_response_codes=suppress_response_codes`,
      headers: {
        Authorization: `Bearer ${response.data.access_token}`,
        'Content-Type': req.headers['content-type'],
      },
      data: req.body,
    };

    const infoResponse = await axios(config);

    return res.json(infoResponse.data);
    // return res.json({"token": response.data.access_token});
  } catch (e) {
    console.log(`Error ${e}`);
    return res.status(500).json({ message: 'Error getting Infointel' });
  }
});
app.post('/capture/cp-rest/v2/session/services/fullpageocr', async (req, res) => {
  const tkn = req.headers.authorization.replace(/Bearer /g, '');
  try {
    await verifyToken(tkn);
  } catch (e) {
    console.log('invalid token');
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }

  // get capture token

  const data = QueryString.stringify({
    client_id: `${CAPTURE_CID}`,
    client_secret: `${CAPTURE_SECRET}`,
    grant_type: 'client_credentials',
  });
  let config = {
    method: 'post',
    url: TOKEN_URL,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data,
  };
  try {
    const response = await axios(config);
    if (response.status !== 200) {
      // throw new Error('Network response was not ok');
      return res.status(500).json({ message: 'Error getting cap token' });
    }

    // calling capture
    config = {
      method: 'post',
      url: `${APP_BASE_URL}/capture/cp-rest/v2/session/services/fullpageocr`,
      headers: {
        Authorization: `Bearer ${response.data.access_token}`,
        'Content-Type': req.headers['content-type'],
      },
      data: req.body,
    };
    const infoResponse = await axios(config);

    return res.json(infoResponse.data);
    // return res.json({"token": response.data.access_token});
  } catch (e) {
    console.log(`Error ${e}`);
    return res.status(500).json({ message: 'Error getting Infointel' });
  }
});
app.get('/capture/cp-rest/session/files/:fileId', async (req, res) => {
  const tkn = req.headers.authorization.replace(/Bearer /g, '');
  try {
    await verifyToken(tkn);
  } catch (e) {
    console.log('invalid token');
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }

  // get capture token

  const data = QueryString.stringify({
    client_id: `${CAPTURE_CID}`,
    client_secret: `${CAPTURE_SECRET}`,
    grant_type: 'client_credentials',
  });
  let config = {
    method: 'post',
    url: TOKEN_URL,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data,
  };
  try {
    const response = await axios(config);
    if (response.status !== 200) {
      // throw new Error('Network response was not ok');
      return res.status(500).json({ message: 'Error getting cap token' });
    }

    // calling capture
    config = {
      method: 'get',
      url: `${APP_BASE_URL}/capture/cp-rest/session/files/${req.params.fileId}`,
      headers: {
        Authorization: `Bearer ${response.data.access_token}`,
        'Content-Type': req.headers['content-type'],
      },
    };
    const infoResponse = await axios(config);

    return res.json(infoResponse.data);
    // return res.json({"token": response.data.access_token});
  } catch (e) {
    console.log(`Error ${e}`);
    return res.status(500).json({ message: 'Error getting Infointel' });
  }
});

// Create a JWKS client

const client = JwksRsa({
  jwksUri: `${APP_BASE_URL}/oauth2/jwks`, // Replace with your JWKS URL
});

// Function to get the signing key
function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

// Middleware to verify the token
function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jsonwebtoken.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    });
  });
}

ViteExpress.listen(app, 4000, () => console.log('Server is listening...'));
