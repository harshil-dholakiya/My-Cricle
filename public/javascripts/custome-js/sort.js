$(document).off('change', '.sort').on('change', '.sort', function () {
    let sortField = this.value
    
    let url = `/?sortField=${sortField}&sortOrder=-1`
    if ($('.type').val()) {
        url += `&${$('.type').val()}`
    }

    if ($('.rounded').val()) {
        url += `&search=${$('.rounded').val()}`
    }

    $this = $(this)
    $.ajax({
        type: "GET",
        url: `${url}`,
        success: function (data) {
            $(".bodyDiv").html(data)
            $this.next().val(`sortField=${sortField}&sortOrder=-1`)
        },
        error: function (data) {
            alert("Error from on click")
        }
    })
});

$(document).off('click', '#dateSort').on('click', '#dateSort', function () {
    let dateSort = $("#dateSort").data('id')
    let sortOrder = $(this).data('sort-order')
    let $this = $(this);
    $.ajax({
        type: "GET",
        url: `/users/userList/?sortByDate=${dateSort}&sortOrder=${sortOrder}`,
        success: function (data) {
            $(".bodyDiv").html(data)
            let newSortOrder = (sortOrder == "1") ? "-1" : "1";
            $this.data('sort-order', newSortOrder)
        },
        error: function (data) {
            alert("Error from on click")
        }
    })
});