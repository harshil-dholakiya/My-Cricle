$(document).off('keyup', '#searchBarValue').on('keyup', '#searchBarValue', function () {
    let serachValue = $("#searchBarValue").val()
    console.log(serachValue)
    if (serachValue.length > 0) {
        $.ajax({
            type: "GET",
            url: `/users/userList/?search=${serachValue}`,
            success: function (data) {
                console.log(data);
                $(".bodyDiv").html(data)
            },
            error: function (data) {
                alert("Error from UserSearch")
            }
        })
    }
});