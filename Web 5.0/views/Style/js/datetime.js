
 var dateToday = new Date();

$(function () {
        $('#datetimepicker6').datetimepicker({
            minDate: dateToday
        });
        $('#datetimepicker7').datetimepicker({
            minDate: dateToday,
            useCurrent: false //Important! See issue #1075
        });
        $("#datetimepicker6").on("dp.change", function (e) {
            $('#datetimepicker7').data("DateTimePicker").minDate(e.date);
        });
        $("#datetimepicker7").on("dp.change", function (e) {
            $('#datetimepicker6').data("DateTimePicker").maxDate(e.date);
        });
    });