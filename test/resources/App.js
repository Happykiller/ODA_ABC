module( "App" );

test( "$.Oda.App.Controller.Planning.getDateGoole", function() {
    equal($.Oda.App.Controller.Planning.getDateGoole("2015-12-03 05:00:00"), "2015-12-03T05:00:00.000", "Test OK : Passed!" );
});

test( "$.Oda.App.Tooling.calcReportTrajet", function() {
    var inputs = [{"event_id_ori":"472","address_id_ori":"6","address_label_ori":"7 rue Leroy Grenoble 38100 france","start_ori":"2016-05-09 10:00:00","event_id_dest":"471","address_id_dest":"1","address_label_dest":"46 rue l\u00e9on jouhaux grenoble 38100 france","start_dest":"2016-05-09 11:00:00","distance":"0,6 km","distance_m":"552","duration":"2 minutes","duration_s":"119"}];
    var expected = {"distance": 552,
        "distanceDisplay": "0.552km",
        "time": 119,
        "timeDisplay": "0h2m"
    };

    deepEqual($.Oda.App.Tooling.calcReportTrajet({listTrajet: inputs}), expected, "Test with good datas" );
});