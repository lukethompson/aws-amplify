/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

import React, { Component } from 'react';
import { I18n, ConsoleLogger as Logger } from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import AuthPiece from './AuthPiece';
import { NavBar, Nav, NavRight, NavItem, NavButton } from '../Amplify-UI/Amplify-UI-Components-React';

import AmplifyTheme from '../Amplify-UI/Amplify-UI-Theme';
import Constants from './common/constants';

const logger = new Logger('Greetings');

export default class Greetings extends AuthPiece {
    constructor(props) {
        super(props);

        this.signOut = this.signOut.bind(this);
        this.googleSignOut = this.googleSignOut.bind(this);
        this.facebookSignOut = this.facebookSignOut.bind(this);
       

        this.state = {
            authState: props.authState,
            authData: props.authData
        }
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    signOut() {
        let payload = {};
        try {
            payload = JSON.parse(localStorage.getItem(Constants.AUTH_SOURCE_KEY)) || {};
            localStorage.removeItem(Constants.AUTH_SOURCE_KEY);
        } catch (e) {
            logger.debug(`Failed to parse the info from ${Constants.AUTH_SOURCE_KEY} from localStorage with ${e}`);
        }

        logger.debug('sign out from the source', payload);
        switch (payload.provider) {
            case Constants.GOOGLE:
                this.googleSignOut();
                break;
            case Constants.FACEBOOK:
                this.facebookSignOut();
                break;
            case Constants.AUTH0:
                this.auth0SignOut(payload);
                break;
            default:
                break;
        }
        if (!Auth || typeof Auth.signOut !== 'function') {
            throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
        }
        Auth.signOut()
            .then(() => this.changeState('signedOut'))
            .catch(err => { logger.error(err); this.error(err); });
    }

    googleSignOut() {
        const authInstance = window.gapi && window.gapi.auth2? window.gapi.auth2.getAuthInstance() : null;
        if (!authInstance) {
            return Promise.resolve();
        }

        authInstance.then((googleAuth) => {
            if (!googleAuth) {
                logger.debug('google Auth undefined');
                return Promise.resolve();
            }

            logger.debug('google signing out');
            return googleAuth.signOut();
        });
    }

    facebookSignOut() {
        const fb = window.FB;
        if (!fb) {
            logger.debug('FB sdk undefined');
            return Promise.resolve();
        }

        fb.getLoginStatus(response => {
            if (response.status === 'connected') {
                return new Promise((res, rej) => {
                    logger.debug('facebook signing out');
                    fb.logout(response => {
                        res(response);
                    });
                });
            } else {
                return Promise.resolve();
            }
        });
    }

    auth0SignOut(payload) {
        const auth0 = window.auth0;
        const { returnTo, clientId, federated } = payload.opts || {};
        if (!auth0) {
            logger.debug('auth0 sdk undefined');
            return Promise.resolve();
        }

        auth0.logout({
            returnTo,
            clientId,
            federated
        });
    }

    inGreeting(name) { return 'Hello ' + name; }
    outGreeting() { return ''; }

    userGreetings(theme) {
        const user = this.state.authData;
        const greeting = this.props.inGreeting || this.inGreeting;
        // get name from attributes first
        const nameFromAttr = user.attributes? 
            (user.attributes.name || 
            (user.attributes.given_name? 
                (user.attributes.given_name + ' ' + user.attributes.family_name) : undefined))
            : undefined;

        const name = nameFromAttr || user.name || user.username;
        const message = (typeof greeting === 'function')? greeting(name) : greeting;
        return (
            <span>
                <NavItem theme={theme}>{message}</NavItem>
                <NavButton
                    theme={theme}
                    onClick={this.signOut}
                >
                    {I18n.get('Sign Out')}
                </NavButton>

            </span>
        )
    }

    noUserGreetings(theme) {
        const greeting = this.props.outGreeting || this.outGreeting;
        const message = (typeof greeting === 'function')? greeting() : greeting;
        return message? <NavItem theme={theme}>{message}</NavItem> : null;
    }

    render() {
        const { hide } = this.props;
        if (hide && hide.includes(Greetings)) { return null; }

        const { authState } = this.state;
        const signedIn = (authState === 'signedIn');

        const theme = this.props.theme || AmplifyTheme;
        const greeting = signedIn? this.userGreetings(theme) : this.noUserGreetings(theme);
        if (!greeting) { return null; }

        return (
            <NavBar theme={theme}>
                <Nav theme={theme}>
                    <NavRight theme={theme}>
                        {greeting}
                    </NavRight>
                </Nav>
            </NavBar>
        )
    }
}
