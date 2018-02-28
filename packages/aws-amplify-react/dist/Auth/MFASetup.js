'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _awsAmplify = require('aws-amplify');

var _AuthPiece2 = require('./AuthPiece');

var _AuthPiece3 = _interopRequireDefault(_AuthPiece2);

var _AmplifyTheme = require('../AmplifyTheme');

var _AmplifyTheme2 = _interopRequireDefault(_AmplifyTheme);

var _AmplifyUI = require('../AmplifyUI');

var _qrcode = require('qrcode.react');

var _qrcode2 = _interopRequireDefault(_qrcode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
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

var logger = new _awsAmplify.Logger('mfaSetup');

var MFASetup = function (_AuthPiece) {
    _inherits(MFASetup, _AuthPiece);

    function MFASetup(props) {
        _classCallCheck(this, MFASetup);

        var _this = _possibleConstructorReturn(this, (MFASetup.__proto__ || Object.getPrototypeOf(MFASetup)).call(this, props));

        _this._validAuthStates = ['mfaSetup'];
        _this.setup = _this.setup.bind(_this);
        _this.showSecretCode = _this.showSecretCode.bind(_this);
        _this.verifyTotpToken = _this.verifyTotpToken.bind(_this);

        _this.state = {
            code: null
        };
        return _this;
    }

    _createClass(MFASetup, [{
        key: 'setup',
        value: function () {
            function setup() {
                var _this2 = this;

                var user = this.props.authData;
                _awsAmplify.Auth.setupMFA(user).then(function (data) {
                    logger.debug('secret key', data);
                    var code = "otpauth://totp/AWSCognito:" + user.username + "?secret=" + data + "&issuer=AWSCognito";
                    _this2.setState({ code: code });
                })['catch'](function (err) {
                    return logger.debug('mfa setup failed', err);
                });
            }

            return setup;
        }()
    }, {
        key: 'verifyTotpToken',
        value: function () {
            function verifyTotpToken() {
                var _this3 = this;

                var user = this.props.authData;
                var totpCode = this.inputs.totpCode;

                _awsAmplify.Auth.verifyTotpToken(user, totpCode).then(function () {
                    return _this3.changeState('signedIn', user);
                })['catch'](function (err) {
                    return _this3.error(err);
                });
            }

            return verifyTotpToken;
        }()
    }, {
        key: 'showSecretCode',
        value: function () {
            function showSecretCode(code) {
                if (!code) return null;
                return _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(_qrcode2['default'], { value: code })
                );
            }

            return showSecretCode;
        }()
    }, {
        key: 'showComponent',
        value: function () {
            function showComponent(theme) {
                var _this4 = this;

                var hide = this.props.hide;

                if (hide && hide.includes(MFASetup)) {
                    return null;
                }
                var code = this.state.code;

                return _react2['default'].createElement(
                    _AmplifyUI.FormSection,
                    { theme: theme },
                    _react2['default'].createElement(
                        _AmplifyUI.SectionHeader,
                        { theme: theme },
                        _awsAmplify.I18n.get('MFA Setup')
                    ),
                    _react2['default'].createElement(
                        _AmplifyUI.SectionBody,
                        { theme: theme },
                        this.showSecretCode(code),
                        _react2['default'].createElement(
                            _AmplifyUI.ButtonRow,
                            { theme: theme, onClick: this.setup },
                            _awsAmplify.I18n.get('Get secret key')
                        ),
                        _react2['default'].createElement(_AmplifyUI.InputRow, {
                            autoFocus: true,
                            placeholder: _awsAmplify.I18n.get('totp verification token'),
                            theme: theme,
                            key: 'totpCode',
                            name: 'totpCode',
                            onChange: this.handleInputChange
                        }),
                        _react2['default'].createElement(
                            _AmplifyUI.ButtonRow,
                            { theme: theme, onClick: this.verifyTotpToken },
                            _awsAmplify.I18n.get('Verify')
                        )
                    ),
                    _react2['default'].createElement(
                        _AmplifyUI.SectionFooter,
                        { theme: theme },
                        _react2['default'].createElement(
                            _AmplifyUI.Link,
                            { theme: theme, onClick: function () {
                                    function onClick() {
                                        return _this4.changeState('signIn');
                                    }

                                    return onClick;
                                }() },
                            _awsAmplify.I18n.get('Back to Sign In')
                        )
                    )
                );
            }

            return showComponent;
        }()
    }]);

    return MFASetup;
}(_AuthPiece3['default']);

exports['default'] = MFASetup;