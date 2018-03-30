import React, { Component } from 'react';

import { Auth, Logger } from 'aws-amplify';
import AmplifyTheme from '../../AmplifyTheme';
import { SignInButton } from '../../AmplifyUI';

const logger = new Logger('withCognito');

export default function withCognito(Comp) {
    return class extends Component {
        constructor(props) {
            super(props);
            this.signIn = this.signIn.bind(this);
            this.state = {};
        }

        componentDidMount() {
            
        }

        signIn() {
            const config = Auth.configure();
            const { 
                AppWebDomain,  
                RedirectUriSignIn, 
                RedirectUriSignOut,
                ResponseType } = config.hostedUIOptions;
            const clientId = config.userPoolWebClientId;
            const url = 'https://' + AppWebDomain + '/login?redirect_uri=' + RedirectUriSignIn + '&response_type=' + ResponseType + '&client_id=' + clientId;
            window.location.assign(url);            
        }

        render() {
            return (
                <Comp {...this.props} cognitoSignIn={this.signIn} />
            )
        }
    }
}

const Button = (props) => (
    <SignInButton
        id="cognito_signin_btn"
        onClick={props.cognitoSignIn}
        theme={props.theme || AmplifyTheme}
    >
        {props.label || 'Sign in with AWS'}
    </SignInButton>
)

export const CognitoButton = withCognito(Button);