$(document).off('change', '.filter').on('change', '.filter', function () {
    let filterType = this.value

    let url = `/?type=${filterType}`
    if ($('.sortType').val()) {
        url += `&${$('.sortType').val()}`
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
            $this.next().val(`type=${filterType}`)
        },
        error: function (data) {
            alert("Error from on click")
        }
    })
});

$(document).off('click', '.savedPost').on('click', '.savedPost', function () {

    let url = `/?savedPost=savedPost`
    if ($('.searchValue').val()) {
        url += `&search=${$('.searchValue').val()}`
    }
    $this = $(this)
    
    $.ajax({
        type: "GET",
        url: `${url}`,
        success: function (data) {
            $(".bodyDiv").html(data)
            $this.next().val(`&savedPost=savedPost`)
        },
        error: function (data) {
            alert("Error from on click")
        }
    })
});

$(document).off('keyup', '.searchValue').on('keyup', '.searchValue', function () {
    let serachValue = $(".searchValue").val()
    serachValue.trim()

    let url = `/?search=${serachValue}`
    if ($('.savePost').val()) {
        url += `${$('.savePost').val()}`
    }

    if ($('.sortType').val()) {
        url += `&${$('.sortType').val()}`
    }

    if ($('.savedPost').val()) {
        url += `&${$('.savedPost').val()}`
    }

    if ($('.type').val()) {
        url += `&${$('.type').val()}`
    }
    $this = $(this)
    $.ajax({
        type: "GET",
        url: `${url}`,
        success: function (data) {
            // $(".bodyDiv").empty()
            $(".bodyDiv").html(data)
        },
        error: function (data) {
            alert("Error from Search")
        }
    })
});