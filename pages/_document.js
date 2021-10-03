import { Partytown, GoogleTagManager, GoogleTagManagerNoScript } from '@builder.io/partytown/react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { GTM_ID } from '../lib/gtm'
console.log(GTM_ID)
export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <GoogleTagManager containerId={GTM_ID} />
          <Partytown debug={true} />
        </Head>
        <body>
          <GoogleTagManagerNoScript containerId={GTM_ID} />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
