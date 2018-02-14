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

import AnalyticsClass from './Analytics';
import { AnalyticsProvider } from './types';

import {
    ConsoleLogger as Logger,
    Hub
} from '../Common';

const logger = new Logger('Analytics');

let _instance: AnalyticsClass = null;

if (!_instance) {
    logger.debug('Create Analytics Instance');
    _instance = new AnalyticsClass();
}

const Analytics = _instance;
export default Analytics;
export { AnalyticsProvider };


Analytics.onHubCapsule = (capsule) => {
    const { channel, payload, source } = capsule;
    logger.debug('on hub capsule ' + channel, payload);

    switch(channel) {
        case 'auth':
            authEvent(payload);
            break;
        case 'storage':
            storageEvent(payload);
            break;
        case 'analytics':
            analyticsEvent(payload);
            break;
        default:
            break;
    }
};

const storageEvent = (payload) => {
    const { attrs, metrics } = payload;
    if (!attrs) return;

    Analytics.record('Storage', attrs, metrics);
};

const authEvent = (payload) => {
    const { event } = payload;
    if (!event) { return; }

    switch(event) {
        case 'signIn':
            Analytics.record('_userauth.sign_in');
            break;
        case 'signUp':
            Analytics.record('_userauth.sign_up');
            break;
        case 'signOut':
            break;
        case 'signIn_failure':
            Analytics.record('_userauth.auth_fail');
            break;
    }
};

const analyticsEvent = (payload) => {
    const { eventType } = payload;
    if (!eventType) return;

     switch(eventType) {
         case 'session_start':
             Analytics.startSession();
             break;
     }
};

Hub.listen('auth', Analytics);
Hub.listen('storage', Analytics);
Hub.listen('analytics', Analytics);
Hub.dispatch('analytics', { eventType: 'session_start' }, 'Analytics');
