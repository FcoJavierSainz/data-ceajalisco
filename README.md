# data-ceajalisco

## Dependencies
Node and NPM

## How to run
- install dependencies running `npm i`
- Start the process `npm start`

## Modifications
If you want to change the default configuration please look at the next code.
```js
//start(<WaterBody (river)>, <How many studies starting from latest>, <outputfilename>);
start("Río Santiago", 12, "dataTest.json");
```

Because the server is a open server from government and does not expect
 to be called by automated process like this a rate limit was in place to
  reduce the number of simultaneous calls

```js
const limit = pLimit(2);
```
