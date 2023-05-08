$(document).off('click', '.report').on('click', '.report', function () {
    $.ajax({
        type: "GET",
        url: `users/report`,
        success: function (data) {
            $(".bodyDiv").empty()
            $(".bodyDiv").html(data)
        },
        error: function (data) {
            alert("Error from on Pagination")
        }
    })
})