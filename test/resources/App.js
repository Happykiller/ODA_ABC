module( "App" );

test( "$.Oda.App.Controller.Planning.getDateGoole", function() {
    equal($.Oda.App.Controller.Planning.getDateGoole("2015-12-03 05:00:00"), "2015-12-03T05:00:00.000", "Test OK : Passed!" );
});