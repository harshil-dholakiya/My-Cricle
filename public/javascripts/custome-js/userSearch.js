$(document).off('keyup', '#searchBarValue').on('keyup', '#searchBarValue', function () {
    let serachValue = $("#searchBarValue").val()
    serachValue.trim()
    $this = $(this)
    // $(this).next('#userSearchBarValue')
    if (serachValue.length > 0) {
        $.ajax({
            type: "GET",
            url: `/users/userList/?search=${serachValue}`,
            success: function (data) {
                $this.next("#userSearchBarValue").val(`&?search=${serachValue}`)
                $(".bodyDiv").html(data)
            },
            error: function (data) {
                alert("Error from UserSearch")
            }
        })
    }
});


// userSearchBarValue