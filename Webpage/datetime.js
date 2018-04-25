jQuery(function () {
	jQuery('#startDate').datetimepicker();
	jQuery('#endDate').datetimepicker();
	jQuery("#startDate").on("dp.change",function (e) {
        jQuery('#endDate').data("DateTimePicker").setMinDate(e.date);
	});
	jQuery("#endDate").on("dp.change",function (e) {
        jQuery('#startDate').data("DateTimePicker").setMaxDate(e.date);
	});
});