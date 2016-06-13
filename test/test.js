'use strict';

const chai = require('chai');
const expect = chai.expect;

const avp = require('../index');

describe('avp', () => {
  describe('toObject', () => {
    describe('with a flat array of AVPs', () => {
      it('should return an object with camelcase property names', () => {
        const obj = avp.toObject([
          [ 'Auth-Application-Id', 1 ],
          [ 'CC-Request-Type', 'a' ]
        ]);

        expect(obj).to.deep.equal({
          authApplicationId: 1,
          ccRequestType: 'a'
        });
      });
    });

    describe('with a nested array of AVPs', () => {
      it('should return a nested object', () => {
        const obj = avp.toObject([
          [ 'Multiple-Services-Credit-Control', [
            [ 'Used-Service-Unit', [
              [ 'CC-Total-Octets', 1000 ]
            ]],
            [ 'Requested-Service-Unit', [
              [ 'CC-Total-Octets', 2000 ]
            ]]
          ]]
        ]);

        expect(obj).to.deep.equal({
          multipleServicesCreditControl: {
            usedServiceUnit: {
              ccTotalOctets: 1000
            },
            requestedServiceUnit: {
              ccTotalOctets: 2000
            }
          }
        });
      });
    });

    describe('with an array AVPs with repeated names', () => {
      it('should group up same-named AVPs into an array', () => {
        const obj = avp.toObject([
          [ 'Subscription-Id', [
            [ 'Subscription-Id-Type', 'END_USER_IMSI' ],
            [ 'Subscription-Id-Data', '1234' ]
          ]],
          [ 'Subscription-Id', [
            [ 'Subscription-Id-Type', 'END_USER_E164' ],
            [ 'Subscription-Id-Data', '4321' ]
          ]],
        ]);

        expect(obj).to.deep.equal({
          subscriptionId: [{
            subscriptionIdType: 'END_USER_IMSI',
            subscriptionIdData: '1234'
          }, {
            subscriptionIdType: 'END_USER_E164',
            subscriptionIdData: '4321'
          }]
        });
      });
    });
  });

  describe('fromObject', () => {
    describe('with a flat object', () => {
      it('should return a flat array of AVPs with decamelized property names', () => {
        const list = avp.fromObject({
          authApplicationId: 1,
          ccRequestType: 'a'
        });

        expect(list).to.deep.equal([
          [ 'Auth-Application-Id', 1 ],
          [ 'CC-Request-Type', 'a' ]
        ]);
      });
    });

    describe('with a nested object', () => {
      it('should return a nested array of AVPs', () => {
        const list = avp.fromObject({
          multipleServicesCreditControl: {
            usedServiceUnit: {
              ccTotalOctets: 1000
            },
            requestedServiceUnit: {
              ccTotalOctets: 2000
            }
          }
        });

        expect(list).to.deep.equal([
          [ 'Multiple-Services-Credit-Control', [
            [ 'Used-Service-Unit', [
              [ 'CC-Total-Octets', 1000 ]
            ]],
            [ 'Requested-Service-Unit', [
              [ 'CC-Total-Octets', 2000 ]
            ]]
          ]]
        ]);
      });
    });

    describe('with a value that is an array', () => {
      it('should expand the array intp same-named AVPs', () => {
        const list = avp.fromObject({
          subscriptionId: [{
            subscriptionIdType: 'END_USER_IMSI',
            subscriptionIdData: '1234'
          }, {
            subscriptionIdType: 'END_USER_E164',
            subscriptionIdData: '4321'
          }]
        });

        expect(list).to.deep.equal([
          [ 'Subscription-Id', [
            [ 'Subscription-Id-Type', 'END_USER_IMSI' ],
            [ 'Subscription-Id-Data', '1234' ]
          ]],
          [ 'Subscription-Id', [
            [ 'Subscription-Id-Type', 'END_USER_E164' ],
            [ 'Subscription-Id-Data', '4321' ]
          ]],
        ]);
      });
    });
  });
});
