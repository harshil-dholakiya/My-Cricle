$(document).ready(function () {
    $(document).off("click", ".save-post").on('click', ".save-post", function () {
        let title = $(this).parent().data('title')
        // let savedPostCount = $(this).parents('.card-body').find(".savedPostCountClass").html()
        let $this = $(this);
        let postId = $(this).data("id")
        if (title == "Save") {
            $.ajax({
                url: '/posts/savePost',
                type: 'put',
                data: {
                    "postId": postId,
                    "title": title
                },
                success: function (data) {
                    $this.html(`
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler text-blue icon-tabler-heart-filled" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M6.979 3.074a6 6 0 0 1 4.988 1.425l.037 .033l.034 -.03a6 6 0 0 1 4.733 -1.44l.246 .036a6 6 0 0 1 3.364 10.008l-.18 .185l-.048 .041l-7.45 7.379a1 1 0 0 1 -1.313 .082l-.094 -.082l-7.493 -7.422a6 6 0 0 1 3.176 -10.215z" stroke-width="0" fill="currentColor"></path>
                    </svg>
                    `).parent().data('title', 'Unsave')
                    $($this).parents('.card-body').find(".savedPostCountClass").html(Number($($this).parents('.card-body').find(".savedPostCountClass").html()) + 1)
                    if (data.type == "error") {
                        location.href = '/sign-in'
                    }
                },
                error: function (data) {
                    location.href = "/sign-in"
                }
            });
        }
        if (title == "Unsave") {
            $.ajax({
                url: '/posts/savePost',
                type: 'put',
                data: {
                    "postId": postId,
                    "title": title
                },
                success: function (data) {
                    $this.html(`
                    <svg xmlns="http://www.w3.org/2000/svg"
                    class="icon icon-tabler icon-tabler-heart" width="24" height="24"
                    viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path
                    d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572">
                    </path>
                    </svg>
                    `).parent().data('title', 'Save')
                    $($this).parents('.card-body').find(".savedPostCountClass").html(Number($($this).parents('.card-body').find(".savedPostCountClass").html()) - 1)
                    if (data.type == "error") {
                        alert("Error From Unsave")
                    }
                },
                error: function (data) {
                    location.href = "/sign-in"
                }
            });
        }
    });
});