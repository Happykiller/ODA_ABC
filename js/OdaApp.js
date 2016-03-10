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
                            var strHtml = $.Oda.Display.TemplateHtml.create({
                                template : "formEditPatient"
                                , scope : {
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
                }
            },
            "Planning": {
                "dayClicked": {},
                /**
                 * @returns {$.Oda.App.Controller.Planning}
                 */
                start: function () {
                    try {
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
                            , scope : {
                            }
                        });

                        $.Oda.Display.Popup.open({
                            "name" : "createEvent",
                            "size" : "lg",
                            "label" : $.Oda.I8n.get('planning','createEvent') + ', ' + $.Oda.App.Controller.Planning.dayClicked.date.format(),
                            "details" : strHtml,
                            "footer" : '<button type="button" oda-label="oda-main.bt-submit" oda-submit="submit" onclick="$.Oda.App.Controller.Planning.submitEvent();" class="btn btn-primary disabled" disabled>Submit</button >',
                            "callback" : function(){
                                var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/patient/", {callback : function(response){
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
                submitEvent: function () {
                    try {
                        var start = $.Oda.App.Controller.Planning.dayClicked.date.format() + " " +  $("#startHour").val() + ":" + $("#startMinute").val();
                        var padEndHour = $.Oda.Tooling.pad2($("#endHour").val());
                        var end = $.Oda.App.Controller.Planning.dayClicked.date.format() + " " +  padEndHour + ":" + $("#endMinute").val();

                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/event/", {type:'POST',callback : function(response){
                            $.Oda.Display.Popup.close({name:"createEvent"});
                            $('#calendar').fullCalendar( 'refetchEvents' );
                        }},{
                            "patient_id": $('#patientId').val(),
                            "start": start,
                            "end": end,
                            "user_id": $.Oda.Session.id,
                            "author_id": $.Oda.Session.id
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
                                "label" : $.Oda.I8n.get('planning','editEvent'),
                                "details" : strHtml,
                                "footer" : strFooter,
                                "callback" : function(){
                                    var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/patient/", {callback : function(response){
                                        for(var index in response.data){
                                            var elt = response.data[index];
                                            if(elt.active === '1'){
                                                $('#patientId').append('<option value="'+ elt.id +'" '+((eventData.id===elt.id)?'selected':'')+'>' + elt.name_first + ' ' + elt.name_last + '</option>')
                                            }
                                        }
                                        $.Oda.Scope.checkInputSelect({elt : $('#patientId')});
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
                        }});
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Planning.createEvent : " + er.message);
                        return null;
                    }
                },
                submitEditEvent: function (params) {
                    try {
                        var start = $.Oda.App.Controller.Planning.dayClicked.date.format('YYYY-MM-DD') + " " +  $("#startHour").val() + ":" + $("#startMinute").val();
                        var padEndHour = $.Oda.Tooling.pad2($("#endHour").val());
                        var end = $.Oda.App.Controller.Planning.dayClicked.date.format('YYYY-MM-DD') + " " +  padEndHour + ":" + $("#endMinute").val();

                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/event/"+params.id, {type:'PUT',callback : function(response){
                            $.Oda.Display.Popup.close({name:"editEvent"});
                            $('#calendar').fullCalendar( 'refetchEvents' );
                        }},{
                            "patient_id": $('#patientId').val(),
                            "start": start,
                            "end": end
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Planning.start : " + er.message);
                        return null;
                    }
                },
                deleteEvent: function (params) {
                    try {
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/event/"+params.id, {type:'DELETE',callback : function(response){
                            $.Oda.Display.Popup.close({name:"editEvent"});
                            $('#calendar').fullCalendar( 'refetchEvents' );
                        }});
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
