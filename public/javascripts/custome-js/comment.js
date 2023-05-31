socket.on('newCommentAdded', function (data) {
    data = JSON.parse(data);
    $(`#${data.postId}`).find('.commentCountClass').html(data.commentCounts)
});

$(document).ready(function () {
    $('#commentForm').validate({
        rules: {
            message: {
                required: true,
                maxlength: 30
            },
        },
        messages: {
            message: {
                required: "Please Enter Comment",
                maxlength: "Comment Must Contain 30 letter"
            }
        },
        submitHandler: function () {
            let postId = $('#commentForm').find('#hidden').val()
            let commentMessage = $('#comment').val()
            $.ajax({
                url: `/users/comments/${postId}`,
                type: 'post',
                data: { 'commentMessage': commentMessage },
                success: function (data) {
                    $('#modal-comment').modal('hide');
                    $('#comment').val('')
                },
                error: function () {
                }
            })
        }
    })
});

$(document).off("click", '.comment').on('click', '.comment', function () {
    let postId = $(this).data('postid')
    let postPath = $(this).data('postimage')
    $('#modal-comment').find('#hidden').val(`${postId}`)
    $('#modal-comment').find('#postPhoto').attr('src', `/images/posts/${postPath}`)
    $('#modal-comment').modal('show');
    $.ajax({
        url: `/users/comments/${postId}`,
        type: 'get',
        success: function (data) {
            $('.commentMessageDiv').html(data)
        },
        error: function () {
        }
    })
})


$(document).off("click", '.deleteComment').on('click', '.deleteComment', function () {
    $('#modal-deleteBtn').modal('toggle')
    $deleteComment = $(this)
    $(".confrimDeleteBtn").off("click").on('click', function () {
        let postId = $('#modal-comment').find('#hidden').val()
        // console.log($(this).closest('tr'))
        // $this = 
        $.ajax({
            url: `/users/delete-comment/${postId}`,
            type: 'delete',
            success: function (data) {
                // console.log($this)
                $deleteComment.closest('tr').remove()
            },
            error: function () {
            }
        })
    })
})