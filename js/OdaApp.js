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
                $.Oda.Google.scopes = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';

                $.Oda.Router.addDependencies("fullcalendar", {
                    ordered : true,
                    "list" : [
                        { "elt" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/fullcalendar/dist/fullcalendar.min.css", "type" : "css"},
                        { "elt" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/moment/min/moment.min.js", "type" : "script"},
                        { "elt" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/fullcalendar/dist/fullcalendar.min.js", "type" : "script"},
                        { "elt" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/fullcalendar/dist/lang/fr.js", "type" : "script"},
                        { "elt" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/fullcalendar/dist/lang/es.js", "type" : "script"},
                        { "elt" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/fullcalendar/dist/lang/it.js", "type" : "script"}
                    ]
                });

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

                $.Oda.Router.addRoute("planning", {
                    "path" : "partials/planning.html",
                    "title" : "planning.title",
                    "urls" : ["planning"],
                    "middleWares" : ["support","auth"],
                    "dependencies" : ["fullcalendar"]
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
                                        header: "Actif",
                                        value: function(data, type, full, meta, row){
                                            return (row.active==="1")?"Actif":"Inactif";
                                        }
                                    },
                                    {
                                        header: "Action",
                                        align: 'center',
                                        value: function(data, type, full, meta, row){
                                            var strHtml = '<a onclick="$.Oda.App.Controller.Patients.editPatient({id:'+row.id+'});" class="btn btn-primary btn-xs"><span class="glyphicon glyphicon-edit"></span></a>';
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
                },
                /**
                 * @returns {$.Oda.App.Controller.Patients}
                 */
                newPatient: function () {
                    try {
                        var strHtml = $.Oda.Display.TemplateHtml.create({
                            template : "formCreatePatient"
                            , scope : {

                            }
                        });

                        $.Oda.Display.Popup.open({
                            "name" : "createPatient",
                            "size" : "lg",
                            "label" : $.Oda.I8n.get('patients','createPatient'),
                            "details" : strHtml,
                            "footer" : '<button type="button" oda-label="oda-main.bt-submit" oda-submit="submit" onclick="$.Oda.App.Controller.Patients.submitPatient();" class="btn btn-primary disabled" disabled>Submit</button >',
                            "callback" : function(){
                                $.Oda.Scope.Gardian.add({
                                    id : "createPatient",
                                    listElt : ["firstName", "lastName"],
                                    function : function(e){
                                        if( ($("#firstName").data("isOk")) && ($("#lastName").data("isOk")) ){
                                            $("#submit").removeClass("disabled");
                                            $("#submit").removeAttr("disabled");
                                        }else{
                                            $("#submit").addClass("disabled");
                                            $("#submit").attr("disabled", true);
                                        }
                                    }
                                });
                            }
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Patients.newPatient : " + er.message);
                        return null;
                    }
                },
                /**
                 * @returns {$.Oda.App.Controller.Patients}
                 */
                submitPatient: function () {
                    try {
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/patient/", {type:'POST',callback : function(response){
                            $.Oda.Display.Popup.close({name:"createPatient"});
                            $.Oda.App.Controller.Patients.displayPatients();
                        }},{
                            "name_first": $('#firstName').val(),
                            "name_last": $('#lastName').val(),
                            "user_id": $.Oda.Session.id
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Patients.submitPatient : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} p_params
                 * @param p_params.id
                 * @returns {$.Oda.App.Controller.Patients}
                 */
                editPatient : function (p_params) {
                    try {
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/patient/"+p_params.id, {callback : function(response){
                            var patientId = response.data.id;
                            var strHtml = $.Oda.Display.TemplateHtml.create({
                                template : "formEditPatient"
                                , scope : {
                                    "id": response.data.id,
                                    "firstName": response.data.name_first,
                                    "lastName": response.data.name_last,
                                    "checked": (response.data.active==='1')?"checked":""
                                }
                            });

                            $.Oda.Display.Popup.open({
                                "name" : "pEditPatient",
                                "size" : "lg",
                                "label" : $.Oda.I8n.get('patients','editPatient'),
                                "details" : strHtml,
                                "footer" : '<button type="button" oda-label="oda-main.bt-submit" oda-submit="submit" onclick="$.Oda.App.Controller.Patients.submitEditPatient({id:'+response.data.id+'});" class="btn btn-primary disabled" disabled>Submit</button >',
                                "callback" : function(){
                                    $.Oda.Scope.Gardian.add({
                                        id : "gEditPatient",
                                        listElt : ["firstName", "lastName", "active"],
                                        function : function(e){
                                            if( ($("#firstName").data("isOk")) && ($("#lastName").data("isOk")) ){
                                                $("#submit").removeClass("disabled");
                                                $("#submit").removeAttr("disabled");
                                            }else{
                                                $("#submit").addClass("disabled");
                                                $("#submit").attr("disabled", true);
                                            }
                                        }
                                    });
                                    $.Oda.App.Controller.Patients.displayAddress({patientId: patientId});
                                }
                            });
                        }});
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Patients.editPatient : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} params
                 * @param params.id
                 * @returns {$.Oda.App.Controller.Patients}
                 */
                submitEditPatient: function (params) {
                    try {
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/patient/"+params.id, {type:'PUT',callback : function(response){
                            $.Oda.Display.Popup.close({name:"pEditPatient"});
                            $.Oda.App.Controller.Patients.displayPatients();
                        }},{
                            "name_first": $('#firstName').val(),
                            "name_last": $('#lastName').val(),
                            "active": ($('#active').prop("checked"))?1:0
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Patients.submitPatient : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} p_params
                 * @param p_params.patientId
                 * @returns {$.Oda.App.Controller.Patients}
                 */
                displayAddress : function (p_params) {
                    try {
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/address/search/patient/"+p_params.patientId, {callback : function(response){
                            $("#tabAddress > tbody").empty();
                            for(var index in response.data) {
                                var elt = response.data[index];
                                var strHtml = $.Oda.Display.TemplateHtml.create({
                                    template : "tlpRowTabAddress"
                                    , scope : {
                                        "id": elt.id,
                                        "title": elt.code,
                                        "street": elt.adress,
                                        "city": elt.city,
                                        "postCode": elt.code_postal,
                                        "star": (elt.address_id_default === elt.id)?'<span class="glyphicon glyphicon-star" aria-hidden="true"></span>':'',
                                        "bookmark": (elt.address_id_default !== elt.id)?'<button type="button" class="btn btn-primary btn-sm" onclick="$.Oda.App.Controller.Patients.setDefaultAddress({addressId:'+elt.id+', patientId:'+p_params.patientId+'});"><span class="glyphicon glyphicon-star" aria-hidden="true"></span></button>':'',
                                        "remove": '<button type="button" class="btn btn-danger btn-sm" onclick="$.Oda.App.Controller.Patients.removeAddress({addressId:'+elt.id+', patientId:'+p_params.patientId+'});"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>'
                                    }
                                });
                                $('#tabAddress > tbody:last-child').append(strHtml);
                            }
                        }});
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Patients.displayAddress : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} p_params
                 * @param p_params.addressId
                 * @param p_params.patientId
                 * @returns {$.Oda.App.Controller.Patients}
                 */
                setDefaultAddress : function (p_params) {
                    try {
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/patient/"+p_params.patientId+"/default_address/", {type: 'put', callback : function(response){
                            $.Oda.App.Controller.Patients.displayAddress({
                                "patientId" : p_params.patientId
                            });
                        }},{
                            "addressId": p_params.addressId
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Patients.setDefaultAddress : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} p_params
                 * @param p_params.addressId
                 * @param p_params.patientId
                 * @returns {$.Oda.App.Controller.Patients}
                 */
                removeAddress : function (p_params) {
                    try {
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/patient/"+p_params.patientId+"/remove_address/", {type: 'delete', callback : function(response){
                            $.Oda.App.Controller.Patients.displayAddress({
                                "patientId" : p_params.patientId
                            });
                        }},{
                            "addressId": p_params.addressId
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Patients.setDefaultAddress : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} p_params
                 * @param p_params.id
                 * @returns {$.Oda.App.Controller.Patients}
                 */
                newAddress : function (p_params) {
                    try {
                        var strHtml = $.Oda.Display.TemplateHtml.create({
                            template : "formNewAddress"
                            , scope : {}
                        });

                        $.Oda.Display.Popup.open({
                            "name" : "pNewAddress",
                            "label" : $.Oda.I8n.get('patients','newAddress'),
                            "details" : strHtml,
                            "footer" : '<button type="button" oda-label="oda-main.bt-submit" oda-submit="submitNewAddress" onclick="$.Oda.App.Controller.Patients.submitNewAddress({id:'+p_params.id+'});" class="btn btn-primary disabled" disabled>Submit</button >',
                            "callback" : function(){
                                $.Oda.Scope.Gardian.add({
                                    id : "gNewAddress",
                                    listElt : ["addressTitle", "street", "city", "postCode"],
                                    function : function(e){
                                        if( ($("#addressTitle").data("isOk")) && ($("#street").data("isOk")) && ($("#city").data("isOk")) && ($("#postCode").data("isOk")) ){
                                            $("#submitNewAddress").removeClass("disabled");
                                            $("#submitNewAddress").removeAttr("disabled");
                                        }else{
                                            $("#submitNewAddress").addClass("disabled");
                                            $("#submitNewAddress").attr("disabled", true);
                                        }
                                    }
                                });
                            }
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Patients.newAddress : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} p_params
                 * @param p_params.id
                 * @returns {$.Oda.App.Controller.Patients}
                 */
                submitNewAddress : function (p_params) {
                    try {
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/patient/"+p_params.id+"/new_address/", {type: 'POST', callback : function(response){
                            $.Oda.Display.Popup.close({name:"pNewAddress"});
                            $.Oda.App.Controller.Patients.displayAddress({
                                "patientId" : p_params.id
                            });
                        }},{
                            "title": $('#addressTitle').val(),
                            "street": $('#street').val(),
                            "city": $('#city').val(),
                            "postCode": $('#postCode').val()
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Patients.submitNewAddress : " + er.message);
                        return null;
                    }
                },
            },
            "Planning": {
                "dayClicked": {},
                "currentEvent": {},
                "patients": [],
                "address": [],
                /**
                 * @returns {$.Oda.App.Controller.Planning}
                 */
                start: function () {
                    try {
                        $.Oda.App.Controller.Planning.sessionGoogleStart();
                        $.Oda.App.Controller.Planning.displayPlanning();
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Planning.start : " + er.message);
                        return null;
                    }
                },
                /**
                 * @returns {$.Oda.App.Controller.Planning}
                 */
                sessionGoogleStart: function () {
                    try {
                        $.Oda.Google.ready = false;
                        $.Oda.Google.startSessionAuth(
                            function(){
                                $.Oda.App.Controller.Planning.returnGoogleSession();
                            }
                            , function(){
                                $('#google').html('<button type="button" onclick="$.Oda.Google.callServiceGoogleAuth($.Oda.App.Controller.Planning.returnGoogleSession);" class="btn btn-danger center-block">'+$.Oda.I8n.get("planning","syn-google")+'</button>');
                            }
                        );
                        $.Oda.Tooling.timeout($.Oda.App.Controller.Planning.sessionGoogleStart, 3500000);
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Planning.sessionGoogleStart : " + er.message);
                        return null;
                    }
                },
                /**
                 * @returns {$.Oda.App.Controller.Planning}
                 */
                returnGoogleSession: function () {
                    try {
                        $.Oda.Google.gapi.client.setApiKey("");
                        $.Oda.Google.loadGapis([{
                            "api": "calendar",
                            "version": "v3"
                        }], function(){
                            $.Oda.Google.ready = true;
                            $.Oda.Google.gapi.client.oauth2.userinfo.get().execute(function(resp) {
                                $('#google').html($.Oda.I8n.get("planning","googleLogWith") + resp.email);
                            });
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Planning.returnGoogleSession : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {String} p_date
                 * @returns {String}
                 */
                getDateGoole : function(p_date) {
                    try{
                        //2015-12-03 05:00:00
                        //2015-12-03T05:00:00.000
                        var array0 = p_date.split(" ");
                        var arrayDate = array0[0].split("-");
                        var strDateGoole = +arrayDate[0]+"-"+arrayDate[1]+"-"+arrayDate[2]+"T"+array0[1]+".000";
                        return strDateGoole;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Planning.getDateGoole :" + er.message);
                        return null;
                    }
                },
                /**
                 * @param {object} p_params
                 * @param p_params.callback
                 * @param p_params.start
                 * @param p_params.end
                 * @param p_params.title
                 * @param p_params.location
                 * @param p_params.comment
                 * @exemple $.Oda.App.Controller.Planning.createAppointment({callback: function(params){console.log(params)},start:"2016-03-12 17:00:00",end:"2016-03-12 18:00:00",title:"title","location":"46 rue léon jouhaux 38100 grenoble france","comment":"comment"})
                 * @returns {$.Oda.App.Controller.Planning}
                 */
                createAppointment : function(p_params){
                    try{
                        if(!$.Oda.Google.ready){
                            $.Oda.Display.Notification.error($.Oda.I8n.get('planning','pbAuthGoogle'));
                            var datas = {
                                "googleEtag": "",
                                "googleId": "",
                                "googleHtmlLink": "",
                                "googleICalUID": ""
                            };
                            p_params.callback(datas);
                            return this;
                        }

                        var start = {
                            "timeZone": "Europe/Paris",
                            "dateTime": this.getDateGoole(p_params.start)
                        };
                        var end = {
                            "timeZone" : "Europe/Paris",
                            "dateTime": this.getDateGoole(p_params.end)
                        };

                        var resource = {
                            "summary": p_params.title,
                            "description": p_params.comment,
                            "start": start,
                            "end": end,
                            "location": p_params.location,
                            "source": {
                                "url": "http://abc.happykiller.net",
                                "title": "Oda Abc"
                            }
                        };

                        var request = $.Oda.Google.gapi.client.calendar.events.insert({
                            'calendarId': 'primary',
                            'resource': resource
                        });

                        request.execute(function(resp) {
                            if(resp.status === "confirmed"){
                                $.Oda.Display.Notification.info($.Oda.I8n.get('planning','okCreateAppointmentGoogle'));
                                var datas = {
                                    "googleEtag" : $.Oda.Tooling.replaceAll({str:resp.etag,find:'"',by:''}),
                                    "googleId" : resp.id,
                                    "googleHtmlLink" : resp.htmlLink,
                                    "googleICalUID" : resp.iCalUID
                                };
                                p_params.callback(datas);
                            }else{
                                $.Oda.Display.Notification.error($.Oda.I8n.get('planning','errorCreateAppointmentGoogle') + " => " + resp.message);
                                $.Oda.Log.error(resp);
                            }
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Planning.createAppointment :" + er.message);
                    }
                },
                /**
                 * @param {Object} p_params
                 * @param p_params.googleId
                 * @param p_params.callback
                 * @param p_params.start
                 * @param p_params.end
                 * @param p_params.title
                 * @param p_params.location
                 * @param p_params.comment
                 * @returns {$.Oda.App.Controller.Planning}
                 */
                updateAppointment : function (p_params) {
                    try {
                        if(!$.Oda.Google.ready){
                            $.Oda.Display.Notification.error($.Oda.I8n.get('planning','pbAuthGoogle'));
                            var datas = {};
                            p_params.callback(datas);
                            return this;
                        }

                        var start = {
                            "timeZone": "Europe/Paris",
                            "dateTime": this.getDateGoole(p_params.start)
                        };
                        var end = {
                            "timeZone" : "Europe/Paris",
                            "dateTime": this.getDateGoole(p_params.end)
                        };

                        var resource = {
                            "summary": p_params.title,
                            "description": p_params.comment,
                            "start": start,
                            "end": end,
                            "location": p_params.location,
                            "source": {
                                "url": "http://abc.happykiller.net",
                                "title": "Oda Abc"
                            }
                        };

                        var request = $.Oda.Google.gapi.client.calendar.events.update({
                            'calendarId': 'primary',
                            'eventId' : p_params.googleId,
                            'resource': resource
                        });

                        request.execute(function(resp) {
                            if(resp.status === "confirmed"){
                                $.Oda.Display.Notification.info($.Oda.I8n.get('planning','okUpdateAppointmentGoogle'));
                                p_params.callback({});
                            }else{
                                $.Oda.Display.Notification.error($.Oda.I8n.get('planning','errorUpdateAppointmentGoogle') + " => " + resp.message);
                                $.Oda.Log.error(resp);
                            }
                        });

                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Planning.updateAppointment : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {object} p_params
                 * @param p_params.googleId
                 * @param p_params.callback
                 * @returns {$.Oda.App.Controller.Planning}
                 */
                deleteAppointment: function (p_params) {
                    try {
                        if(!$.Oda.Google.ready){
                            $.Oda.Display.Notification.error($.Oda.I8n.get('planning','pbAuthGoogle'));
                            var datas = {};
                            p_params.callback(datas);
                            return this;
                        }

                        var request = $.Oda.Google.gapi.client.calendar.events.delete({
                            'calendarId': 'primary',
                            'eventId': p_params.googleId
                        });
                        request.execute(function(resp) {
                            $.Oda.Display.Notification.info($.Oda.I8n.get('planning','okDeleteAppointmentGoogle'));
                            p_params.callback({});
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Planning.deleteAppointment : " + er.message);
                        return null;
                    }
                },
                /**
                 * @returns {$.Oda.App.Controller.Planning}
                 */
                displayPlanning : function () {
                    try {
                        $('#calendar').fullCalendar({
                            lang: 'fr',
                            weekNumbers : true,
                            dayClick: function(date, jsEvent, view) {
                                $.Oda.App.Controller.Planning.dayClicked = {"date":date, "jsEvent":jsEvent, "view":view, "cell" : $(this)};
                                $.Oda.App.Controller.Planning.createEvent();
                            },
                            eventOrder: 'eventStart',
                            events: function(start, end, timezone, callback) {

                                var currentStart;
                                if(start.format('DD') !== '01'){
                                    currentStart = moment(new Date(start.toDate().getFullYear(), start.toDate().getMonth() + 1, 1));
                                }else{
                                    currentStart = start;
                                }

                                var currentEnd = moment(new Date(start.toDate().getFullYear(), start.toDate().getMonth() + 2, 0));

                                var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/report/count_time/"+ $.Oda.Session.id, {callback : function(response){
                                    var countTime = response.data.split(':');
                                    countTime = countTime[0] + 'h' + countTime[1];
                                    if($('#countTime').exists()){
                                        $('#countTime').html(countTime);
                                    }else{
                                        $('.fc-toolbar .fc-left').append(' <div id="countTime">'+countTime+'</div>');
                                    }
                                }},{
                                    "start": currentStart.format('YYYY-MM-DD'),
                                    "end": currentEnd.format('YYYY-MM-DD')
                                });

                                var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/event/search/user/"+ $.Oda.Session.id, {callback : function(response){
                                    var events = [];
                                    for(var index in response.data){
                                        var event = {};
                                        var elt = response.data[index];
                                        event.start = elt.start;
                                        event.end = elt.end;
                                        event.id = elt.id;
                                        event.title = elt.patient_name_first + "." +  elt.patient_name_last.substr(0,1);
                                        events.push(event);
                                    }
                                    callback(events);
                                }},{
                                    "start": start.format('YYYY-MM-DD'),
                                    "end": end.format('YYYY-MM-DD')
                                });
                            },
                            eventMouseover: function(calEvent, jsEvent) {
                                console.log("eventMouseover");
                            },
                            eventMouseout: function(calEvent, jsEvent) {
                                console.log("eventMouseout");
                            },
                            eventClick: function(calEvent, jsEvent, view) {
                                $.Oda.App.Controller.Planning.dayClicked = {"date":calEvent.start, "jsEvent":jsEvent, "view":view, "cell" : $(this)};
                                $.Oda.App.Controller.Planning.editEvent(calEvent);
                            },
                            "viewRender": function(view, element){
                                console.log("viewRender");
                            }
                        })
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Planning.displayPlanning : " + er.message);
                        return null;
                    }
                },
                /**
                 * @returns {$.Oda.App.Controller.Planning}
                 */
                createEvent: function () {
                    try {
                        var strHtml = $.Oda.Display.TemplateHtml.create({
                            template : "formCreateEvent"
                            , scope : {}
                        });

                        $.Oda.Display.Popup.open({
                            "name" : "createEvent",
                            "size" : "lg",
                            "label" : $.Oda.I8n.get('planning','createEvent') + ', ' + $.Oda.App.Controller.Planning.dayClicked.date.format(),
                            "details" : strHtml,
                            "footer" : '<button type="button" oda-label="oda-main.bt-submit" oda-submit="submit" onclick="$.Oda.App.Controller.Planning.submitEvent();" class="btn btn-primary disabled" disabled>Submit</button >',
                            "callback" : function(){
                                var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/patient/", {callback : function(response){
                                    $.Oda.App.Controller.Planning.patients = response.data;
                                    for(var index in response.data){
                                        var elt = response.data[index];
                                        if(elt.active === '1'){
                                            $('#patientId').append('<option value="'+ elt.id +'">' + elt.name_first + ' ' + elt.name_last + '</option>')
                                        }
                                    }
                                }});

                                $.Oda.Scope.Gardian.add({
                                    id : "createEvent",
                                    listElt : ["startHour", "startMinute", "endHour", "endMinute", "patientId"],
                                    function : function(e){
                                        var padEndHour = $.Oda.Tooling.pad2($("#endHour").val());

                                        if( ($("#patientId").data("isOk"))
                                            && ($("#startHour").data("isOk")) && ($("#startMinute").data("isOk"))
                                            && ($("#endHour").data("isOk")) && ($("#endMinute").data("isOk"))
                                            && (($("#startHour").val()+$("#startMinute").val()) !== (padEndHour+$("#endMinute").val())) ){
                                            $("#submit").removeClass("disabled");
                                            $("#submit").removeAttr("disabled");
                                        }else{
                                            $("#submit").addClass("disabled");
                                            $("#submit").attr("disabled", true);
                                        }

                                        if( ($("#startHour").data("isOk")) && ($("#startMinute").data("isOk"))
                                            && ($("#endHour").data("isOk")) && ($("#endMinute").data("isOk"))
                                            && (($("#startHour").val()+$("#startMinute").val()) === (padEndHour+$("#endMinute").val()))
                                        ){
                                            $.Oda.Display.Notification.warning($.Oda.I8n.get('planning','conflictHours'));
                                        }
                                    }
                                });
                            }
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Planning.createEvent : " + er.message);
                        return null;
                    }
                },
                /**
                 * @returns {$.Oda.App.Controller.Planning}
                 */
                submitEvent: function () {
                    try {
                        var padStartHour = $.Oda.Tooling.pad2($("#startHour").val());
                        var start = $.Oda.App.Controller.Planning.dayClicked.date.format() + " " +  padStartHour + ":" + $("#startMinute").val() + ":00";
                        var padEndHour = $.Oda.Tooling.pad2($("#endHour").val());
                        var end = $.Oda.App.Controller.Planning.dayClicked.date.format() + " " +  padEndHour + ":" + $("#endMinute").val() + ":00";

                        var patientId = $('#patientId').val();
                        var patient = {};
                        for(var index in $.Oda.App.Controller.Planning.patients){
                            if($.Oda.App.Controller.Planning.patients[index].id === patientId){
                                patient = $.Oda.App.Controller.Planning.patients[index];
                                break;
                            }
                        }

                        var title = patient.name_first + " " + patient.name_last;
                        var location = patient.adress + " " + patient.city + " " + patient.code_postal + " france";

                        $.Oda.App.Controller.Planning.createAppointment({
                            callback: function (params) {
                                var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/event/", {type:'POST',callback : function(response){
                                    $.Oda.Display.Popup.close({name:"createEvent"});
                                    $('#calendar').fullCalendar( 'refetchEvents' );
                                }},{
                                    "patient_id": patientId,
                                    "start": start,
                                    "end": end,
                                    "user_id": $.Oda.Session.id,
                                    "author_id": $.Oda.Session.id,
                                    "googleId": params.googleId,
                                    "googleEtag": params.googleEtag,
                                    "googleHtmlLink": params.googleHtmlLink,
                                    "googleICalUID": params.googleICalUID
                                });
                            },
                            "start": start,
                            "end": end,
                            "title": title,
                            "location": location,
                            "comment": "comment"
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Planning.start : " + er.message);
                        return null;
                    }
                },
                /**
                 * @returns {$.Oda.App.Controller.Planning}
                 */
                editEvent: function (params) {
                    try {
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/event/"+params.id, {callback : function(response){
                            $.Oda.App.Controller.Planning.currentEvent = response.data;
                            var eventData = response.data;
                            var startHours = eventData.start.substr(11,2);
                            var startMinutes = eventData.start.substr(14,2);
                            var endHours = eventData.end.substr(11,2);
                            var endMinutes = eventData.end.substr(14,2);

                            var strHtml = $.Oda.Display.TemplateHtml.create({
                                template : "formEditEvent"
                                , scope : {
                                    "startHours": startHours,
                                    "startMinutes": startMinutes,
                                    "endHours": endHours,
                                    "endMinutes": endMinutes
                                }
                            });

                            var strFooter = "";
                            strFooter += '<button type="button" oda-label="oda-main.bt-delete" oda-submit="delete" onclick="$.Oda.App.Controller.Planning.deleteEvent({id:'+eventData.id+'});" class="btn btn-danger pull-left">oda-main.bt-delete</button >';
                            strFooter += '<button type="button" oda-label="oda-main.bt-submit" oda-submit="submit" onclick="$.Oda.App.Controller.Planning.submitEditEvent({id:'+eventData.id+'});" class="btn btn-primary disabled" disabled>Submit</button >';

                            $.Oda.Display.Popup.open({
                                "name" : "editEvent",
                                "size" : "lg",
                                "label" : $.Oda.I8n.get('planning','editEvent') + ' N°' + eventData.id,
                                "details" : strHtml,
                                "footer" : strFooter,
                                "callback" : function(){
                                    var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/patient/", {callback : function(response){
                                        $.Oda.App.Controller.Planning.patients = response.data;
                                        for(var index in response.data){
                                            var elt = response.data[index];
                                            if(elt.active === '1'){
                                                $('#patientId').append('<option value="'+ elt.id +'" '+((eventData.patient_id === elt.id)?'selected':'')+'>' + elt.name_first + ' ' + elt.name_last + '</option>')
                                            }
                                        }
                                        $.Oda.Scope.checkInputSelect({elt : $('#patientId')});
                                        $.Oda.App.Controller.Planning.displayListAddress();
                                    }});

                                    $.Oda.Scope.Gardian.add({
                                        id : "listAddress",
                                        listElt : ["patientId"],
                                        function : function(e){
                                            $.Oda.App.Controller.Planning.displayListAddress();
                                        }
                                    });

                                    $.Oda.Scope.Gardian.add({
                                        id : "gEditEvent",
                                        listElt : ["startHour", "startMinute", "endHour", "endMinute", "patientId", "addressId"],
                                        function : function(e){
                                            var padEndHour = $.Oda.Tooling.pad2($("#endHour").val());

                                            if( ($("#patientId").data("isOk"))
                                                && ($("#startHour").data("isOk")) && ($("#startMinute").data("isOk"))
                                                && ($("#endHour").data("isOk")) && ($("#endMinute").data("isOk"))
                                                && (($("#startHour").val()+$("#startMinute").val()) !== (padEndHour+$("#endMinute").val())) ){
                                                $("#submit").removeClass("disabled");
                                                $("#submit").removeAttr("disabled");
                                            }else{
                                                $("#submit").addClass("disabled");
                                                $("#submit").attr("disabled", true);
                                            }

                                            if( ($("#startHour").data("isOk")) && ($("#startMinute").data("isOk"))
                                                && ($("#endHour").data("isOk")) && ($("#endMinute").data("isOk"))
                                                && (($("#startHour").val()+$("#startMinute").val()) === (padEndHour+$("#endMinute").val()))
                                            ){
                                                $.Oda.Display.Notification.warning($.Oda.I8n.get('planning','conflictHours'));
                                            }
                                        }
                                    });
                                }
                            });
                        }});
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Planning.createEvent : " + er.message);
                        return null;
                    }
                },
                /**
                 * @returns {$.Oda.App.Controller.Planning}
                 */
                displayListAddress: function () {
                    try {
                        var elt = $('#patientId');
                        $("#divAddress").empty();
                        if(elt.val() !== ""){
                            var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/address/search/patient/"+elt.val(), {callback : function(response){
                                $.Oda.App.Controller.Planning.address = response.data;
                                if(response.data.length > 0){
                                    var strHtml = $.Oda.Display.TemplateHtml.create({
                                        template : "tplDivAddress"
                                        , scope : {
                                        }
                                    });
                                    $.Oda.Display.render({id:"divAddress",html:strHtml});
                                }
                                for(var index in response.data) {
                                    var elt = response.data[index];
                                    if($.Oda.App.Controller.Planning.currentEvent.address_id !== null){
                                        var html = '<option value="'+elt.id+'" '+(($.Oda.App.Controller.Planning.currentEvent.address_id === elt.id)?'selected':'')+'>'+elt.code+'</option>';
                                    }else{
                                        var html = '<option value="'+elt.id+'" '+((elt.address_id_default === elt.id)?'selected':'')+'>'+elt.code+'</option>';
                                    }
                                    $('#addressId').append(html);
                                }
                                $.Oda.Scope.checkInputSelect({elt : $('#addressId')});
                            }});
                        }
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Planning.displayListAddress : " + er.message);
                        return null;
                    }
                },
                /**
                 * @returns {$.Oda.App.Controller.Planning}
                 */
                submitEditEvent: function (params) {
                    try {
                        var padStartHour = $.Oda.Tooling.pad2($("#startHour").val());
                        var start = $.Oda.App.Controller.Planning.dayClicked.date.format('YYYY-MM-DD') + " " +  padStartHour + ":" + $("#startMinute").val() + ":00";
                        var padEndHour = $.Oda.Tooling.pad2($("#endHour").val());
                        var end = $.Oda.App.Controller.Planning.dayClicked.date.format('YYYY-MM-DD') + " " +  padEndHour + ":" + $("#endMinute").val() + ":00";

                        var patientId = $('#patientId').val();
                        var patient = {};
                        for(var index in $.Oda.App.Controller.Planning.patients){
                            if($.Oda.App.Controller.Planning.patients[index].id === patientId){
                                patient = $.Oda.App.Controller.Planning.patients[index];
                                break;
                            }
                        }

                        var addressId = $('#addressId').val();
                        var address = {};
                        for(var index in $.Oda.App.Controller.Planning.address){
                            if($.Oda.App.Controller.Planning.address[index].id === addressId){
                                address = $.Oda.App.Controller.Planning.address[index];
                                break;
                            }
                        }

                        var title = patient.name_first + " " + patient.name_last;
                        var location = address.adress + " " + address.city + " " + address.code_postal + " france";

                        $.Oda.App.Controller.Planning.updateAppointment({
                            callback: function () {
                                var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/event/"+params.id, {type:'PUT',callback : function(){
                                    $.Oda.Display.Popup.close({name:"editEvent"});
                                    $('#calendar').fullCalendar( 'refetchEvents' );
                                }},{
                                    "patient_id": patientId,
                                    "start": start,
                                    "end": end,
                                    "addressId": addressId
                                });
                            },
                            "googleId": $.Oda.App.Controller.Planning.currentEvent.googleId,
                            "start": start,
                            "end": end,
                            "title": title,
                            "location": location,
                            "comment": "comment"
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Planning.start : " + er.message);
                        return null;
                    }
                },
                /**
                 * @returns {$.Oda.App.Controller.Planning}
                 */
                deleteEvent: function (params) {
                    try {
                        $.Oda.App.Controller.Planning.deleteAppointment({
                            callback: function () {
                                var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/event/"+params.id, {type:'DELETE',callback : function(response){
                                    $.Oda.Display.Popup.close({name:"editEvent"});
                                    $('#calendar').fullCalendar( 'refetchEvents' );
                                }});
                            },
                            "googleId": $.Oda.App.Controller.Planning.currentEvent.googleId
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Planning.start : " + er.message);
                        return null;
                    }
                },
            }
        }
    };

    // Initialize
    _init();

})();
