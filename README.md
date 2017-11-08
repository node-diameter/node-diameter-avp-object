[![Travis CI](https://img.shields.io/travis/node-diameter/node-diameter-avp-object.svg)](https://travis-ci.org/node-diameter/node-diameter-avp-object)
[![Coverage Status](https://img.shields.io/coveralls/node-diameter/node-diameter-avp-object.svg)](https://coveralls.io/github/node-diameter/node-diameter-avp-object?branch=master)
[![NPM Package](https://img.shields.io/npm/v/diameter-avp-object.svg)](https://www.npmjs.com/package/diameter-avp-object)

# node-diameter-avp-object

Syntactical sugar for manipulating [node-diameter](https://github.com/node-diameter/node-diameter) AVP arrays.

node-diameter's `diameterMessage` event returns a nested array of AVPs in the `event.message.body` property.

Accessing AVPs in this form may look syntactically crowded. This library converts AVP arrays into nested objects that are more syntactically friendly. AVPs are converted into camelCase properties. Multiple occurrences of the same AVP are rolled into an array.

It also converts such objects back to the nested array form for Diameter answers.

For example, the following AVP array:

```
[
  [ 'Subscription-Id', [
    [ 'Subscription-Id-Type', 'END_USER_IMSI' ],
    [ 'Subscription-Id-Data', '1234' ]
  ]],
  [ 'Subscription-Id', [
    [ 'Subscription-Id-Type', 'END_USER_E164' ],
    [ 'Subscription-Id-Data', '4321' ]
  ]],
  [ 'Multiple-Services-Credit-Control', [
    [ 'Used-Service-Unit', [
      [ 'CC-Total-Octets', 1000 ]
    ]],
    [ 'Requested-Service-Unit', [
      [ 'CC-Total-Octets', 2000 ]
    ]]
  ]]
]
```

Gets converted to:

```
{
  subscriptionId: [{
    subscriptionIdType: 'END_USER_IMSI',
    subscriptionIdData: '1234'
  }, {
    subscriptionIdType: 'END_USER_E164',
    subscriptionIdData: '4321'
  }],
  multipleServicesCreditControl: {
    usedServiceUnit: {
      ccTotalOctets: 1000
    },
    requestedServiceUnit: {
      ccTotalOctets: 2000
    }
  }
}
```

## Usage

```
npm install --save diameter-avp-object
```

Then:

```
const avp = require('diameter-avp-object');

// A structure returned by node-diameter
const avpList = [
  [ 'Subscription-Id', [
    [ 'Subscription-Id-Type', 'END_USER_IMSI' ],
    [ 'Subscription-Id-Data', '1234' ]
  ]],
  [ 'Subscription-Id', [
    [ 'Subscription-Id-Type', 'END_USER_E164' ],
    [ 'Subscription-Id-Data', '4321' ]
  ]],
  [ 'Multiple-Services-Credit-Control', [
    [ 'Used-Service-Unit', [
      [ 'CC-Total-Octets', 1000 ]
    ]],
    [ 'Requested-Service-Unit', [
      [ 'CC-Total-Octets', 2000 ]
    ]]
  ]]
];

// Get consolidated object
const avpObj = avp.toObject(avpList);

// Multiple occurences of the same AVP are rolled into an array
const imsi = avpObj.subscriptionId
  .find(sId => sId.subscriptionIdType === 'END_USER_IMSI')
  .subscriptionIdData;

// Single instances are not
const cc = avpObj.multipleServicesCreditControl;

if (cc.ccRequestType === 'UPDATE_REQUEST') {
  const grantedUnits = handleUpdateRequest(
    imsi,
    cc.serviceIdentifier,
    cc.usedServiceUnit.ccTotalOctets,
    cc.requestedServiceUnit.ccTotalOctets
  );

  const avpList = avp.fromObject({
    ccRequestType: cc.ccRequestType,
    ccRequestNumber: avpObj.ccRequestNumber,
    multipleServicesCreditControl: {
      serviceIdentifier: cc.serviceIdentifier,
      ratingGroup: cc.serviceIdentifier,
      resultCode: 'DIAMETER_SUCCESS',
      grantedServiceUnit: {
        ccTotalOctets: grantedUnits
      }
    }
  });

  // Use avpList in the Diameter answer
  // ...
}
```

## Testing

Run tests:

```
npm test
```

For coverage:

```
npm run coverage
```
