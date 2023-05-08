$(document).ready(function () {
    $(document).off("click", ".archivePostDiv").on('click', ".archivePostDiv", function () {
        let archiveOrNot = $(this).parent().data('archive')
        let $this = $(this);
        let postId = $(this).data("id")
        if (archiveOrNot == "unarchive") {
            $.ajax({
                url: '/posts/archivePost',
                type: 'put',
                data: {
                    "postId": postId,
                    "archiveOrNot": archiveOrNot
                },
                success: function (data) {
                    $this.html(`
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-exposure-off" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M4.6 19.4l7.4 -7.4m2 -2l5.4 -5.4"></path>
                    <path d="M8 4h10a2 2 0 0 1 2 2v10m-.586 3.414a2 2 0 0 1 -1.414 .586h-12a2 2 0 0 1 -2 -2v-12c0 -.547 .22 -1.043 .576 -1.405"></path>
                    <path d="M7 9h2v2"></path>
                    <path d="M13 16h3"></path>
                    <path d="M3 3l18 18"></path>
                    </svg>
                    `).parent().data('unarchive', 'archive')
                    if (data.type == "success") {
                        $this.closest(".grandParent").hide()
                        location.reload();
                    }
                },
                error: function (data) {
                    location.href = "/sign-in"
                }
            });
        }
    })
})