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
                        { "elt" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/fullcalendar/dist/fullcalendar.min.js", "type" : "script"},
                        { "elt" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/fullcalendar/dist/lang/fr.js", "type" : "script"},
                        { "elt" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/fullcalendar/dist/lang/es.js", "type" : "script"},
                        { "elt" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/fullcalendar/dist/lang/it.js", "type" : "script"}
                    ]
                });

                $.Oda.Router.addDependencies("jsToPdf", {
                    ordered : true,
                    "list" : [
                        { "elt" : "js/jspdf.min.js", "type" : "script"}
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

                $.Oda.Router.addRoute("synth_user_patient", {
                    "path" : "partials/synth_user_patient.html",
                    "title" : "synthUserPatient.title",
                    "urls" : ["synth_user_patient"],
                    "middleWares" : ["support","auth"],
                    "dependencies" : ["jsToPdf"]
                });

                $.Oda.Router.addRoute("reportDetailMonth", {
                    "path" : "partials/reportDetailMonth.html",
                    "title" : "reportDetailMonth.title",
                    "urls" : ["reportDetailMonth"],
                    "middleWares" : ["support","auth"],
                    "dependencies" : ["jsToPdf"]
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
                        $.Oda.App.Controller.Home.displayHeatMap();
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Home.start : " + er.message);
                        return null;
                    }
                },
                /**
                 * @returns {$.Oda.App.Controller.Home}
                 */
                displayHeatMap : function () {
                    try {
                        var startMonth = moment().subtract(1, "month").startOf('month');
                        var endMonth = moment().add(1, "month").endOf('month');

                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/report/heat/"+ $.Oda.Session.id, {callback : function(response){
                            var datas = {};
                            for(var index in response.data){
                                var date = new Date(response.data[index].date).getTime() / 1000;
                                datas[date] = parseInt(response.data[index].count);
                            }

                            var div = $('#divHeatMap');
                            var cellSize = Math.ceil(div.width() / 23);
                            var cal = new CalHeatMap();
                            cal.init({
                                itemSelector: "#divHeatMap",
                                domain: "month",
                                subDomain: "x_day",
                                start: startMonth.toDate(),
                                cellSize: cellSize,
                                range: 3,
                                data: datas,
                                tooltip: true,
                                highlight: ["now"],
                                weekStartOnMonday: true,
                                subDomainTextFormat: function(date ,value) {
                                    var str;
                                    if(cellSize >= 30){
                                        str = moment(date).format('dd D');
                                    }else if (cellSize >= 20 && cellSize < 30){
                                        var day = moment(date).format('dd').substr(0,1);
                                        var nu = moment(date).format('D');
                                        str = day+nu;
                                    }else if(cellSize >= 12 && cellSize < 20){
                                        str = moment(date).format('D');
                                    }
                                    return str;
                                },
                                legend: [4, 6, 10]
                            });
                        }},{
                            start: startMonth.format('YYYY-MM-DD'),
                            end: endMonth.format('YYYY-MM-DD')
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Home.displayHeatMap : " + er.message);
                        return null;
                    }
                },
            },
            "Patients": {
                patientsNeedRefresh: false,
                "currentPatient": {},
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
                                        header: $.Oda.I8n.get('patients','color'),
                                        align: 'center',
                                        size: '100px',
                                        value: function(data, type, full, meta, row){
                                            return '<a class="btn btn-default btn-xs bg-'+row.color+'">&nbsp;&nbsp;&nbsp;</a>';
                                        }
                                    },
                                    {
                                        header: "Actif",
                                        size: '100px',
                                        value: function(data, type, full, meta, row){
                                            return (row.active==="1")?"Actif":"Inactif";
                                        }
                                    },
                                    {
                                        header: "Action",
                                        align: 'center',
                                        size: '100px',
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
                            $.Oda.App.Controller.Patients.currentPatient = response.data;
                            var patientId = response.data.id;
                            var strHtml = $.Oda.Display.TemplateHtml.create({
                                template : "formEditPatient"
                                , scope : {
                                    "id": response.data.id,
                                    "firstName": response.data.name_first,
                                    "lastName": response.data.name_last,
                                    "checked": (response.data.active==='1')?"checked":"",
                                    "color": response.data.color
                                }
                            });

                            $.Oda.Display.Popup.open({
                                "name" : "pEditPatient",
                                "size" : "lg",
                                "label" : $.Oda.I8n.get('patients','editPatient'),
                                "details" : strHtml,
                                "callback" : function(){
                                    $('.selectpicker').selectpicker();

                                    $('#pEditPatient').on('hidden.bs.modal', function (e) {
                                        if($.Oda.App.Controller.Patients.patientsNeedRefresh){
                                            $.Oda.App.Controller.Patients.patientsNeedRefresh = false;
                                            $.Oda.App.Controller.Patients.displayPatients();
                                        }
                                    })

                                    $.Oda.Scope.Gardian.add({
                                        id : "gEditPatient",
                                        listElt : ["firstName", "lastName", "active"],
                                        function : function(e){
                                            if( ($("#firstName").data("isOk")) && ($("#lastName").data("isOk")) ){
                                                $("#submit").btEnable();
                                            }else{
                                                $("#submit").btDisable();
                                            }
                                        }
                                    });
                                    $.Oda.App.Controller.Patients.displayAddress({patientId: patientId});
                                    $.Oda.App.Controller.Patients.displayMemos();
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
                            $.Oda.App.Controller.Patients.patientsNeedRefresh = false;
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
                 * @param p_params.id
                 * @returns {$.Oda.Controller.Patients}
                 */
                changeColor : function (p_params) {
                    try {
                        var $color = $('#color');
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/patient/"+p_params.id+"/color/", {type: 'put', callback : function(response){
                            $.Oda.Display.Notification.successI8n('patients.changeColorSuccess');
                            $.Oda.App.Controller.Patients.patientsNeedRefresh = true;
                        }},{
                            "color": $color.val()
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Controller.Patients.changeColor : " + er.message);
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
                                        "bookmark": (elt.address_id_default !== elt.id)?'<button type="button" class="btn btn-primary btn-xs" onclick="$.Oda.App.Controller.Patients.setDefaultAddress({addressId:'+elt.id+', patientId:'+p_params.patientId+'});"><span class="glyphicon glyphicon-star" aria-hidden="true"></span></button>':'',
                                        "edit": ' <button type="button" class="btn btn-primary btn-xs" onclick="$.Oda.App.Controller.Patients.editAddress({id:'+elt.id+'});"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span></button>',
                                        "remove": ' <button type="button" class="btn btn-danger btn-xs" onclick="$.Oda.App.Controller.Patients.removeAddress({addressId:'+elt.id+', patientId:'+p_params.patientId+'});"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>'
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
                 * @param p_params.patientId
                 * @returns {$.Oda.App.Controller.Patients}
                 */
                editAddress : function (params) {
                    try {
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/address/"+params.id, {callback : function(response){
                            var strHtml = $.Oda.Display.TemplateHtml.create({
                                template : "tlpEditAddress"
                                , scope : response.data
                            });

                            $.Oda.Display.Popup.open({
                                "name": "popEditAddress",
                                "label": $.Oda.I8n.get('patients', 'editAddress', {variables: {id: params.id}}),
                                "details": strHtml,
                                "footer": '<button type="button" oda-label="oda-main.bt-submit" oda-submit="submitEdit" onclick="$.Oda.App.Controller.Patients.submitEditAddress({id: '+params.id+'});" class="btn btn-primary disabled" disabled>Submit</button >',
                                "callback" : function(){
                                    $.Oda.Scope.Gardian.add({
                                        id : "gEditAddress",
                                        listElt : ["addressTitle", "street", "city", "postCode"],
                                        function : function(e){
                                            if( ($("#addressTitle").data("isOk")) && ($("#street").data("isOk")) && ($("#city").data("isOk")) && ($("#postCode").data("isOk")) ){
                                                $("#submitEdit").btEnable();
                                            }else{
                                                $("#submitEdit").btDisable();
                                            }
                                        }
                                    });
                                }
                            });

                        }});
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Patients.editAddress : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} p_params
                 * @param p_params.id
                 * @returns {$.Oda.App.Controller.Patients}
                 */
                submitEditAddress : function (params) {
                    try {
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/address/"+params.id, {type: 'PUT', callback : function(response){
                            $.Oda.Display.Popup.close({name:"popEditAddress"});
                            $.Oda.App.Controller.Patients.displayAddress({
                                "patientId" : $.Oda.App.Controller.Patients.currentPatient.id
                            });
                        }},{
                            "title": $('#addressTitle').val(),
                            "street": $('#street').val(),
                            "city": $('#city').val(),
                            "postCode": $('#postCode').val()
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Patients.submitEditAddress : " + er.message);
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
                /**
                 * @returns {$.Oda.App.Controller.Patients}
                 */
                displayMemos : function () {
                    try {
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/memo/search/patient/"+$.Oda.App.Controller.Patients.currentPatient.id, {callback : function(response){
                            $.Oda.Display.Table.createDataTable({
                                target: 'divTabMemos',
                                data: response.data,
                                option: {
                                    "aaSorting": [[0, 'desc']],
                                },
                                attribute: [
                                    {
                                        header: "Id",
                                        size: "50px",
                                        align: "center",
                                        value: function(data, type, full, meta, row){
                                            return row.id;
                                        }
                                    },
                                    {
                                        header: "Content",
                                        value: function(data, type, full, meta, row){
                                            var content = row.content;
                                            if(content.length > 50){
                                                content = content.substr(0,50) + " ...";
                                            }
                                            return content;
                                        }
                                    },
                                    {
                                        header: "Lu",
                                        size: "50px",
                                        value: function(data, type, full, meta, row){
                                            return (row.read==="1")?"Lu":"Non lu";
                                        }
                                    },
                                    {
                                        header: "Action",
                                        size: "75px",
                                        align: 'center',
                                        value: function(data, type, full, meta, row){
                                            var strHtml = '';
                                            if(row.read !== "1"){
                                                strHtml += ' <button type="button" class="btn btn-success btn-xs" onclick="$.Oda.App.Controller.Patients.readMemo({id:'+row.id+', value: 1});"><span class="glyphicon glyphicon-check" aria-hidden="true"></span></button>';
                                            }else{
                                                strHtml += ' <button type="button" class="btn btn-warning btn-xs" onclick="$.Oda.App.Controller.Patients.readMemo({id:'+row.id+', value: 0});"><span class="glyphicon glyphicon-unchecked" aria-hidden="true"></span></button>';
                                            }
                                            strHtml += ' <a onclick="$.Oda.App.Controller.Patients.editMemo({id:'+row.id+'});" class="btn btn-primary btn-xs"><span class="glyphicon glyphicon-edit"></span></a>';
                                            strHtml += ' <button type="button" class="btn btn-danger btn-xs" onclick="$.Oda.App.Controller.Patients.removeMemo({id:'+row.id+'});"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>';
                                            return strHtml;
                                        }
                                    }
                                ]
                            })
                        }});
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Patients.displayMemos : " + er.message);
                        return null;
                    }
                },
                /**
                 * @returns {$.Oda.App.Controller.Patients}
                 */
                displayNewMemo : function () {
                    try {
                        var strHtml = $.Oda.Display.TemplateHtml.create({
                            template : "tlpNewMemo"
                            , scope : {}
                        });
                        $('#divNewMemo').html(strHtml).fadeIn();
                        $.Oda.Display.render({
                            "id": "divBtDemo",
                            "html": '<button type="button" oda-label="patients.submitMemo" onclick="$.Oda.App.Controller.Patients.submitMemo();" class="btn btn-primary">submitMemo</button> <button type="button" oda-label="patients.cancelMemo" onclick="$.Oda.App.Controller.Patients.cancelMemo();" class="btn btn-secondary">cancelMemo</button>'
                        });
                        $('#downCount').html(255);
                        $('#newMemo').keyup(function() {
                            var length = $(this).val().length;
                            var RestLength = 255-length;
                            $('#downCount').html(RestLength);
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Patients.displayNewMemo : " + er.message);
                        return null;
                    }
                },
                /**
                 * @returns {$.Oda.App.Controller.Patients}
                 */
                submitMemo : function () {
                    try {
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/memo/", {type: 'POST', callback : function(response){
                            $('#divNewMemo').hide();
                            $('#newMemo').empty();
                            $('#downCount').html(255);
                            $.Oda.Display.render({
                                "id": "divBtDemo",
                                "html": '<button type="button" oda-label="patients.newMemo" onclick="$.Oda.App.Controller.Patients.displayNewMemo();" class="btn btn-primary">newMemo</button>'
                            });
                            $.Oda.App.Controller.Patients.displayMemos();
                        }},{
                            "patient_id": $.Oda.App.Controller.Patients.currentPatient.id,
                            "content": $('#newMemo').val(),
                            "author_id": $.Oda.Session.id
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Patients.submitMemo : " + er.message);
                        return null;
                    }
                },
                /**
                 * @returns {$.Oda.App.Controller.Patients}
                 */
                cancelMemo : function () {
                    try {
                        $('#divNewMemo').hide();
                        $('#newMemo').empty();
                        $('#downCount').html(255);
                        $.Oda.Display.render({
                            "id": "divBtDemo",
                            "html": '<button type="button" oda-label="patients.newMemo" onclick="$.Oda.App.Controller.Patients.displayNewMemo();" class="btn btn-primary">newMemo</button>'
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Patients.submitMemo : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} p_params
                 * @param p_params.id
                 * @returns {$.Oda.App.Controller.Patients}
                 */
                removeMemo : function (p_params) {
                    try {
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/memo/"+p_params.id, {type: 'DELETE', callback : function(response){
                            $.Oda.App.Controller.Patients.displayMemos();
                        }});
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Patients.removeMemo : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} p_params
                 * @param p_params.id
                 * @param p_params.value
                 * @returns {$.Oda.App.Controller.Patients}
                 */
                readMemo : function (p_params) {
                    try {
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/memo/"+p_params.id+"/read", {type: 'PUT', callback : function(response){
                            $.Oda.App.Controller.Patients.displayMemos();
                        }},{
                            "value": p_params.value
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Patients.readMemo : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} params
                 * @param params.id
                 * @returns {$.Oda.App.Controller.Patients}
                 */
                editMemo : function (params) {
                    try {
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/memo/"+params.id, {callback : function(response){
                            var strHtml = $.Oda.Display.TemplateHtml.create({
                                template : "tlpEditMemo"
                                , scope : response.data
                            });

                            $.Oda.Display.Popup.open({
                                "name": "popEditMemo",
                                "label": $.Oda.I8n.get('patients', 'editMemo', {variables: {id: params.id}}),
                                "details": strHtml,
                                "footer": '<button type="button" oda-label="oda-main.bt-submit" oda-submit="submitEdit" onclick="$.Oda.App.Controller.Patients.submitEditMemo({id: '+params.id+'});" class="btn btn-primary disabled" disabled>Submit</button >',
                                "callback" : function(){
                                    var length = response.data.content.length;
                                    var RestLength = 255-length;
                                    $('#downCount').html(RestLength);
                                    $('#editMemo').keyup(function() {
                                        var length = $(this).val().length;
                                        var RestLength = 255-length;
                                        $('#downCount').html(RestLength);
                                        if(RestLength > 0){
                                            $("#submitEdit").btEnable();
                                        }else{
                                            $("#submitEdit").btDisable();
                                        }
                                    });
                                }
                            });

                        }});
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Patients.editMemo : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} p_params
                 * @param params.id
                 * @returns {$.Oda.App.Controller.Patients}
                 */
                submitEditMemo : function (params) {
                    try {
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/memo/"+params.id, {type: 'PUT', callback : function(response){
                            $.Oda.Display.Popup.close({name:"popEditMemo"});
                            $.Oda.App.Controller.Patients.displayMemos();
                        }},{
                            "content": $('#editMemo').val()
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Patients.submitEditMemo : " + er.message);
                        return null;
                    }
                },
            },
            "Planning": {
                "dayClicked": {},
                "currentEvent": {},
                "patients": [],
                "address": [],
                "actionsType": [],
                "actionsSubType": [],
                /**
                 * @returns {$.Oda.App.Controller.Planning}
                 */
                start: function () {
                    try {
                        $.Oda.App.Controller.Planning.sessionGoogleStart();
                        $.Oda.App.Controller.Planning.displayPlanning();
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/actions/type/", {callback : function(response){
                            $.Oda.App.Controller.Planning.actionsType = response.data;
                        }});
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/actions/sub_type/", {callback : function(response){
                            $.Oda.App.Controller.Planning.actionsSubType = response.data;
                        }});
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
                                var re = /^btDay-/gi;
                                var patt = new RegExp(re);
                                if(!((jsEvent.target.id !== undefined) && patt.test(jsEvent.target.id))){
                                    $.Oda.App.Controller.Planning.dayClicked = {"date":date, "jsEvent":jsEvent, "view":view, "cell" : $(this)};
                                    $.Oda.App.Controller.Planning.createEvent();
                                }
                            },
                            eventOrder: 'eventStart',
                            events: function(start, end, timezone, callback) {

                                var currentStart;
                                if(start.format('DD') !== '01'){
                                    currentStart = moment(new Date(start.toDate().getFullYear(), start.toDate().getMonth() + 1, 1));
                                }else{
                                    currentStart = start;
                                }

                                var currentEnd = moment(currentStart).endOf('month');

                                var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/report/count_time/"+ $.Oda.Session.id, {callback : function(response){
                                    var countTime = response.data.split(':');
                                    countTime = countTime[0] + 'h' + countTime[1];
                                    if($('#countTime').exists()){
                                        $('#countTime').html(countTime);
                                    }else{
                                        $('.fc-toolbar .fc-left').append(' <span>Temps avec patient : </span><div id="countTime">'+countTime+'</div><span>, </span><div id="trajetInfo"></div>');
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
                                        event.className = 'bg-' + elt.patient_color;
                                        events.push(event);
                                    }
                                    callback(events);
                                }},{
                                    "start": start.format('YYYY-MM-DD'),
                                    "end": end.format('YYYY-MM-DD')
                                });

                                $.Oda.App.Controller.Planning.calcTrajet({
                                    "start": currentStart.format('YYYY-MM-DD'),
                                    "end": currentEnd.format('YYYY-MM-DD')
                                });
                            },
                            eventMouseover: function(calEvent, jsEvent) {
                                //console.log("eventMouseover");
                            },
                            eventMouseout: function(calEvent, jsEvent) {
                                //console.log("eventMouseout");
                            },
                            eventClick: function(calEvent, jsEvent, view) {
                                $.Oda.App.Controller.Planning.dayClicked = {"date":calEvent.start, "jsEvent":jsEvent, "view":view, "cell" : $(this)};
                                $.Oda.App.Controller.Planning.editEvent(calEvent);
                            },
                            viewRender: function(view, element){
                                $.Oda.App.Controller.Planning.renderWeekBt({start: view.start});
                                $.Oda.App.Controller.Planning.renderDayBt({start: view.start});
                            }
                        })
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Planning.displayPlanning : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} params
                 * @param {MomentJs} params.start
                 * @returns {$.Oda.App.Controller.Planning}
                 */
                renderWeekBt: function (params) {
                    try {
                        $('td[class="fc-week-number"]').each(function(){
                            var elt = $(this);
                            var week = elt.text();
                            elt.html('<a href="javascript:$.Oda.App.Controller.Planning.viewWeekDetails({year: '+params.start.format('YYYY')+', week: '+week+'});" class="btn btn-primary btn-xs">'+week+'</a>')
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Planning.renderWeekBt. : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} params
                 * @param {MomentJs} params.start
                 * @returns {$.Oda.App.Controller.Planning}
                 */
                renderDayBt: function (params) {
                    try {
                        $('td .fc-day-number').each(function(){
                            var elt = $(this);
                            var day = elt.text();
                            var date = elt.data("date");
                            elt.html('<a id="btDay-'+date+'" href="javascript:$.Oda.App.Controller.Planning.viewDayDetails({date: \''+date+'\'});" type="button" class="btn btn-primary btn-xs">'+day+'</a>')
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Planning.renderDayBt. : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} params
                 * @param {MomentJs} params.date
                 * @returns {$.Oda.App.Controller.Planning}
                 */
                viewDayDetails: function (params) {
                    try {
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest + "api/rest/report/trajet/" + $.Oda.Session.id, {callback: function (response) {

                            var strHtmlTrajet = "";
                            for(var index in response.data){
                                var trajet = response.data[index];
                                if(index === '0'){
                                    strHtmlTrajet += '|-' + trajet.address_label_ori + '<br>';
                                }
                                strHtmlTrajet += '|' + '<br>',
                                strHtmlTrajet += '|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + trajet.distance + ' - ' + trajet.duration + '<br>',
                                strHtmlTrajet += '|' + '<br>',
                                strHtmlTrajet += '|-' + trajet.address_label_dest + '<br>';
                            }

                            var report = $.Oda.App.Tooling.calcReportTrajet({listTrajet:response.data});
                            var strHtml = $.Oda.Display.TemplateHtml.create({
                                template: "dayDetailsTpl",
                                scope: {
                                    time: report.timeDisplay,
                                    distance: report.distanceDisplay,
                                    timeline: strHtmlTrajet
                                }
                            });
                            $.Oda.Display.Popup.open({
                                "name" : "dayDetails",
                                "label" : $.Oda.I8n.get('planning','dayDetails',{variables: {day : params.date}}),
                                "details" : strHtml,
                                "callback" : function(){
                                    var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/report/count_time/"+ $.Oda.Session.id, {callback : function(response){
                                        var countTime = response.data.split(':');
                                        countTime = countTime[0] + 'h' + countTime[1];
                                        $('#dayCountTime').html(countTime);
                                    }},{
                                        "start": params.date,
                                        "end": params.date
                                    });
                                }
                            });
                        }}, {
                            "start": params.date,
                            "end": params.date
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Planning.renderDayBt. : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} p_params
                 * @param {int} p_params.year
                 * @param {int} p_params.week
                 * @returns {$.Oda.App.Controller.Planning}
                 */
                viewWeekDetails : function (p_params) {
                    try {
                        var start = moment().day("Monday").year(p_params.year).week(p_params.week).subtract(6, 'days').format('YYYY-MM-DD');
                        var end = moment().day("Monday").year(p_params.year).week(p_params.week).format('YYYY-MM-DD');
                        if($.Oda.Google.Map.service !== undefined) {
                            var call = $.Oda.Interface.callRest($.Oda.Context.rest + "api/rest/report/trajet/" + $.Oda.Session.id, {callback: function (response) {
                                var report = $.Oda.App.Tooling.calcReportTrajet({listTrajet:response.data});
                                var strHtml = $.Oda.Display.TemplateHtml.create({
                                    template: "weekDetailsTpl",
                                    scope: {
                                        time: report.timeDisplay,
                                        distance: report.distanceDisplay
                                    }
                                });
                                $.Oda.Display.Popup.open({
                                    "name" : "weekDetails",
                                    "label" : $.Oda.I8n.get('planning','weekDetails',{variables: {week : p_params.week}}),
                                    "details" : strHtml,
                                    "callback" : function(){
                                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/report/count_time/"+ $.Oda.Session.id, {callback : function(response){
                                            var countTime = response.data.split(':');
                                            countTime = countTime[0] + 'h' + countTime[1];
                                            $('#weekCountTime').html(countTime);
                                        }},{
                                            "start": start,
                                            "end": end
                                        });
                                    }
                                });
                            }}, {
                                "start": start,
                                "end": end
                            });
                        }
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Planning.viewWeekDetails : " + er.message);
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
                                            $('#patientId').append('<option value="'+ elt.id +'">' + elt.name_first + ' ' + elt.name_last + ( (elt.address_id_default===null)?' (Pas d\'adresse)':'' ) + '</option>')
                                        }
                                    }
                                }});

                                $.Oda.Scope.Gardian.add({
                                    id : "onChangePatient",
                                    listElt : ["patientId"],
                                    function : function(e){
                                        $('#divMemos').html('');
                                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/memo/search/patient/"+$('#patientId').val(), {callback : function(response){
                                            var strBody = "";

                                            for(var index in response.data){
                                                var elt = response.data[index];
                                                var content = elt.content;
                                                if(content.length > 50){
                                                    content = content.substr(0,50) + " ...";
                                                }
                                                strBody += '<tr><td>' + elt.id + '</td><td>' + content + '</td>';
                                            }

                                            var strHtml = $.Oda.Display.TemplateHtml.create({
                                                template : "tplDivMemos"
                                                , scope : {
                                                    bodyContent: strBody
                                                }
                                            });
                                            $('#divMemos').html(strHtml);
                                        }}, {
                                            active: 1,
                                            read: 0
                                        });
                                    }
                                });

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
                        var location = null;
                        if(patient.address_id_default !== null){
                            location = patient.adress + " " + patient.city + " " + patient.code_postal + " france";
                        }

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
                                                $('#patientId').append('<option value="'+ elt.id +'" '+((eventData.patient_id === elt.id)?'selected':'')+'>' + elt.name_first + ' ' + elt.name_last + ( (elt.address_id_default===null)?' (Pas d\'adresse)':'' ) + '</option>')
                                            }
                                        }
                                        $.Oda.Scope.checkInputSelect({elt : $('#patientId')});
                                        $.Oda.App.Controller.Planning.displayListAddress();
                                    }});

                                    $.Oda.App.Controller.Planning.displayMemos({patientId: eventData.patient_id});
                                    $.Oda.App.Controller.Planning.displayAction();

                                    tinymce.init({
                                        selector: '#eventNote',
                                        init_instance_callback: function(editor){
                                            tinymce.get('eventNote').setContent(eventData.note);
                                        },
                                        setup: function (editor) {
                                            editor.on('keyup', function (e) {
                                                $.Oda.Scope.Gardian.findByElt({id:'note'});
                                            });
                                        }
                                    });

                                    $('#editEvent').on('hidden.bs.modal', function () {
                                        if(tinymce.get('eventNote') !== null){
                                            tinymce.get('eventNote').remove();
                                        }
                                    });

                                    $.Oda.Scope.Gardian.add({
                                        id : "listAddress",
                                        listElt : ["patientId"],
                                        function : function(e){
                                            $.Oda.App.Controller.Planning.displayListAddress();
                                            $.Oda.App.Controller.Planning.displayMemos({patientId: $('#patientId').val()})
                                        }
                                    });

                                    $.Oda.Scope.Gardian.add({
                                        id : "gEditEvent",
                                        listElt : ["startHour", "startMinute", "endHour", "endMinute", "patientId", "addressId", "note"],
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
                 * @param {Object} p_params
                 * @param p_params.patientId
                 * @returns {$.Oda.App.Controller.Planning}
                 */
                displayMemos : function (p_params) {
                    try {
                        $('#divEditMemos').hide();
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/memo/search/patient/"+p_params.patientId, {callback : function(response){
                            if(response.data.length > 0){
                                $('#divEditMemos').show();
                                $("#tabEditMemos > tbody").empty();
                                for(var index in response.data) {
                                    var elt = response.data[index];

                                    var strHtml = "";
                                    strHtml += '<tr>';
                                    strHtml += '<td>'+elt.id+'</td>';
                                    var content = elt.content;
                                    if(content.length > 50){
                                        content = content.substr(0,50) + " ...";
                                    }
                                    strHtml += '<td>'+content+'</td>';
                                    strHtml += '<td><button type="button" class="btn btn-success btn-xs" onclick="$.Oda.App.Controller.Planning.readMemo({id:'+elt.id+', value: 1, patientId: '+p_params.patientId+'});"><span class="glyphicon glyphicon-check" aria-hidden="true"></span></button></td>';
                                    strHtml += '</tr>';

                                    $('#tabEditMemos > tbody:last-child').append(strHtml);
                                }
                            }
                        }},{
                            active: 1,
                            read: 0
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Planning.displayMemos : " + er.message);
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
                        var location = null;
                        if($.isEmptyObject(address)){
                            location = address.adress + " " + address.city + " " + address.code_postal + " france";
                        }

                        $.Oda.App.Controller.Planning.updateAppointment({
                            callback: function () {
                                var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/event/"+params.id, {type:'PUT',callback : function(){
                                    tinymce.get('eventNote').remove();
                                    $.Oda.Display.Popup.close({name:"editEvent"});
                                    $('#calendar').fullCalendar( 'refetchEvents' );
                                }},{
                                    "patient_id": patientId,
                                    "start": start,
                                    "end": end,
                                    "addressId": addressId,
                                    "note": tinymce.get('eventNote').getContent()
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
                 * @param {Object} p_params
                 * @param p_params.id
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
                        $.Oda.Log.error("$.Oda.App.Controller.Planning.deleteEvent : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} p_params
                 * @param p_params.id
                 * @param p_params.value
                 * @param p_params.patientId
                 * @returns {$.Oda.App.Controller.Planning}
                 */
                readMemo : function (p_params) {
                    try {
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/memo/"+p_params.id+"/read", {type: 'PUT', callback : function(response){
                            $.Oda.App.Controller.Planning.displayMemos({patientId: p_params.patientId});
                        }},{
                            "value": p_params.value
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Planning.readMemo : " + er.message);
                        return null;
                    }
                },
                /**
                 * @returns {$.Oda.App.Controller.Planning}
                 */
                /**
                 * @returns {$.Oda.App.Controller.Planning}
                 */
                displayAction: function () {
                    try {
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/actions/search/event/", {callback : function(response){
                            $("#tabActions > tbody").empty();
                            for(var index in response.data) {
                                var elt = response.data[index];
                                if(elt.active === "1"){
                                    var comment = elt.comment;
                                    if(comment.length > 50){
                                        comment = comment.substr(0,50) + " ...";
                                    }
                                    var strHtml = $.Oda.Display.TemplateHtml.create({
                                        template : "tlpRowTabActions"
                                        , scope : {
                                            "id": elt.id,
                                            "type": elt.action_type_label,
                                            "subType": elt.action_sub_type_label,
                                            "comment": comment,
                                            "remove": ' <button type="button" class="btn btn-danger btn-xs" onclick="$.Oda.App.Controller.Planning.removeAction({id:'+elt.id+'});"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>'
                                        }
                                    });
                                    $('#tabActions > tbody:last-child').append(strHtml);
                                }
                            }
                        }},{
                            "event_id": $.Oda.App.Controller.Planning.currentEvent.id
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Planning.displayAction : " + er.message);
                        return null;
                    }
                },
                /**
                 * @returns {$.Oda.App.Controller.Planning}
                 */
                formAction: function () {
                    try {
                        var strTypes = "";
                        for(var index in $.Oda.App.Controller.Planning.actionsType){
                            var elt = $.Oda.App.Controller.Planning.actionsType[index];
                            if(elt.active === '1'){
                                strTypes += '<option value="'+ elt.id +'">' + elt.label + '</option>';
                            }
                        }
                        var strHtml = $.Oda.Display.TemplateHtml.create({
                            template : "tlpNewAction"
                            , scope : {
                                "types": strTypes
                            }
                        });
                        $.Oda.Display.render({
                            "id": "divActionNew",
                            "html": strHtml
                        });
                        $.Oda.Display.render({
                            "id": "divBtActionNew",
                            "html": '<button id="btSubmitNewAction" type="button" oda-label="oda-main.bt-submit" onclick="$.Oda.App.Controller.Planning.submitAction();" class="btn btn-primary disabled" disabled>oda-main.submit</button> <button type="button" oda-label="patients.cancelMemo" onclick="$.Oda.App.Controller.Planning.cancelAction();" class="btn btn-secondary">cancelMemo</button>'
                        });
                        $('#divActionNew').fadeIn();

                        $.Oda.Scope.Gardian.add({
                            id: "gChangeActionId",
                            listElt: ["typeActionId"],
                            function: function (e) {
                                if (($("#typeActionId").data("isOk"))) {
                                    var strSubTypes = "";
                                    for (var index in $.Oda.App.Controller.Planning.actionsSubType) {
                                        var elt = $.Oda.App.Controller.Planning.actionsSubType[index];
                                        if ((elt.active === '1') && (elt.action_type_id === $('#typeActionId').val())) {
                                            strSubTypes += '<option value="' + elt.id + '">' + elt.label + '</option>';
                                        }
                                    }
                                    var strHtml = $.Oda.Display.TemplateHtml.create({
                                        template: "tlpActionSubType"
                                        , scope: {
                                            "subTypes": strSubTypes
                                        }
                                    });
                                    $.Oda.Display.render({
                                        "id": "divActionSubType",
                                        "html": strHtml
                                    });

                                    for (var index in $.Oda.App.Controller.Planning.actionsType) {
                                        var elt = $.Oda.App.Controller.Planning.actionsType[index];
                                        if (elt.id === $('#typeActionId').val()) {
                                            $('#newActionComment').prop('placeholder', elt.placeholder);
                                        }
                                    }
                                }else{
                                    $('#divActionSubType').html('');
                                }
                            }
                        });

                        $.Oda.Scope.Gardian.add({
                            id : "gNewAction",
                            listElt : ["typeActionId", "newActionComment","actionSubTypeId"],
                            function : function(e){
                                if( ($("#typeActionId").data("isOk")) && ($("#actionSubTypeId").data("isOk")) ){
                                    $("#btSubmitNewAction").btEnable();
                                }else{
                                    $("#btSubmitNewAction").btDisable();
                                }
                            }
                        });

                        $('#downCount').html(255);
                        $('#newActionComment').keyup(function() {
                            var length = $(this).val().length;
                            var RestLength = 255-length;
                            $('#downCount').html(RestLength);
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Planning.formAction : " + er.message);
                        return null;
                    }
                },
                /**
                 * @returns {$.Oda.App.Controller.Planning}
                 */
                submitAction: function () {
                    try {
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/actions/", {type:'POST',callback : function(){
                            $('#divActionNew').hide();
                            $('#newActionComment').empty();
                            $('#downCount').html(255);
                            $.Oda.Display.render({
                                "id": "divBtActionNew",
                                "html": '<button type="button" oda-label="planning.actionNew" onclick="$.Oda.App.Controller.Planning.formAction();" class="btn btn-primary">actionNew</button>'
                            });
                            $.Oda.App.Controller.Planning.displayAction();
                        }},{
                            "event_id": $.Oda.App.Controller.Planning.currentEvent.id,
                            "action_type_id": $('#typeActionId').val(),
                            "action_sub_type_id": $('#actionSubTypeId').val(),
                            "comment": $('#newActionComment').val(),
                            "author_id": $.Oda.Session.id
                        });

                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Planning.submitAction : " + er.message);
                        return null;
                    }
                },
                /**
                 * @returns {$.Oda.App.Controller.Planning}
                 */
                cancelAction: function () {
                    try {
                        $('#divActionNew').hide();
                        $('#newActionComment').empty();
                        $('#downCount').html(255);
                        $.Oda.Display.render({
                            "id": "divBtActionNew",
                            "html": '<button type="button" oda-label="planning.actionNew" onclick="$.Oda.App.Controller.Planning.formAction();" class="btn btn-primary">actionNew</button>'
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Planning.cancelAction : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} p_params
                 * @param p_params.id
                 * @returns {$.Oda.App.Controller.Planning}
                 */
                removeAction: function (params) {
                    try {
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/actions/"+params.id, {type:'DELETE',callback : function(response){
                            $.Oda.App.Controller.Planning.displayAction();
                        }});
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Planning.removeAction : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} p_params
                 * @param p_params.start
                 * @param p_params.end
                 * @returns {$.Oda.App.Controller.Planning}
                 */
                calcTrajet: function (p_params) {
                    try {
                        if($.Oda.Google.Map.service !== undefined){
                            var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/report/trajet/"+$.Oda.Session.id, {callback : function(response){
                                var distanceTotal = 0;
                                var durationTotal = 0;
                                var trajetUnknow = {
                                    address_id_ori: 0,
                                    addresse_label_ori: "",
                                    address_id_dest: 0,
                                    address_label_dest: ""
                                }
                                var trajets = response.data;
                                for(var index in trajets){
                                    var trajet = trajets[index];
                                    if(trajet.distance !== null){
                                        distanceTotal += parseInt(trajet.distance_m);
                                        durationTotal += parseInt(trajet.duration_s);
                                    }else if(trajetUnknow.address_id_ori === 0){
                                        trajetUnknow.address_id_ori = trajet.address_id_ori;
                                        trajetUnknow.address_label_ori = trajet.address_label_ori;
                                        trajetUnknow.address_id_dest = trajet.address_id_dest;
                                        trajetUnknow.address_label_dest = trajet.address_label_dest;
                                    }
                                }
                                var hours = Math.floor(durationTotal / 60 / 60);
                                var minute = Math.ceil((durationTotal - (hours*60*60)) / 60);
                                var displayDistance = distanceTotal / 1000;
                                $('#trajetInfo').html('Temps de trajet : '+hours+'h'+minute+'m, distance parcouru : '+ displayDistance+'km')
                                if(trajetUnknow.address_id_ori !== 0){
                                    $.Oda.Google.Map.service.getDistanceMatrix({
                                        origins: [trajetUnknow.address_label_ori],
                                        destinations: [trajetUnknow.address_label_dest],
                                        travelMode: google.maps.TravelMode.BICYCLING
                                    }, function(responseMap, status){
                                        var responseMap = responseMap.rows[0].elements[0];
                                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/address/trajet/", {type:"POST", callback : function(response){
                                            $.Oda.App.Controller.Planning.calcTrajet({
                                                "start": p_params.start,
                                                "end": p_params.end
                                            });
                                        }},{
                                            address_id_ori: trajetUnknow.address_id_ori,
                                            address_id_dest: trajetUnknow.address_id_dest,
                                            distance: responseMap.distance.text,
                                            distance_m: responseMap.distance.value,
                                            duration: responseMap.duration.text,
                                            duration_s: responseMap.duration.value
                                        });
                                    });
                                }
                            }},{
                                "start": p_params.start,
                                "end": p_params.end
                            });
                        }
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Planning.calcTrajet : " + er.message);
                        return null;
                    }
                },
            },
            SynthUserPatient: {
                /**
                 * @returns {$.Oda.App.Controller.SynthUserPatient}
                 */
                start: function () {
                    try {
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/patient/", {callback : function(response){
                            $.Oda.App.Controller.Planning.patients = response.data;
                            for(var index in response.data){
                                var elt = response.data[index];
                                if(elt.active === '1'){
                                    $('#patientId').append('<option value="'+ elt.id +'">' + elt.name_first + ' ' + elt.name_last + ( (elt.address_id_default===null)?' (Pas d\'adresse)':'' ) + '</option>')
                                }
                            }
                        }});

                        $.Oda.Scope.Gardian.add({
                            id : "gSynth",
                            listElt : ["patientId", "week"],
                            function : function(e){
                                var $week = $('#week');
                                var $patientId = $('#patientId');
                                if( ($patientId.data("isOk")) && ($week.data("isOk")) ){
                                    var dateStart = moment($week.val()).startOf('week').format('YYYY-MM-DD');
                                    var dateEnd = moment($week.val()).endOf('week').format('YYYY-MM-DD');
                                    var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/report/synth_user_patient", {callback : function(response){
                                        var strHtml = $.Oda.Display.TemplateHtml.create({
                                            template : "tlpSynth"
                                            , scope : {
                                                start: moment(dateStart).format('DD/MM/YYYY'),
                                                end: moment(dateEnd).format('DD/MM/YYYY'),
                                                patient: response.data.patientInfo.name_first + " " + response.data.patientInfo.name_last,
                                                user: response.data.userInfo.name_first + " " + response.data.userInfo.name_last,
                                                time: $.Oda.Date.convertSecondsToTime(response.data.time)
                                            }
                                        });
                                        $("#btDlPdf").remove();
                                        $("#report").html(strHtml);

                                        var strPatientCode = response.data.patientInfo.name_last.substr(0,2).toUpperCase() + response.data.patientInfo.name_first.substr(0,2).toUpperCase();
                                        $("#report").after('<button id="btDlPdf" type="button" onclick="$.Oda.App.Controller.SynthUserPatient.getPdfReport({patientCode:\''+strPatientCode+'\'});" class="btn btn-info">'+$.Oda.I8n.getByString('synth_user_patient.pdf')+'</button>');

                                        for(var indexDate in response.data.dates){
                                            var elt = response.data.dates[indexDate];
                                            var colored = indexDate % 2;
                                            var strHtmlDate = '<tr '+(colored?'class="rowColored"':'')+'><td style="font-weight: bold;">'+moment(elt.date).format('DD/MM/YYYY')+'</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';

                                            $('#tabSynth > tbody:last-child').append(strHtmlDate);

                                            for(var indexEvent in elt.events){
                                                var event = elt.events[indexEvent];
                                                var strHtmlEvent = '<tr '+(colored?'class="rowColored"':'')+'><td></td><td>'+$.Oda.Date.convertSecondsToTime(event.time)+'</td><td>'+moment(event.start).format('HH:mm')+'</td><td>'+moment(event.end).format('HH:mm')+'</td><td></td><td></td><td>'+event.note+'</td></tr>';

                                                $('#tabSynth > tbody:last-child').append(strHtmlEvent);

                                                for(var indexActions in event.actions){
                                                    var action = event.actions[indexActions];
                                                    var strHtmlEvent = '<tr '+(colored?'class="rowColored"':'')+'><td></td><td></td><td></td><td></td><td>'+action.actions_type+'</td><td>'+action.actions_sub_type+'</td><td>'+action.comment+'</td></tr>';

                                                    $('#tabSynth > tbody:last-child').append(strHtmlEvent);
                                                }
                                            }

                                        }
                                    }},{
                                        userId: $.Oda.Session.id,
                                        patientId: $patientId.val(),
                                        dateStart: dateStart,
                                        dateEnd: dateEnd
                                    });
                                }else{
                                    $("#btDlPdf").remove();
                                    $("#report").html('');
                                }
                            }
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.SynthUserPatient.start : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {object} p_params
                 * @param p_params.patientCode
                 * @returns {$.Oda.App.Controller.synthUserPatient}
                 */
                getPdfReport: function (p_params) {
                    try {
                        $.Oda.Display.Notification.info($.Oda.I8n.get('synth_user_patient','waitingDl'));

                        var pdf = new jsPDF('p', 'pt', 'a4');
                        var margins = {
                            top: 80,
                            bottom: 60,
                            left: 40,
                            width: 522
                        };
                        var source = $('#report').html();
                        pdf.fromHTML(
                            source,
                            margins.left,
                            margins.top,
                            {
                                width: margins.width,
                                pagesplit: true
                            },
                            function (dispose) {
                                var currentTime = new Date();
                                var annee = currentTime.getFullYear();
                                var mois = $.Oda.Tooling.pad2(currentTime.getMonth()+1);
                                var jour = $.Oda.Tooling.pad2(currentTime.getDate());
                                var strDate = annee + mois + jour;
                                pdf.save('synth_'+ $.Oda.Session.code_user + '_' + p_params.patientCode + '_' + strDate + '.pdf');
                            },
                            margins
                        );
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.synthUserPatient.getPdfReport : " + er.message);
                        return null;
                    }
                },
            },
            ReportDetailMonth: {
                /**
                 * @returns {$.Oda.App.Controller.ReportDetailMonth}
                 */
                start: function () {
                    try {
                        $.Oda.Scope.Gardian.add({
                            id: "gMonth",
                            listElt: ["month"],
                            function: function (e) {
                                var $month = $('#month');
                                if($month.val() !== ""){
                                    $.Oda.Display.loading({elt : $('#reportMonth')});
                                    
                                    var dateStart = $month.val() + "-01";
                                    var dateEnd = moment($month.val()).endOf('month').format('YYYY-MM-DD');

                                    var week = {
                                        monday: null,
                                        sunday:  null
                                    };

                                    var monday = new Date(dateStart);
                                    while(monday.getDay() !== 1){
                                        monday.setDate(monday.getDate()-1);
                                    }
                                    monday = moment(monday);
                                    week.monday = monday.format('YYYY-MM-DD');
                                    week.sunday = monday.add(6, 'days').format('YYYY-MM-DD');

                                    var listWeek = [week];

                                    var ok = true;
                                    var index = 0;
                                    while ((index < 6) && ok){
                                        var lastMonday = moment(listWeek[listWeek.length-1].monday);
                                        var week = {
                                            monday: lastMonday.add(7, 'days').format('YYYY-MM-DD'),
                                            sunday: lastMonday.add(6, 'days').format('YYYY-MM-DD')
                                        };
                                        if((week.monday.indexOf($month.val()) > -1) || (week.sunday.indexOf($month.val()) > -1)){
                                            listWeek.push(week);
                                        }else{
                                            ok = false;
                                        }
                                        index++;
                                    }

                                    listWeek[0].monday = dateStart;
                                    listWeek[listWeek.length-1].sunday = dateEnd;
                                    
                                    var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/report/count_time/"+$.Oda.Session.id, {
                                        context: {
                                            dateStart: dateStart,
                                            dateEnd: dateEnd
                                        },
                                        callback: function(response){
                                            var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/report/trajet/"+$.Oda.Session.id, {
                                                context: {
                                                    dateStart: response.context.dateStart,
                                                    dateEnd: response.context.dateEnd,
                                                    patientTime: response.data
                                                },
                                                callback : function(response){
                                                    var trajet = $.Oda.App.Tooling.calcReportTrajet({listTrajet: response.data});

                                                    var strHtml = $.Oda.Display.TemplateHtml.create({
                                                        template : "tlpReportMonth"
                                                        , scope : {
                                                            dateStart: response.context.dateStart,
                                                            dateEnd: response.context.dateEnd,
                                                            patientTime: response.context.patientTime,
                                                            trajetTime: trajet.timeDisplay,
                                                            distance: trajet.distanceDisplay
                                                        }
                                                    });
                                                    $('#reportMonth').html(strHtml);
                                                }
                                            },{
                                                start: response.context.dateStart,
                                                end: response.context.dateEnd
                                            });
                                        }
                                    },{
                                        start: dateStart,
                                        end: dateEnd
                                    });

                                    $('#reportListWeek').html('');
                                    for(var index in listWeek){
                                        var week = listWeek[index];
                                        $('#reportListWeek').append('<div id="week-'+index+'"></div><br>');
                                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/report/count_time/"+$.Oda.Session.id, {
                                            context: {
                                                start: week.monday,
                                                end: week.sunday,
                                                weekIndex: index
                                            },
                                            callback : function(response){
                                                var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/report/trajet/"+$.Oda.Session.id, {
                                                    context: {
                                                        start: response.context.start,
                                                        end: response.context.end,
                                                        weekIndex: response.context.weekIndex,
                                                        patientTime: response.data
                                                    },
                                                    callback : function(response){
                                                        var trajet = $.Oda.App.Tooling.calcReportTrajet({listTrajet: response.data});

                                                        var strHtml = $.Oda.Display.TemplateHtml.create({
                                                            template : "tlpReportWeek"
                                                            , scope : {
                                                                dateStart: response.context.start,
                                                                dateEnd: response.context.end,
                                                                patientTime: response.context.patientTime,
                                                                trajetTime: trajet.timeDisplay,
                                                                distance: trajet.distanceDisplay,
                                                                weekIndex: response.context.weekIndex
                                                            }
                                                        });
                                                        $('#week-'+response.context.weekIndex).html(strHtml);
                                                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/event/search/user/"+$.Oda.Session.id, {
                                                            context: {
                                                                weekIndex: response.context.weekIndex
                                                            },
                                                            callback : function(response){
                                                                var strHtml = "<ul>";

                                                                for(var index in response.data){
                                                                    var event = response.data[index];
                                                                    strHtml += $.Oda.Display.TemplateHtml.create({
                                                                        template : "tlpReportWeekDetailEvent"
                                                                        , scope : {
                                                                            start: event.start,
                                                                            end: event.end,
                                                                            countTime: event.countTime,
                                                                            firstName: event.patient_name_first,
                                                                            lastName: event.patient_name_last,
                                                                        }
                                                                    });
                                                                }

                                                                strHtml += "</ul>";
                                                                $('#weekListDetail-'+response.context.weekIndex).html(strHtml);
                                                            }
                                                        },{
                                                            start: response.context.start,
                                                            end: response.context.end
                                                        });
                                                    }
                                                },{
                                                    start: response.context.start,
                                                    end: response.context.end
                                                });
                                            }
                                        },{
                                            start: week.monday,
                                            end: week.sunday
                                        });
                                    }
                                }

                                $("#btPdf").html('<br><button id="btDlPdf" type="button" onclick="$.Oda.App.Controller.ReportDetailMonth.getPdfReport({month:\''+$month.val()+'\'});" class="btn btn-info">'+$.Oda.I8n.getByString('synth_user_patient.pdf')+'</button>');
                            }
                        });
                        
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.ReportDetailMonth.start : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {object} p_params
                 * @param p_params.month
                 * @returns {$.Oda.App.Controller.ReportDetailMonth}
                 */
                getPdfReport: function (p_params) {
                    try {
                        $.Oda.Display.Notification.info($.Oda.I8n.get('synth_user_patient','waitingDl'));

                        var pdf = new jsPDF('p', 'pt', 'a4');
                        var margins = {
                            top: 80,
                            bottom: 60,
                            left: 40,
                            width: 522
                        };
                        var source = $('#report').html();
                        source = '<h1>Rapport détaillé pour ' + $.Oda.Session.code_user + ' ' + p_params.month +'</h1>' + source;
                        pdf.fromHTML(
                            source,
                            margins.left,
                            margins.top,
                            {
                                width: margins.width,
                                pagesplit: true
                            },
                            function (dispose) {
                                var currentTime = new Date();
                                var annee = currentTime.getFullYear();
                                var mois = $.Oda.Tooling.pad2(currentTime.getMonth()+1);
                                var jour = $.Oda.Tooling.pad2(currentTime.getDate());
                                var strDate = annee + mois + jour;
                                pdf.save('reportMonth-'+ $.Oda.Session.code_user + '_' + p_params.month + '.pdf');
                            },
                            margins
                        );
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.ReportDetailMonth.getPdfReport : " + er.message);
                        return null;
                    }
                }
            }
        },
        
        Tooling: {
            /**
             * @param {Object} p_params
             * @param p_params.listTrajet
             * @returns {$.Oda.App}
             */
            calcReportTrajet : function (p_params) {
                try {
                    var response = {
                        time: 0,
                        timeDisplay: '0h0m',
                        distance: 0,
                        distanceDisplay: '0km'
                    };

                    for(var index in p_params.listTrajet){
                        var trajet = p_params.listTrajet[index];
                        if(trajet.distance !== null){
                            response.distance += parseInt(trajet.distance_m);
                            response.time += parseInt(trajet.duration_s);
                        }
                    }

                    var hours = Math.floor(response.time / 60 / 60);
                    var minute = Math.ceil((response.time - (hours*60*60)) / 60);
                    var distanceKm = response.distance / 1000;

                    response.timeDisplay = hours+'h'+minute+'m';
                    response.distanceDisplay = distanceKm+'km';

                    return response;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.App.Tooling.calcReportTrajet : " + er.message);
                    return null;
                }
            },
        }
    };

    // Initialize
    _init();

})();