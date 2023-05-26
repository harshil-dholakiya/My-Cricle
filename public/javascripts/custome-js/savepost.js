$(document).ready(function () {
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "1000",
        "hideDuration": "1000",
        "timeOut": "1000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }

    const loginUserId = $("#loginUserId").data('login-user-id')
    const groupId = $("#loginUserId").data('groupid')

    const socket = io({
        query: { userid: loginUserId, groupid: groupId },
    });

    socket.on('connectToRoom', function (data) {
        console.log(`${loginUserId}`, data);
    });

    socket.on('newNotification', function (data) {
        toastr.info(`${data}`);
    });

    socket.on('savedPostCount', function (data) {
        data = JSON.parse(data);
        for (const [key, value] of Object.entries(data)) {
            $(`#${key}`).parents('.card-body').find(".savedPostCountClass").html(value)
        }
    });

    socket.on('notificationCount', function (data) {
        data = JSON.parse(data);
        $(".notificationPrepend").prepend(`<div class="list-group-item notification" id="${data.likedBy}${data.postId}" style="background-color: #add8e6;">
                                                <div class="row align-items-center">
                                                    <div class="col-auto"><span class="status-dot status-dot-animated bg-primary d-block"></span></div>
                                                        <div class="col text-truncate">
                                                            <a href="#" class="text-body d-block showPost" data-userpost-id="${data.likedBy}${data.postId}" data-notification-post-id=${data.postId}>${data.likedUserName}</a>
                                                                <div class="d-block text-muted text-truncate mt-n1">
                                                                    Liked Your Post ${data.createdOn}
                                                                </div>
                                                        </div>
                                                    <div class="col-auto">
                                                            <a href="#" class="list-group-item-actions show">
                                                                <button type="button" class="btn-close notificaton-close" data-close-id=${data.postId} data-bs-dismiss="modal"
                                                                        aria-label="Close"></button>
                                                            </a>
                                                    </div>
                                                </div>
                                            </div>`)

        $("#notificationCount").html(`${data.notificationCount}`)
    });

    $(document).off("click", ".save-post").on('click', ".save-post", function () {
        let title = $(this).parent().data('title')
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
                    </svg><p class="ms-1 savedPostCountClass">${$($this).parents('.card-body').find(".savedPostCountClass").html(Number($($this).parents('.card-body').find(".savedPostCountClass").html()) + 1)}</p>
                    `).parent().data('title', 'Unsave')
                    // $($this).parents('.card-body').find(".savedPostCountClass").html(Number($($this).parents('.card-body').find(".savedPostCountClass").html()) + 1)

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
                    // $likePostCount = $(this).next().html($(this).next().html() - 1)
                    $this.html(`
                    <svg xmlns="http://www.w3.org/2000/svg"
                    class="icon icon-tabler icon-tabler-heart" width="24" height="24"
                    viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path
                    d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572">
                    </path>
                    </svg><p class="ms-1 savedPostCountClass">${$($this).parents('.card-body').find(".savedPostCountClass").html(Number($($this).parents('.card-body').find(".savedPostCountClass").html()) - 1)}</p>
                    `).parent().data('title', 'Save')
                    // $($this).parents('.card-body').find(".savedPostCountClass").html(Number($($this).parents('.card-body').find(".savedPostCountClass").html()) - 1)
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

$(document).off("click", ".disabled").on('click', ".disabled", function () {
    toastr.info(`You can only see Likeed count of your post !`);
})