QUnit.module( "App" );

QUnit.test( "$.Oda.App.Controller.Planning.getDateGoole", function(assert) {
    assert.equal($.Oda.App.Controller.Planning.getDateGoole("2015-12-03 05:00:00"), "2015-12-03T05:00:00.000", "Test OK : Passed!" );
});

QUnit.test( "$.Oda.App.Tooling.calcReportTrajet", function(assert) {
    var inputs = [{"event_id_ori":"472","address_id_ori":"6","address_label_ori":"7 rue Leroy Grenoble 38100 france","start_ori":"2016-05-09 10:00:00","event_id_dest":"471","address_id_dest":"1","address_label_dest":"46 rue l\u00e9on jouhaux grenoble 38100 france","start_dest":"2016-05-09 11:00:00","distance":"0,6 km","distance_m":"552","duration":"2 minutes","duration_s":"119"}];
    var expected = {"distance": 552,
        "distanceDisplay": "0.552km",
        "time": 119,
        "timeDisplay": "0h2m"
    };

    assert.deepEqual($.Oda.App.Tooling.calcReportTrajet({listTrajet: inputs}), expected, "Test with good datas" );
});

QUnit.test( "$.Oda.App.Controller.Planning.calcListDate", function(assert) {
    var inputs = {
        id: 826,
        address_id: "19",
        patient_id: "15",
        date: "2016-09-16",
        startHours : "15",
        startMinutes : "00",
        endHours: "16",
        endMinutes: "00",
        start : "2016-09-17",
        end: "2016-10-01",
        monday: true,
        tuesday: false,
        wednesday: true,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
        loop: 3
    };
    var expected = ["2016-09-19", "2016-09-21", "2016-09-26", "2016-09-28", "2016-10-03", "2016-10-05"];
    assert.deepEqual($.Oda.App.Controller.Planning.calcListDate(inputs), expected, "Test OK : Passed!" );

    var inputs = {
        id: 826,
        address_id: "19",
        patient_id: "15",
        date: "2016-09-16",
        startHours : "15",
        startMinutes : "00",
        endHours: "16",
        endMinutes: "00",
        start : "2016-09-17",
        end: "2016-09-27",
        monday: true,
        tuesday: false,
        wednesday: true,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
        loop: 0
    };
    var expected = ["2016-09-19", "2016-09-21", "2016-09-26"];
    assert.deepEqual($.Oda.App.Controller.Planning.calcListDate(inputs), expected, "Test OK : Passed!" );

    var inputs = {
        id: 826,
        address_id: "19",
        patient_id: "15",
        date: "2016-09-16",
        startHours : "15",
        startMinutes : "00",
        endHours: "16",
        endMinutes: "00",
        start : "2016-09-17",
        end: "2016-09-27",
        monday: true,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: true,
        loop: 2
    };
    var expected = ["2016-09-19", "2016-09-25", "2016-09-26", "2016-10-02"];
    assert.deepEqual($.Oda.App.Controller.Planning.calcListDate(inputs), expected, "Test OK : Passed!" );
});