# @web3-react/unipass

## Installation

```shell
  npm install @@unipasswallet/web3-react
```
or
```shell
  yarn add @@unipasswallet/web3-react
```

## Parameters

* `options.connect.chainId` -- Default chainId.

* `options.connect.returnEmail` -- If true, email will return when connect function been called.

* `options.connect.appSettings` -- Config appName, appIcon and theme.

## Usage

```js
import { UniPassTheme } from "@unipasswallet/popup-types";
import { initializeConnector } from "@web3-react/core";
import { UniPass } from "@unipasswallet/web3-react";

export const [uniPassWallet, hooks] = initializeConnector<UniPass>(
  (actions) =>
    new UniPass({
      actions,
      options: {
        chainId: 5,
        returnEmail: true,
        appSettings: {
          appName: "web3-react test for unipass",
          appIcon: "your icon url",
          theme: UniPassTheme.DARK,
        },
      },
    })
);
```
```js
import { hooks, uniPassWallet } from "./connector";

const { useProvider, useAccount } = hooks;

const provider = useProvider();
const account = useAccount();

const connect = () => {
return uniPassWallet.activate().catch((e) => {
    console.error(e);
});
};
```

## Example

A demo app for web3-react is available [here](https://up-web3-react-demo.vercel.app/)