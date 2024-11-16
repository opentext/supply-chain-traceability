
## Pre-requisites

- Make sure your Organization has active plans for Thrust bundle, Information Intelligence and Core Content API Developer plan. If you do not have these plans associated on your Organization, please reach out to Opentext for assistance. 

## Extension App for Core Content

- We need an active Core Content extension app subscription in the given Organization and Tenant. This subscription will be used for OAuth client access to work with Core Content, Content Metadata Service, Content Storage Service and  related APIs. Please note the public OAuth client for this app, which will also be used for login to the sample app. Make sure all the required application users are added to this extension app, to be able to login to the app and work with different APIs. To be able to work with Content Aviator in the Business Workspace, the corresponding user needs to be added as a Subscription Admin.

## Import Document Types and Business Workspaces
- As a Core Content subscription Admin, import all the required document type and business workspace definitions into the corresponding subscription from [resources](https://github.com/opentext/supply-chain-traceability/blob/main/resources/core_content)

- Please note,  Document Types can also be created using Opentext Thrust Studio. Please refer to https://developer.opentext.com/cloud-platform/products/developer-tools for more details. 

## Business Workspace Integration Widget
- For setting up trusted site and service account configurations for the Business Workspace integration widget, please follow the steps mentioned at https://developer.opentext.com/saasapps/products/core-content/documentation/integration-widget-guide/4 

## Folder creation 
- Create two folders in the Core Content subscription under the Enterprise folder.
	- **uploaded documents**
	- **reports**
- Make sure you have the node ids for these folders handy to be updated in the env file as required.   

## Public Service Client Redirect URL
- In the Admin Center (organization link available under the Console tab when logged in to developer.opentext.com), navigate to ***/[Organization Name]/Apps/[Extension App Name]/Clients*** and add http://127.0.0.1:4000  as redirect URL for the public service client.

## Standalone Apps
- We need an active standalone app in the given Organization and Tenant for Thrust bundle. This subscription will be used for OAuth client access to work with Core Capture, Information Intelligence and Developer Cloud APIs. Please note the confidential client id and confidential client secret which will be used to access the aforementioned APIs. Make sure all the required application users are added to the standalone apps, to be able to login to the app and work with different APIs. 

## Running the application
- Download and install Node.js **v22.11.0**, with npm, from https://nodejs.org/en/download

- To run the application using Node.js follow these steps.

	- Clone the application from this git url 
	- Run "npm install"
	- Make sure all the variables in the .env file are replaced properly as per the above steps.
	- Run "npm run start"
	- App will now run on 127.0.0.1:4000, launch the app to see different Thrust APIs and integrations in action! 

## Community 
- Please feel free to make suggestions or report issues in the [developer community](https://forums.opentext.com/forums/developer/categories/im-dev-tools).