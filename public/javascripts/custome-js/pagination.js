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
    $.ajax({
        type: "GET",
        url: `${url}`,
        success: function (data) {
            console.log(pageValue);
            $(".bodyDiv").empty()
            $(".bodyDiv").html(data)
        },
        error: function (data) {
            alert("Error from on Pagination")
        }
    })
});