$(document).off('click', '.postImage').on('click', '.postImage', function () {
    $(this).next().css("display", "block")
    $(this).next().children('.img01').attr('height', '550px').attr('src', $(this).attr("src"))
});

$(document).off('click', '.close').on('click', '.close', function () {
    $(this).parents(".myModal").css("display", "none");
});