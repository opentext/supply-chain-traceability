import express from 'express';
import ViteExpress from 'vite-express';
import { stringify } from 'qs';
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

// Adding the required middlewares for proxy and file uploads
app.use(
  createProxyMiddleware(url, {
    target: CONTENT_SUBSCRIPTION_BASE_URL,
    changeOrigin: true,
    pathRewrite: rewrite,
    logger: console,
    logLevel: 'debug',
  }),
);
app.use(bodyParser.raw({ type: 'application/pdf', limit: '10mb' }));
app.use(bodyParser.json());

// Wrapper apis for core capture
app.post('/capture/cp-rest/v2/session/files', async (req, res) => {
  try {
    const tokenUrl = `${TOKEN_URL}`;
    const clientId = `${CAPTURE_CID}`;
    const clientSecret = `${CAPTURE_SECRET}`;

    const response = await verifyAndReturnToken(req, res, tokenUrl, clientId, clientSecret);
    if (!(response && response?.token)) {
      // throw new Error('Network response was not ok');
      return res.status(500).json({ message: 'Error getting cap token' });
    }

    const binaryData = req.body; // This is a Buffer

    // calling capture
    const config = {
      method: 'post',
      url: `${APP_BASE_URL}/capture/cp-rest/v2/session/files`,
      headers: {
        Authorization: `Bearer ${response.token}`,
        'Content-Type': req.headers['content-type'],
      },
      data: binaryData,
    };

    const infoResponse = await axios(config);
    return res.json(infoResponse.data);
  } catch (e) {
    console.log(`Error ${e}`);
    return res.status(500).json({ message: 'Error getting capture data' });
  }
});

app.post('/capture/cp-rest/v2/session/services/ConvertImages', async (req, res) => {
  try {
    const tokenUrl = `${TOKEN_URL}`;
    const clientId = `${CAPTURE_CID}`;
    const clientSecret = `${CAPTURE_SECRET}`;

    const response = await verifyAndReturnToken(req, res, tokenUrl, clientId, clientSecret);
    if (!(response && response?.token)) {
      return res.status(500).json({ message: 'Error getting cap token' });
    }

    // calling capture
    const config = {
      method: 'post',
      url: `${APP_BASE_URL}/capture/cp-rest/v2/session/services/ConvertImages`,
      headers: {
        Authorization: `Bearer ${response.token}`,
        'Content-Type': req.headers['content-type'],
      },
      data: req.body,
    };

    const infoResponse = await axios(config);
    return res.json(infoResponse.data);
  } catch (e) {
    return res.status(500).json({ message: 'Error getting capture data' });
  }
});

app.post('/capture/cp-rest/v2/session/services/classifyextractdocument', async (req, res) => {
  try {
    const tokenUrl = `${TOKEN_URL}`;
    const clientId = `${CAPTURE_CID}`;
    const clientSecret = `${CAPTURE_SECRET}`;

    const response = await verifyAndReturnToken(req, res, tokenUrl, clientId, clientSecret);
    if (!(response && response?.token)) {
      return res.status(500).json({ message: 'Error getting cap token' });
    }

    // calling capture
    const config = {
      method: 'post',
      url: `${APP_BASE_URL}/capture/cp-rest/v2/session/services/classifyextractdocument?suppress_response_codes=suppress_response_codes`,
      headers: {
        Authorization: `Bearer ${response.token}`,
        'Content-Type': req.headers['content-type'],
      },
      data: req.body,
    };

    const infoResponse = await axios(config);
    return res.json(infoResponse.data);
  } catch (e) {
    return res.status(500).json({ message: 'Error getting capture data' });
  }
});

app.post('/capture/cp-rest/v2/session/services/fullpageocr', async (req, res) => {
  try {
    const tokenUrl = `${TOKEN_URL}`;
    const clientId = `${CAPTURE_CID}`;
    const clientSecret = `${CAPTURE_SECRET}`;

    const response = await verifyAndReturnToken(req, res, tokenUrl, clientId, clientSecret);
    if (!(response && response?.token)) {
      return res.status(500).json({ message: 'Error getting cap token' });
    }

    // calling capture
    const config = {
      method: 'post',
      url: `${APP_BASE_URL}/capture/cp-rest/v2/session/services/fullpageocr`,
      headers: {
        Authorization: `Bearer ${response.token}`,
        'Content-Type': req.headers['content-type'],
      },
      data: req.body,
    };

    const infoResponse = await axios(config);
    return res.json(infoResponse.data);
  } catch (e) {
    return res.status(500).json({ message: 'Error getting Infointel' });
  }
});

app.get('/capture/cp-rest/session/files/:fileId', async (req, res) => {
  try {
    const tokenUrl = `${TOKEN_URL}`;
    const clientId = `${CAPTURE_CID}`;
    const clientSecret = `${CAPTURE_SECRET}`;

    const response = await verifyAndReturnToken(req, res, tokenUrl, clientId, clientSecret);
    if (!(response && response?.token)) {
      return res.status(500).json({ message: 'Error getting cap token' });
    }

    // calling capture
    const config = {
      method: 'get',
      url: `${APP_BASE_URL}/capture/cp-rest/session/files/${req.params.fileId}`,
      headers: {
        Authorization: `Bearer ${response.token}`,
        'Content-Type': req.headers['content-type'],
      },
    };

    const infoResponse = await axios(config);
    return res.json(infoResponse.data);
  } catch (e) {
    return res.status(500).json({ message: 'Error getting Infointel' });
  }
});

// Wrapper apis for content
app.get('/getContentToken', async (req, res) => {
  try {
    const tokenUrl = `${OTDS_URL}`;
    const clientId = `${CONTENT_CID}`;
    const clientSecret = `${CONTENT_SECRET}`;
    const scope = `otds:groups readwrite view_publications create_publications delete_publications subscription:${CONTENT_SUBSCRIPTION_NAME}`;
    const clientData = `subName=${CONTENT_SUBSCRIPTION_NAME}`;
    const response = await verifyAndReturnToken(
      req,
      res,
      tokenUrl,
      clientId,
      clientSecret,
      scope,
      clientData,
    );

    return res.json({ token: response.token });
  } catch (e) {
    return res.status(500).json({ message: 'Error fetching content token' });
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

// handle token failure and verification
async function validateToken(req, res) {
  try {
    const tkn = req.headers.authorization.replace(/Bearer /g, '');
    await verifyToken(tkn);
  } catch (e) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
}

// verify and return token
async function verifyAndReturnToken(req, res, tokenUrl, clientId, clientSecret, scope, clientData) {
  await validateToken(req, res);

  const reqObj = {
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials',
  };

  if (scope) {
    reqObj.scope = scope;
  }

  if (clientData) {
    reqObj.client_data = clientData;
  }

  const data = stringify(reqObj);
  const config = {
    method: 'post',
    url: tokenUrl,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data,
  };

  try {
    const response = await axios(config);

    if (response.status !== 200) {
      throw new Error(`Network response was not ok ${response.status}`);
    }

    return { token: response.data.access_token };
  } catch (e) {
    console.log(`Error ${e}`);
    throw new Error('Error fetching token');
  }
}

// Starting the express server for handling any incoming requests
ViteExpress.listen(app, process.env.PORT, () => console.log(`Server is listening on port ${process.env.PORT} ...`));
