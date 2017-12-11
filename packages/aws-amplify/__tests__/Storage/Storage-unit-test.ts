jest.mock('aws-sdk-mobile-analytics', () => {
    const Manager = () => {}

    Manager.prototype.recordEvent = () => {

    }

    Manager.prototype.recordMonetizationEvent = () => {

    }

    var ret =  {
        Manager: Manager
    }
    return ret;
});

jest.mock('aws-sdk/clients/pinpoint', () => {
    const Pinpoint = () => {
        var pinpoint = null;
        return pinpoint;
    }

    Pinpoint.prototype.updateEndpoint = (params, callback) => {
        callback(null, 'data');
    }

    return Pinpoint;
});

jest.mock('aws-sdk/clients/s3', () => {
    const S3 = () => {};

    S3.prototype.getSignedUrl = (key, params) => {
        return 'url';
    }

    S3.prototype.getObject = (params, callback) => {
        callback(null, 'data');
    }

    S3.prototype.upload = (params, callback) => {
        callback(null, {
            Key: 'public/path/itemsKey'
        });
    }

    S3.prototype.deleteObject = (params, callback) => {
        callback(null, 'data');
    }

    S3.prototype.listObjects = (params, callback) => {
        callback(null, {
            Contents: [{
                Key: 'public/path/itemsKey',
                ETag: 'etag',
                LastModified: 'lastmodified',
                Size: 'size'
            }]
        });
    }

    const config = {
            update: () => {
                return;
            }
    };
    
    return S3;
});

import Storage from '../../src/Storage/Storage';
import Auth from '../../src/Auth/Auth';
import * as S3 from 'aws-sdk/clients/s3';

const options = {
        bucket: 'bucket',
        region: 'region',
        credentials: {secretAccessKey: 'secretAccessKey', identityId: 'id'},
        level: 'level'
    };

const options_no_cred = {
        bucket: 'bucket',
        region: 'region',
        credentials: null,
        level: 'level'
    };

describe('Storage', () => {
    describe('constructor test', () => {
        test('happy case', () => {
            const storage = new Storage(options);
        });
    });

    describe('configure test', () => {
        test('happy case', () => {
            const storage = new Storage({});

            const aws_options = {
                aws_user_files_s3_bucket: 'bucket',
                aws_user_files_s3_bucket_region: 'region'
            }

            const config = storage.configure(aws_options);
            expect(config).toEqual({
                bucket: 'bucket',
                region: 'region'
            });
        });
    });

    describe('get test', async () => {
        test('get object without download', async () => {
            const storage = new Storage(options);
            const spyon = jest.spyOn(S3.prototype, 'getSignedUrl');

            expect.assertions(2);
            expect(await storage.get('key', { downloaded: false })).toBe('url');
            expect(spyon).toBeCalledWith('getObject', {"Bucket": "bucket", "Key": "public/key"});

            spyon.mockClear();
        });

        test('get object with download with success', async() => {
            const options_with_download = Object.assign({}, options, {download: true});
            const storage = new Storage(options_with_download);
            const spyon = jest.spyOn(S3.prototype, 'getObject');

            expect.assertions(2);
            expect(await storage.get('key', {})).toBe('data');
            expect(spyon.mock.calls[0][0]).toEqual({"Bucket": "bucket", "Key": "public/key"});

            spyon.mockClear();
        });

        test('get object with download with failure', async () => {
            const options_with_download = Object.assign({}, options, {download: true});
            const storage = new Storage(options_with_download);
            const spyon = jest.spyOn(S3.prototype, 'getObject')
                .mockImplementationOnce((params, callback) => {
                    callback('err', null);
                });

            expect.assertions(1);
            try{
                await storage.get('key', {});
            } catch (e) {
                expect(e).toBe('err');

            }
            spyon.mockClear();
        });

        test('get object with private option', async () => {
            const storage = new Storage(options);
            const spyon = jest.spyOn(S3.prototype, 'getSignedUrl');

            expect.assertions(2);
            expect(await storage.get('key', {level: 'private'})).toBe('url');
            expect(spyon).toBeCalledWith('getObject', {"Bucket": "bucket", "Key": "private/id/key"});

            spyon.mockClear();
        });

        test('credentials not ok', async () => {
            const storage = new Storage(options_no_cred);
            const spyon = jest.spyOn(Auth.prototype, 'currentCredentials')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        rej('err');
                    });
                });

            expect.assertions(1);
            try{
                await storage.get('key', {});
            } catch (e) {
                expect(e).not.toBeNull();
            }

            spyon.mockClear();
        });
    });
    
    describe('put test', () => {
        test('put object succefully', async () => {
            const storage = new Storage(options);
            const spyon = jest.spyOn(S3.prototype, 'upload');

            expect.assertions(2);
            expect(await storage.put('key', 'obejct', {})).toEqual({"key": "path/itemsKey"});
            expect(spyon.mock.calls[0][0]).toEqual({
                "Body": "obejct", 
                "Bucket": "bucket", 
                "ContentType": "binary/octet-stream", 
                "Key": "public/key"
            });
            spyon.mockClear();
        });

        test('put object failed', async () => {
            const storage = new Storage(options);
            const spyon = jest.spyOn(S3.prototype, 'upload')
                .mockImplementationOnce((params, callback) => {
                    callback('err', null);
                });

            expect.assertions(1);
            try{
                await storage.put('key', 'obejct', {});
            } catch (e) {
                expect(e).toBe('err'); 
            }

            spyon.mockClear();
        });

        test('put object with private and contenttype specified', async () => {
            const storage = new Storage(options);
            const spyon = jest.spyOn(S3.prototype, 'upload');

            expect.assertions(2);
            expect(await storage.put('key', 'obejct', {level: 'private', contentType: 'text/plain'})).toEqual({"key": "/itemsKey"});
            expect(spyon.mock.calls[0][0]).toEqual({
                "Body": "obejct", 
                "Bucket": "bucket", 
                "ContentType": "text/plain", 
                "Key": "private/id/key"
            });
            spyon.mockClear();
        });

        test('credentials not ok', async () => {
            const storage = new Storage(options_no_cred);
            const spyon = jest.spyOn(Auth.prototype, 'currentCredentials')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        rej('err');
                    });
                });

            expect.assertions(1);
            try{
                await storage.put('key', 'obj',{});
            } catch (e) {
                expect(e).not.toBeNull();
            }

            spyon.mockClear();
        });
    });

    describe('remove test', () => {
        test('remove object successfully', async () => {
            const storage = new Storage(options);
            const spyon = jest.spyOn(S3.prototype, 'deleteObject');

            expect.assertions(2);
            expect(await storage.remove('key', {})).toBe('data');
            expect(spyon.mock.calls[0][0]).toEqual({"Bucket": "bucket", "Key": "public/key"});
            spyon.mockClear();
        });

        test('remove object failed', async () => {
            const storage = new Storage(options);
            const spyon = jest.spyOn(S3.prototype, 'deleteObject')
                .mockImplementationOnce((params, callback) => {
                    callback('err', null);
                });

            expect.assertions(1);
            try{
                await storage.remove('key', {});
            } catch (e) {
                expect(e).toBe('err'); 
            }

            spyon.mockClear();
        });

        test('remove object with private', async () => {
            const storage = new Storage(options);
            const spyon = jest.spyOn(S3.prototype, 'deleteObject');

            expect.assertions(2);
            expect(await storage.remove('key', {level: 'private'})).toBe('data');
            expect(spyon.mock.calls[0][0]).toEqual({"Bucket": "bucket", "Key": "private/id/key"});
            spyon.mockClear();
        });

        test('credentials not ok', async () => {
            const storage = new Storage(options_no_cred);
            const spyon = jest.spyOn(Auth.prototype, 'currentCredentials')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        rej('err');
                    });
                });

            expect.assertions(1);
            try{
                await storage.remove('key', {});
            } catch (e) {
                expect(e).not.toBeNull();
            }

            spyon.mockClear();
        });
    });

    describe('list test', () => {
        test('list object successfully', async () => {
            const storage = new Storage(options);
            const spyon = jest.spyOn(S3.prototype, 'listObjects');

            expect.assertions(2);
            expect(await storage.list('path', {level: 'public'})).toEqual([{
                "eTag": "etag",
                 "key": "path/itemsKey",
                "lastModified": "lastmodified",
                "size": "size"
                }]);
            expect(spyon.mock.calls[0][0]).toEqual({"Bucket": 'bucket', "Prefix": "public/path"});
            spyon.mockClear();
        });

        test('list object failed', async () => {
            const storage = new Storage(options);
            const spyon = jest.spyOn(S3.prototype, 'listObjects')
                .mockImplementationOnce((params, callback) => {
                    callback('err', null);
                });

            expect.assertions(1);
            try {
                await storage.list('path', {});
            } catch (e) {
                expect(e).toBe('err');
            }
            spyon.mockClear();
        });

        test('credentials not ok', async () => {
            const storage = new Storage(options_no_cred);
            const spyon = jest.spyOn(Auth.prototype, 'currentCredentials')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        rej('err');
                    });
                });

            expect.assertions(1);
            try{
                await storage.list('path', {});
            } catch (e) {
                expect(e).not.toBeNull();
            }

            spyon.mockClear();
        });
    })
});