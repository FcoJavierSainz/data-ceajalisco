# data-ceajalisco

## Dependencies
Node and NPM

## How to run
- install dependencies running `npm i`
- Start the process `npm start`

## Modifications
If you want to change the default configuration please look at to the next code.
```js
//start(<WaterBody (river)>, <How many studies starting from latest>, <outputfilename>);
start("Río Santiago", 12, "dataTest.json");
```

Because the service is provided by a open server from government, and does not expect to be called by automated process like this, there is rate limit in place to control the number of simultaneous calls.

```js
const limit = pLimit(2);
```

The process generate a json file, if you need a csv file I recommend to use a tool like this https://www.npmjs.com/package/json2csv

```bash
json2csv -i data.json -o data.csv
```
