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
        "timeOut": "2000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }

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
            var form = $('form#addPostForm')[0];
            var formData = new FormData(form);
            $.ajax({
                url: '/posts/add-post',
                type: 'post',
                data: formData,
                contentType: false,
                processData: false,
                success: function (data) {
                    if (data.type == "error") {
                        $("#postImage").css("border", 'solid 1px red');
                        $(`.toggle`).css('display', '')
                    }
                    if (data.type == "tooLarge") {
                        $("#postImage").css("border", 'solid 1px red');
                        $(`.fileSizeValidator`).css('display', '')
                    }
                    if (data.type == "success") {
                        toastr.success('Post Added Successfully !!');
                        $('#modal-report').modal('hide')

                    }
                },
                error: function () {
                }
            })
        }
    })
});

const socket = io("http://localhost:4000");
socket.on('connectToRoom',function(){
    // console.log(socket.id)
 });