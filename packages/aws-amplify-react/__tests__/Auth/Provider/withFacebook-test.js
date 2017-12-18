import React, { Component } from 'react';
import withFacebook, { FacebookButton } from '../../../src/Auth/Provider/withFacebook';
import { SignInButton, Button } from '../../../src/AmplifyUI';
import { Auth } from 'aws-amplify';


describe('withFacebook test', () => {
    describe('render test', () => {
        test('render correctly', () => {
            const MockComp = class extends Component {
                render() {
                    return <div />;
                }
            }
            const Comp = withFacebook(MockComp);
            const wrapper = shallow(<Comp/>);
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('signIn test', () => {
        test('happy case with connected response', () => {
            const MockComp = class extends Component {
                render() {
                    return <div />;
                }
            }
            const fbResponse = {
                token: 'token',
                status: 'connected'
            }

            const state = {
                fb: {
                    getLoginStatus(callback) {
                        callback(fbResponse);
                    }
                }
            }

            const Comp = withFacebook(MockComp);
            const wrapper = shallow(<Comp/>);
            const comp = wrapper.instance();

            const spyon = jest.spyOn(comp, 'federatedSignIn').mockImplementationOnce(() => { return; });
            comp.setState(state);

            comp.signIn();

            expect(spyon).toBeCalledWith(fbResponse);

            spyon.mockClear();
        });

        test('happy case with not connected response', () => {
            const MockComp = class extends Component {
                render() {
                    return <div />;
                }
            }
            const fbResponse = {
                token: null,
                status: 'not connected'
            }

            const fbResponse2 = {
                token: 'token',
                status: 'connected'
            }

            const state = {
                fb: {
                    getLoginStatus(callback) {
                        callback(fbResponse);
                    },
                    login(callback, option) {
                        callback(fbResponse2);
                    }
                }
            }

            const Comp = withFacebook(MockComp);
            const wrapper = shallow(<Comp/>);
            const comp = wrapper.instance();

            const spyon = jest.spyOn(comp, 'federatedSignIn').mockImplementationOnce(() => { return; });
            comp.setState(state);

            comp.signIn();

            expect(spyon).toBeCalledWith(fbResponse2);

            spyon.mockClear();
        });
    });

    describe('federatedSignIn', () => {
        test('happy case', async () => {
            const MockComp = class extends Component {
                render() {
                    return <div />;
                }
            }
            const fbResponse = {
                name: 'username'
            }

            const state = {
                fb: {
                    api(path, callback) {
                        callback(fbResponse);
                    }
                }
            }

            const Comp = withFacebook(MockComp);
            const wrapper = shallow(<Comp/>);
            const comp = wrapper.instance();

            const spyon = jest.spyOn(Auth, 'federatedSignIn').mockImplementationOnce(() => { 
                return new Promise((res, rej) => {
                    res('credentials');
                });
            });
            const spyon2 = jest.spyOn(Date.prototype, 'getTime').mockReturnValue(0);

            wrapper.setState(state);

            await comp.federatedSignIn({
                accessToken: 'accessToken',
                expiresIn: 0
            });

            expect(spyon).toBeCalledWith('facebook', { token: 'accessToken', expires_at: 0 }, { name: 'username' });

            spyon.mockClear();
            spyon2.mockClear();
        });

        test('happy case with onStateChange exists', async () => {
            const MockComp = class extends Component {
                render() {
                    return <div />;
                }
            }
            const fbResponse = {
                name: 'username'
            }

            const state = {
                fb: {
                    api(path, callback) {
                        callback(fbResponse);
                    }
                }
            }
            const mockFn = jest.fn();

            const Comp = withFacebook(MockComp);
            const wrapper = shallow(<Comp/>);
            const comp = wrapper.instance();

            const spyon = jest.spyOn(Auth, 'federatedSignIn').mockImplementationOnce(() => { 
                return new Promise((res, rej) => {
                    res('credentials');
                });
            });
            const spyon2 = jest.spyOn(Date.prototype, 'getTime').mockReturnValue(0);

            wrapper.setState(state);
            wrapper.setProps({
                onStateChange: mockFn
            });

            await comp.federatedSignIn({
                accessToken: 'accessToken',
                expiresIn: 0
            });

            expect(spyon).toBeCalledWith('facebook', { token: 'accessToken', expires_at: 0 }, { name: 'username' });
            expect(mockFn).toBeCalledWith('signedIn');

            spyon.mockClear();
            spyon2.mockClear();
        });

        test('directly return if no accesstoken', async () => {
            const MockComp = class extends Component {
                render() {
                    return <div />;
                }
            }
            const fbResponse = {
                name: 'username'
            }
            const state = {
                fb: {
                    api(path, callback) {
                        callback(fbResponse);
                    }
                }
            }

            const Comp = withFacebook(MockComp);
            const wrapper = shallow(<Comp/>);
            const comp = wrapper.instance();

            const spyon = jest.spyOn(Auth, 'federatedSignIn').mockImplementationOnce(() => { 
                return new Promise((res, rej) => {
                    res('credentials');
                });
            });
            
            wrapper.setState(state);

            await comp.federatedSignIn({
                accessToken: null,
            });

            expect(spyon).not.toBeCalled();

            spyon.mockClear();
        });
    });

    describe('fbAsyncInit test', () => {
        test('happy case', () => {
            const MockComp = class extends Component {
                render() {
                    return <div />;
                }
            }
            
            const mockFn = jest.fn().mockImplementationOnce((callback) => {
                callback('response')
            });
            const mockFn2 = jest.fn();
            window.FB = {
                getLoginStatus: mockFn,
                init: mockFn2
            };
            
            const Comp = withFacebook(MockComp);
            const wrapper = shallow(<Comp/>);
            const comp = wrapper.instance();

            comp.fbAsyncInit();

            expect(mockFn).toBeCalled();
            expect(mockFn2).toBeCalled();
        });
    });

    describe('initFB test', () => {
        test('happy case', () => {
            const MockComp = class extends Component {
                render() {
                    return <div />;
                }
            }

            window.FB = 'fb';
            
            const Comp = withFacebook(MockComp);
            const wrapper = shallow(<Comp/>);
            const comp = wrapper.instance();

            comp.initFB();
            expect(wrapper.state('fb')).toBe('fb');
        });
    });
});

describe('FacebookButton test', () => {
    describe('render test', () => {
        test('render correctly', () => {
            const wrapper = shallow(<FacebookButton/>);

            expect(wrapper).toMatchSnapshot();
        });
    });
});

