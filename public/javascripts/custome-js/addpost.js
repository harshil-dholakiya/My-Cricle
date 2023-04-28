$(document).ready(function () {
    $('#addPostForm').validate({
        rules: {
            title: {
                required: true,
                maxlength: 30
            },
            description: {
                required: true,
                maxlength: 300
            },
            postImage: {
                required: true,
            }
        },
        messages: {
            title: {
                required: "Please enter Post title",
                maxlength: "Title Must Contain 30 letter"
            },
            description: {
                required: "Please enter Post description",
                maxlength: "description Must Contain 300 letter"

            },
            postImage: {
                required: "Please select an image to upload"
            }
        },

        submitHandler: function (form) {
            var form = $('form')[0];
            var formData = new FormData(form);
            $.ajax({
                url: '/posts/add-post',
                type: 'post',
                data: formData,
                contentType: false,
                processData: false,
                success: function (data) {
                    console.log("data",data)
                    if (data.type == "error") {
                        $("#postImage").css("border", 'solid 1px red');
                        $(`.toggle`).css('display' , '')
                    }
                    if (data.type == "tooLarge") {
                        $("#postImage").css("border", 'solid 1px red');
                        $(`.fileSizeValidator`).css('display' , '')
                    }
                    if (data.type == "success") {
                        location.href = "/"
                    }
                },
                error: function () {
                }
            })
        }
    })
});


