# VirtuAlgo

VirtuAlgo is a stock portflio management system that incorporates options to perform algorithmic trading. (We will add more to this later...).

# Installation

First, clone the branch.

You should be in the VirtuAlgo/ directory.

Run the following command:

```
npm i
```

Then to set up the Postgres Database, first open env_sample.json and replace "USERNAME" with your
postgres username. Also, make sure to replace "PASSWORD" with your corresponding postgres password.
Run the following command afterwards:

```
npm run setup
```

Finally, cd into app/ and run the command:

```
node server.js
```

Developers:
Leo Li,
Kaung Zan,
Vivien Ho,
Alex Ho

**Developers Note - Please create your own branch to add new features Don't push directly to master**
