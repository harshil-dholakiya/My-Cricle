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
            $.ajax({
                url: '/users/comments',
                type: 'post',
                success: function (data) {
                   
                },
                error: function () {
                }
            })
        }
    })
});
