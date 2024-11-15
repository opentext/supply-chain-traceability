const express = require("express");
const ViteExpress = require("vite-express");
const qs = require("qs");
const axios = require("axios");
const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config();

const CAPTURE_CID = process.env.REACT_APP_CAPTURE_CLIENT_ID;
const CAPTURE_SECRET = process.env.REACT_APP_CAPTURE_CLIENT_SECRET;
const CONTENT_CID = process.env.REACT_APP_CCM_SUBSCRIPTION_CID;
const CONTENT_SECRET = process.env.REACT_APP_CCM_SUBSCRIPTION_SECRET;
const CONTENT_SUBSCRIPTION_NAME = process.env.REACT_APP_CCM_SUBSCRIPTION_NAME;
const TENANT_ID = process.env.REACT_APP_TENANT_ID;
const TOKEN_URL =
  process.env.REACT_APP_BASE_URL + "/tenants/" + TENANT_ID + "/oauth2/token";
const OTDS_URL = `${process.env.REACT_APP_OTDS_URL}/${TENANT_ID}/oauth2/token`;
const CONTENT_SUBSCRIPTION_BASE_URL =
  process.env.REACT_APP_CCM_SUBSCRIPTION_BASE_URL;

const app = express();

const url = "/".concat("ccm");
const rewrite = {};
rewrite[url] = "";
app.use(
  createProxyMiddleware(url, {
    target: CONTENT_SUBSCRIPTION_BASE_URL,
    changeOrigin: true,
    pathRewrite: rewrite,
    logger: console,
    logLevel: "debug",
  })
);

app.get("/getCapToken", async (req, res) => {

  var data = qs.stringify({
    client_id: `${CAPTURE_CID}`,
    client_secret: `${CAPTURE_SECRET}`,
    grant_type: "client_credentials",
  });

  var config = {
    method: "post",
    url: TOKEN_URL,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: data,
  };
  try {
    let response = await axios(config);

    if (response.status != 200) {
      throw new Error("Network response was not ok");
    }

    return res.json({ token: response.data.access_token });
  } catch (e) {
    console.log("Error " + e);
  }
});

app.get("/getContentToken", async (req, res) => {
  var data = qs.stringify({
    client_id: `${CONTENT_CID}`,
    client_secret: `${CONTENT_SECRET}`,
    grant_type: "client_credentials",
    scope: `otds:groups readwrite view_publications create_publications delete_publications subscription:${CONTENT_SUBSCRIPTION_NAME}`,
    client_data: `subName=${CONTENT_SUBSCRIPTION_NAME}`,
  });
  var config = {
    method: "post",
    url: `${OTDS_URL}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: data,
  };
  try {
    let response = await axios(config);

    if (response.status !== 200) {
      throw new Error("Network response was not ok");
    }

    return res.json({ token: response.data.access_token });
  } catch (e) {
    console.log("Error " + e);
  }
});

ViteExpress.listen(app, 4000, () => console.log("Server is listening..."));
