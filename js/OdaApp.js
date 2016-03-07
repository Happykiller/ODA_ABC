/* global er */
//# sourceURL=OdaApp.js
// Library of tools for the exemple
/**
 * @author FRO
 * @date 15/05/08
 */

(function() {
    'use strict';

    var
        /* version */
        VERSION = '0.1'
    ;
    
    ////////////////////////// PRIVATE METHODS ////////////////////////
    /**
     * @name _init
     * @desc Initialize
     */
    function _init() {
        $.Oda.Event.addListener({name : "oda-fully-loaded", callback : function(e){
            $.Oda.App.startApp();
        }});
    }

    ////////////////////////// PUBLIC METHODS /////////////////////////
    $.Oda.App = {
        /* Version number */
        version: VERSION,
        
        /**
         * @returns {$.Oda.App}
         */
        startApp: function () {
            try {
                $.Oda.Router.addRoute("home", {
                    "path" : "partials/home.html",
                    "title" : "home.title",
                    "urls" : ["","home"],
                    "middleWares":["support","auth"]
                });

                $.Oda.Router.addRoute("patients", {
                    "path" : "partials/patients.html",
                    "title" : "patients.title",
                    "urls" : ["patients"],
                    "middleWares" : ["support","auth"],
                    "dependencies" : ["dataTables"]
                });

                $.Oda.Router.startRooter();

                return this;
            } catch (er) {
                $.Oda.Log.error("$.Oda.App.startApp : " + er.message);
                return null;
            }
        },

        "Controller" : {
            "Home": {
                /**
                 * @returns {$.Oda.App.Controller.Home}
                 */
                start: function () {
                    try {
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Home.start : " + er.message);
                        return null;
                    }
                }
            },
            "Patients": {
                /**
                 * @returns {$.Oda.App.Controller.Patients}
                 */
                start: function () {
                    try {
                        $.Oda.App.Controller.Patients.displayPatients();
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Patients.start : " + er.message);
                        return null;
                    }
                },
                /**
                 * @returns {$.Oda.App.Controller.Patients}
                 */
                displayPatients : function () {
                    try {
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/patient/", {callback : function(response){
                            $.Oda.Display.Table.createDataTable({
                                target: 'divPatients',
                                data: response.data,
                                attribute: [
                                    {
                                        header: "Nom",
                                        value: function(data, type, full, meta, row){
                                            return row.name_first + " " + row.name_last;
                                        }
                                    },
                                    {
                                        header: "Action",
                                        align: 'center',
                                        value: function(data, type, full, meta, row){
                                            var strHtml = '<a onclick="$.Oda.Router.navigateTo({route:\'patient\',args:{id:'+row.id+'}});" class="btn btn-primary btn-xs"><span class="glyphicon glyphicon-eye-open"></span></a>';
                                            return strHtml;
                                        }
                                    }
                                ]
                            })
                        }});
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Patients.displayPatients : " + er.message);
                        return null;
                    }
                }
            }
        }
    };

    // Initialize
    _init();

})();
