$(document).off('change', '.sort').on('change', '.sort', function () {
    let sortField = this.value
    let selected = $(this).find(':selected')
    let sortOrder = $(this).find(':selected').data('sorting')
    
    let url = `/?sortField=${sortField}&sortOrder=${sortOrder}`
    if ($('.type').val()) {
        url += `&${$('.type').val()}`
    }

    if ($('.searchValue').val()) {
        url += `&search=${$('.searchValue').val()}`
    }

    $this = $(this)
    $.ajax({
        type: "GET",
        url: `${url}`,
        success: function (data) {
            // $(".bodyDiv").empty()
            $(".bodyDiv").html(data)
            let newSortOrder = (sortOrder == "1") ? "-1" : "1";
            selected.data('sorting', newSortOrder)
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
            console.log(data);
            console.log("$this.data('sort-order')",$this.data('sort-order'));
            $(".bodyDiv").html(data)
            let newSortOrder = (sortOrder == 1) ? -1 : 1;
            console.log("$this.data('sort-order', newSortOrder)",$this.data('sort-order',newSortOrder))
            console.log("newSortOrder",newSortOrder);
            
        },
        error: function (data) {
            alert("Error from on click")
        }
    })
});