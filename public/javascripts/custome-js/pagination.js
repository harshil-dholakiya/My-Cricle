$(document).off('click', '.pages').on('click', '.pages', function () {
    let pageValue = $(this).data('page-value')

    let url = `/?pageValue=${pageValue}`

    if ($('.sortType').val()) {
        url += `&${$('.sortType').val()}`
    }

    if ($('.type').val()) {
        url += `&${$('.type').val()}`
    }

    if ($('.rounded').val()) {
        url += `&search=${$('.rounded').val()}`
    }

    if ($('.savePost').val()) {
        url += `${$('.savePost').val()}`
    }

    $.ajax({
        type: "GET",
        url: `${url}`,
        success: function (data) {
            $(".bodyDiv").html(data)
        },
        error: function (data) {
            alert("Error from Pagination")
        }
    })
});


$(document).off('click', '.userPages').on('click', '.userPages', function () {
    let pageValue = $(this).data('page-value')

    let url = `/users/userList/?pageValue=${pageValue}`
    if ($("#userSearchBarValue").val()) {
        url += $("#userSearchBarValue").val()
    }
    // console.log(url);
    $.ajax({
        type: "GET",
        url: `${url}`,
        success: function (data) {
            $(".bodyDiv").html(data)
        },
        error: function (data) {
            alert("Error from Users Pagination")
        }
    })
});