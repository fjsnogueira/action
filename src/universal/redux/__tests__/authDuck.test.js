import raven from 'raven-js';
import {applyMiddleware, combineReducers, createStore} from 'redux';
import thunk from 'redux-thunk';
import auth, {setAuthToken, removeAuthToken, setNextUrl, unsetNextUrl} from '../authDuck';
import {testToken, testTokenData} from './testTokens';
import * as segmentActions from '../segmentActions';

raven.setUserContext = jest.fn();
segmentActions.selectSegmentTraits = jest.fn(() => ({email: 'a@a.co'}));
segmentActions.segmentEventIdentify = jest.fn(() => ({ type: '@@segment/EVENT' }));
segmentActions.segmentEventReset = jest.fn(() => ({ type: '@@segment/EVENT' }));
let appReducer;
let store;
let initialState;

beforeEach(() => {
  appReducer = combineReducers({auth});
  store = createStore(appReducer, {}, applyMiddleware(thunk));
  initialState = store.getState();
});


test('initial state', () => {
  expect(initialState).toMatchSnapshot();
});

test('can setAuthToken w/token decode', () => {
  global.__PRODUCTION__ = true;
  store.dispatch(setAuthToken(testToken));
  expect(raven.setUserContext).toBeCalledWith({id: testTokenData.sub, email: 'a@a.co'});
  expect(segmentActions.segmentEventIdentify).toBeCalled();
  expect(store.getState()).toMatchSnapshot();
});

test('throws when token undefined', () => {
  expect(() =>
    store.dispatch(setAuthToken(undefined))
  ).toThrow();
});

test('throws when token invalid', () => {
  expect(() =>
    store.dispatch(setAuthToken(42))
  ).toThrow();
});

test('can removeAuthToken', () => {
  store.dispatch(setAuthToken(testToken));
  store.dispatch(removeAuthToken());
  expect(segmentActions.segmentEventReset).toBeCalled();
  expect(store.getState()).toMatchSnapshot();
});

test('setNextUrl', () => {
  store.dispatch(setNextUrl('/foo'));
  expect(store.getState()).toMatchSnapshot();
});

test('unsetNextUrl', () => {
  store.dispatch(setNextUrl('/foo'));
  store.dispatch(unsetNextUrl());
  expect(store.getState()).toMatchSnapshot();
});
