/*  nodejs-poolController.  An application to control pool equipment.
 *  Copyright (C) 2016, 2017.  Russell Goldin, tagyoureit.  russ.goldin@gmail.com
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

//TODO: make an 'update' function so poolHeatModeStr/spaHeatModeStr update when we set the corresponding modes.

var Promise = require('bluebird')


module.exports = function(container) {
    var logger = container.logger
    /*istanbul ignore next */
    if (container.logModuleLoading)
        logger.info('Loading: reload.js')


    var stop = function() {
        /*  STOP STUFF
         */

        return Promise.resolve()
            .then(function() {
                return
                    if (!container.settings.pump.standalone) {
                        //only clear timers if we go from 1 or 2 pumps to 0 pumps
                        container.pumpControllerTimers.clearTimer(1)
                        container.pumpControllerTimers.clearTimer(2)
                    }
                if (!container.settings.chlorinator.standalone) {
                    container.chlorinatorController.clearTimer()
                }
            })
            .then(function() {
                return container.server.close()
            })
            .then(function() {
                return container.io.stop()
            })
            .then(function() {
                container.sp.close()
            })
            .then(function(){
                console.log('nodejs-poolController services stopped successfully')
            })
            .catch(function(err){
              console.log('Error stopping services:', err)
            })

    }

    var reload = function(reset, callback) {
        //reset is a variable to also reset the status of objects.
        var reloadStr = 'Reloading settings.  Stopping/Starting Serialport.  Pool, Pump and Chlorinator controllers will be re-initialized \r\n \
            This will _NOT_ restart the express (web) server and will not affect bootstrap, auth, or ssl.'
        var res = reloadStr + '<p>'
        res += 'Intro: <p>' + container.settings.displayIntroMsg() + '<p>'
        res += 'Settings: <p>' + container.settings.displaySettingsMsg() + '<p>'


        stop()
        .then(function(){
          /*  RELOAD STUFF
           */
          container.settings.load()

          container.server.init()
          container.io.init()

          container.logger.info('Intro: ', container.settings.displayIntroMsg())
          container.logger.warn('Settings: ', container.settings.displaySettingsMsg())
          container.sp.init()

          if (container.settings.pump.standalone && !container.settings.intellicom.installed && !container.settings.intellitouch.installed) {
              container.pumpControllerTimers.startPumpController()
          }
          if (container.settings.chlorinator.standalone) {
              container.chlorinatorController.startChlorinatorController()
          }
          if (container.settings.intellitouch.installed) {
              container.intellitouch.getControllerConfiguration()
          }

          if (reset) {
              container.chlorinator.init()
              container.heat.init()
              container.time.init()
              container.pump.init()
              container.schedule.init()
              container.circuit.init()
              container.customNames.init()
              container.intellitouch.init()
              container.temperatures.init()
              container.uom.init()
              container.valves.init()

          }

        })
        .then(function(){
          container.logger.info('Successfully reloaded services')
        })
        .catch(function(err){
          container.logger.error('Error reloading services:', err)
        })


        return res
        if (callback !== undefined) {
            return res
        }

        container.logger.info(res)


    }




    /*istanbul ignore next */
    if (container.logModuleLoading)
        logger.info('Loaded: reload.js')


    return {
        reload: reload,
        stop: stop,

    }
}
