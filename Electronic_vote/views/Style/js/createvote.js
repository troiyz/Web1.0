<script>
    $(document).ready(function () {
        var wrapper = $(".container1");
        var add_button = $(".add_form_field");

        $(add_button).click(function (e) {
            e.preventDefault();
            $(wrapper).append('<div><input type="text" name="nameCandidate"/><a href="#" class="delete">Delete</a></div>'); //add input box
        });
        $(wrapper).on("click", ".delete", function (e) {
            e.preventDefault(); $(this).parent('div').remove();
        })
    });
</script>