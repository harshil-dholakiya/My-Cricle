$(document).off('click', '.all').on('click', '.all', function () {
    $.ajax({
        type: "GET",
        url: `/`,
        success: function (data) {
            $(".bodyDiv").html(data)
        },
        error: function (data) {
            alert("Error from on click")
        }
    })
});