# standard-eject

Ever wish [`standard`](https://github.com/standard/standard) provided a way to "eject" à la [create-react-app](https://github.com/facebookincubator/create-react-app/tree/10c1f577da211d65bcc278f94198ef75f00f0277#converting-to-a-custom-setup), to allow customization?

`standard-eject` does this for you, replacing `standard` with `eslint` and `eslint-config-standard`.
You can then edit the `.eslintrc` file to your liking.

It's not yet smart enough to update your package.json scripts, so you'll want to do that yourself.
Just use `eslint .` where you previously had `standard`.

## Installation

```bash
yarn global add standard-eject
# or
npm install --global standard-eject
```

## Usage

```bash
# In the directory containing package.json:
standard-eject
```
