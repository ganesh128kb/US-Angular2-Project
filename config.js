var secrets;

  if (process.env.NODE_ENV !== 'production') {
    secrets = require('./secrets.json');
  }


module.exports = {
  apiRot: '???aws',
  port: '1337',
  DB_NAME: 'consumption',
  AUTH0_DOMAIN: secrets.AUTH0_DOMAIN,
  AUTH0_CLIENT_ID: secrets.AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET: secrets.AUTH0_CLIENT_SECRET,
  GOOGLE_BIGQUERY_API_ID : secrets.GOOGLE_BIGQUERY_API_ID
}