# standard-eject
[![Build Status](https://travis-ci.org/josephfrazier/standard-eject.svg?branch=master)](https://travis-ci.org/josephfrazier/standard-eject)

Ever wish [`standard`](https://github.com/standard/standard) provided a way to "eject" à la [create-react-app](https://github.com/facebookincubator/create-react-app/tree/10c1f577da211d65bcc278f94198ef75f00f0277#converting-to-a-custom-setup), to allow customization?

`standard-eject` does this for you, replacing `standard` with [`standardx`].
You can then edit the `.eslintrc` file to your liking.

[`standardx`]: https://github.com/standard/standardx

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

If you don't want to install `standardx` into the project (and uninstall `standard`),
pass `--no-install` as the first argument:

```bash
standard-eject --no-install
```
