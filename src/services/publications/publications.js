import axios from 'axios';

export default class Publications {
  url = `${process.env.REACT_APP_BASE_URL}/cms/instances/file`;

  cssUrl = `${process.env.REACT_APP_BASE_URL}/css/v3/files`;

  publicationUrl = `${process.env.REACT_APP_BASE_URL}/publication/api/v1/publications`;

  constructor(props) {
    this.props = props;
  }

  getPublicationRequestBody(id, mimeType, name) {
    return {
      target: 'css-v3://upload?authzPolicy=delegateToSource',
      publicationVersion: '1.x',
      policy: {
        namespace: 'opentext.publishing.brava',
        name: 'SimpleBravaView',
        version: '1.x',
      },
      tags: [
        {
          appName: 'innovate-ev',
        },
      ],
      featureSettings: [
        {
          feature: {
            namespace: 'opentext.publishing.sources',
            name: 'LoadSources',
          },
          path: '/documents',
          value: [
            {
              url: `${this.cssUrl}/${id}/stream`,
              formatHint: `${mimeType}`,
              filenameHint: `${name}`,
            },
          ],
        },
        {
          feature: {
            namespace: 'opentext.publications.execution',
            name: 'DeleteAfterCompletion',
            version: '1.x',
          },
          path: '/timeInMilliseconds',
          value: 43200000,
        },
        {
          feature: {
            namespace: 'opentext.publishing.execution',
            name: 'SetPublishingTarget',
            version: '1.x',
          },
          path: '/publishingTarget',
          value: 'css-v3://upload?authzPolicy=delegateToSource',
        },
      ],
    };
  }

  async getPublicationDataById(id) {
    const res = await axios({
      method: 'get',
      url: `${this.publicationUrl}/${id}`,
      headers: {
        Authorization: `Bearer ${this.props.access_token}`,
      },
    });
    return res.data;
  }

  waitForPublicationComplete(id, fileId, fileCategory, callback) {
    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        const pubdata = await this.getPublicationDataById(id);
        if (pubdata && pubdata.status === 'Complete') {
          clearInterval(interval);
          resolve(id);
        } else if (pubdata && pubdata.status === 'Failed') {
          clearInterval(interval);
          this.getPublicationData(fileId, fileCategory, callback);
          resolve(id);
        }
      }, 1000); // Check every 1000ms
    });
  }

  async getPublicationData(fileId, fileCategory, callback) {
    let publicationData = '';
    publicationData = await fetch(
      `${this.url}/${fileCategory}/${fileId}/contents`,
      {
        method: 'get',
        headers: {
          Authorization: `Bearer ${this.props.access_token}`,
        },
      },
    )
      .then(async (result) => {
        let blobId = '';
        let mimeType = '';
        let name = '';
        result.data = await result.json();
        const fileMetadata = result.data;
        if (
          result
          && result.data
          && result.data._embedded
          && result.data._embedded.collection
        ) {
          const fileContents = result.data._embedded.collection;
          fileContents.forEach((content) => {
            blobId = content.blob_id;
            mimeType = content.mime_type;
            name = content.name;
          });
        }
        if (blobId) {
          const body = this.getPublicationRequestBody(blobId, mimeType, name);
          publicationData = await axios({
            method: 'post',
            url: this.publicationUrl,
            headers: {
              Authorization: `Bearer ${this.props.access_token}`,
            },
            data: body,
          })
            .then((publicaitonResult) => {
              this.waitForPublicationComplete(
                publicaitonResult.data.id,
                fileId,
                fileCategory,
                callback,
              );
              callback(publicaitonResult.data, fileId, fileMetadata);
              return publicaitonResult.data;
            })
            .catch((error) => {
              console.log(JSON.stringify(error));
            });
        }
        return publicationData;
      })
      .catch((error) => {
        console.log(JSON.stringify(error));
      });
    return publicationData;
  }
}
