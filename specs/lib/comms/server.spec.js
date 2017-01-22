var URL = 'http://localhost:3000/';
//var URL = 'http://localhost:3000'
//var ENDPOINT = 'all'

var myModule = rewire(path.join(process.cwd(), 'lib/comms', 'server.js'))

function requestPoolDataWithURL(endpoint) {
    console.log('pending - request sent for ' + endpoint)
    return getAllPoolData(endpoint).then(
        function(response) {
            //console.log('success - received data for %s request: %s', endpoint, JSON.stringify(response.body));
            return response.body;
        }
    );
};

function getAllPoolData(endpoint) {
    var options = {
        method: 'GET',
        uri: URL + endpoint,
        resolveWithFullResponse: true,
        json: true
    };
    return rp(options);
};


describe('server', function() {
    describe('#get functions', function() {
        context('with a URL', function() {
            it('returns pump status in a JSON', function() {

                var scope = nock('https://localhost:3000')
                    .get('/pump')
                    .replyWithFile(200, path.join(process.cwd(),'specs/assets', 'pumpstatus.json'));

                (requestPoolDataWithURL('pump').then(function(obj) {
                    console.log('valuePumpObj:', obj)
                    obj[1].watts.should.eq(999);
                }))
            });
            it('returns everything in a JSON', function() {
              var scope = nock('https://localhost:3000')
                  .get('/all')
                  .replyWithFile(200, path.join(process.cwd(),'specs/assets', 'all.json'));

                requestPoolDataWithURL('all').then(function(obj) {
                    obj.circuits[1].friendlyName.eq('SPA')
                });

            });
            it('returns circuits in a JSON', function() {
              var scope = nock('https://localhost:3000')
                  .get('/circuit')
                  .replyWithFile(200, path.join(process.cwd(),'specs/assets', 'circuit.json'));

                requestPoolDataWithURL('circuit').then(function(obj) {
                    obj[1].number.eq(1)
                })
            });
            it('returns heat in a JSON', function() {
              var scope = nock('https://localhost:3000')
                  .get('/circuit')
                  .replyWithFile(200, path.join(process.cwd(),'specs/assets', 'circuit.json'));

                requestPoolDataWithURL('heat').then(function(obj) {
                    obj.should.have.property('poolHeatMode');;
                });

            });
            it('returns schedule in a JSON', function() {
              var scope = nock('https://localhost:3000')
                  .get('/schedule')
                  .replyWithFile(200, path.join(process.cwd(),'specs/assets', 'schedule.json'));

                requestPoolDataWithURL('schedule').then(function(obj) {
                    obj[1].should.have.property('DURATION');
                })

            });
            it('returns temps in a JSON', function() {
              var scope = nock('https://localhost:3000')
                  .get('/temperatures')
                  .replyWithFile(200, path.join(process.cwd(),'specs/assets', 'temperatures.json'));

                requestPoolDataWithURL('temperatures').then(function(obj) {
                    obj.should.have.property('poolTemp');
                });

            });
            it('returns time in a JSON', function() {
              var scope = nock('https://localhost:3000')
                  .get('/time')
                  .replyWithFile(200, path.join(process.cwd(),'specs/assets', 'time.json'));

                requestPoolDataWithURL('time').then(function(obj) {
                    obj.should.have.property('controllerTime');;
                });

            });
            it('returns chlorinator in a JSON', function() {
              var scope = nock('https://localhost:3000')
                  .get('/chlorinator')
                  .replyWithFile(200, path.join(process.cwd(),'specs/assets', 'chlorinator.json'));

                requestPoolDataWithURL('chlorinator').then(function(obj) {
                    obj.should.have.property('saltPPM');;
                });

            });
            it('returns circuit (9) in a JSON', function() {
              var scope = nock('https://localhost:3000')
                  .get('/circuit/9')
                  .replyWithFile(200, path.join(process.cwd(),'specs/assets', 'circuit9.json'));

                requestPoolDataWithURL('circuit/9').then(function(obj) {
                    obj.should.have.property('status');
                });
            });
        });
    });
    describe('#set functions', function() {
        context('with a URL', function() {
            it('sets chlorinator to 50', function() {
                var value = requestPoolDataWithURL('chlorinator/50').then(function(obj) {
                    return obj;
                });
                return expect(value).to.eventually.have.property('status');
            });
            it('sets chlorinotator to OFF', function() {
                var value = requestPoolDataWithURL('chlorinator/0').then(function(obj) {
                    return obj;
                });
                return expect(value).to.eventually.have.property('status');
            });
            it('toggles circuit (9) in a JSON', function() {
                var value = requestPoolDataWithURL('circuit/9/toggle').then(function(obj) {
                    return obj;
                });
                return expect(value).to.eventually.have.property('status');
            });
            it('sets circuit (9) to off', function() {
                var value = requestPoolDataWithURL('circuit/9/set/0').then(function(obj) {
                    return obj;
                });
                return expect(value).to.eventually.have.property('status');
            });
            it('sets spa setpoint', function() {
                var value = requestPoolDataWithURL('spaheat/setpoint/50').then(function(obj) {
                    return obj;
                });
                return expect(value).to.eventually.have.property('status');
            });
            it('sets spa heat mode to off', function() {
                var value = requestPoolDataWithURL('spaheat/mode/0').then(function(obj) {
                    return obj;
                });
                return expect(value).to.eventually.have.property('status');
            });
            it('sets pool setpoint to 50', function() {
                var value = requestPoolDataWithURL('poolheat/setpoint/50').then(function(obj) {
                    return obj;
                });
                return expect(value).to.eventually.have.property('status');
            });
            it('sets pool heat mode to off', function() {
                var value = requestPoolDataWithURL('poolheat/mode/0').then(function(obj) {
                    return obj;
                });
                return expect(value).to.eventually.have.property('status');
            });
            it('sends an arbitrary packet (request pump status)', function() {
                var value = requestPoolDataWithURL('sendthispacket/96-16-7-0').then(function(obj) {
                    return obj;
                });
                return expect(value).to.eventually.have.property('status');
            });
        });
        describe('#sends pump commands', function() {
            context('with a URL', function() {
                it('sets pump 1 to program 1', function() {
                    var value = requestPoolDataWithURL('pumpCommand/1/1').then(function(obj) {
                        return obj;
                    });
                    return expect(value).to.eventually.have.property('equip');
                });
                it('saves pump 1 to program 1 (should fail)', function() {
                    var value = requestPoolDataWithURL('pumpCommand/save/pump/1/program/1').then(function(obj) {
                        return obj.text;
                    });
                    return expect(value).to.eventually.eq('Please provide a speed /speed/{speed} when requesting to save the program');
                });
                it('runs pump 1 to program 1 (NEW URL)', function() {
                    var value = requestPoolDataWithURL('pumpCommand/run/pump/1/program/1').then(function(obj) {
                        return obj;
                    });
                    return expect(value).to.eventually.eq({
                        "text": "REST API pumpCommand variables - pump: 1, program: 1, value: null, duration: null",
                        "pump": "1",
                        "program": "1"
                    });
                });
                it('sets pump 1 program 1 to 1000 rpm', function() {
                    var value = requestPoolDataWithURL('pumpCommand/1/1/1000').then(function(obj) {
                        console.log('myObj sets pump 1 program 1 to 1000 rpm: ', obj)
                        return obj;
                    });
                    return expect(value).to.eventually.eq({
                        "text": "REST API pumpCommand variables - pump: 1, program: 1, rpm: 1000, duration: null",
                        "pump": "1",
                        "program": "1",
                        "value": "1000",
                        "duration": null
                    });
                });
                it('saves pump 1 program 1 to 1000 rpm (NEW URL)', function(done) {
                    var result = requestPoolDataWithURL('pumpCommand/save/pump/1/program/1/rpm/1000').then(function(obj) {
                        return obj

                        done()
                    });
                    return expect(result).should.eventually.eq({
                        "text": "REST API pumpCommand variables - pump: 1, program: 1, rpm: 1000, duration: null",
                        "pump": "1",
                        "program": "1",
                        "speed": "1000"
                    });
                });
                it('saves pump 1 and rpm 1 (should fail // no program)', function(done) {
                    var result = requestPoolDataWithURL('pumpCommand/save/pump/1/rpm/1000').then(function(obj) {

                        done()
                    });
                    return result.should.eventually.eq({
                        "text": "Please provide the program number when saving the program.  /pumpCommand/save/pump/#/program/#/rpm/#"
                    })
                });
                it('runs pump 1 at rpm 1000 (should fail // no program)', function() {
                    var value = requestPoolDataWithURL('pumpCommand/save/pump/1/program/1').then(function(obj) {
                        return obj.text;
                    });
                    return expect(value).to.eventually.eq('Please provide a program when setting the RPM.  /pumpCommand/run/pump/rpm/#')
                });
                it('sets pump 1 to program 1 at 1000 rpm for 2 minutes', function() {
                    var value = requestPoolDataWithURL('pumpCommand/1/1/1000/2').then(function(obj) {
                        return obj;
                    });
                    return expect(value).to.eventually.eq({
                        "text": "REST API pumpCommand variables - pump: 1, program: 1, speed: 1000, duration: 2",
                        "pump": "1",
                        "program": "1",
                        "speed": "1000",
                        "duration": "2"
                    });
                });
                it('runs pump 1, program 1 for 2 minutes ', function() {
                    var value = requestPoolDataWithURL('pumpCommand/pump/1/program/1/duration/2').then(function(obj) {
                        return obj;
                    });
                    return expect(value).to.eventually.eq({
                        "text": "REST API pumpCommand variables - pump: 1, program: 1, duration: 2",
                        "pump": "1",
                        "duration": "2"
                    });
                });
                it('runs pump 1, program 1 for 2 minutes (NEW URL)', function() {
                    var value = requestPoolDataWithURL('pumpCommand/run/pump/1/program/1/duration/2').then(function(obj) {
                        return obj;
                    });
                    return expect(value).to.eventually.have.property('equip');
                });

                it('saves and runs pump 1 to program 1 at 1000 rpm for 2 minutes (NEW URL)', function() {
                    var value = requestPoolDataWithURL('pumpCommand/run/pump/1/program/1/rpm/1000/duration/2').then(function(obj) {
                        return obj;
                    });
                    return expect(value).to.eventually.have.property('equip');
                });

            });

        });
    });
});